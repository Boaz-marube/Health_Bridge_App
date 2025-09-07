import { notificationService } from './notification.service'
import { businessHoursService } from './business-hours.service'
import { apiClient } from './api-client.service'

export interface AppointmentStatus {
  id: string
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled'
  scheduledTime: Date
  patientId: string
  doctorId: string
  missedReason?: 'no_show' | 'emergency' | 'illness' | 'other'
  priority?: 'normal' | 'high' | 'urgent'
  rescheduleCount?: number
}

class AppointmentStatusService {
  private checkInterval: NodeJS.Timeout | null = null
  private batchQueue: string[] = []
  private batchTimeout: NodeJS.Timeout | null = null
  private isProcessing = false

  startStatusMonitoring() {
    // Reduced frequency: Check every 15 minutes for better performance
    this.checkInterval = setInterval(() => {
      this.checkPastAppointments()
    }, 15 * 60 * 1000)
  }

  stopStatusMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  async checkPastAppointments() {
    if (this.isProcessing) return
    
    try {
      this.isProcessing = true
      
      // Only process during business hours
      if (!businessHoursService.shouldProcessMissedAppointments()) {
        return
      }

      const appointments = await this.getScheduledAppointments()
      const now = new Date()
      const gracePeriod = 30 * 60 * 1000 // 30 minutes in milliseconds
      const missedAppointments: AppointmentStatus[] = []

      for (const appointment of appointments) {
        const appointmentTime = new Date(appointment.scheduledTime)
        const timePassed = now.getTime() - appointmentTime.getTime()

        if (timePassed > gracePeriod && appointment.status === 'scheduled') {
          missedAppointments.push(appointment)
        }
      }

      // Batch process missed appointments
      if (missedAppointments.length > 0) {
        await this.batchMarkAsMissed(missedAppointments)
      }
    } catch (error) {
      console.error('Error checking past appointments:', error)
    } finally {
      this.isProcessing = false
    }
  }

  private async getScheduledAppointments(): Promise<AppointmentStatus[]> {
    try {
      return await apiClient.get<AppointmentStatus[]>('/appointments/scheduled')
    } catch (error) {
      console.warn('API unavailable, using localStorage fallback')
      const stored = localStorage.getItem('appointments')
      return stored ? JSON.parse(stored) : []
    }
  }

  private async batchMarkAsMissed(appointments: AppointmentStatus[]) {
    try {
      // Batch update appointment statuses with no-show reason
      const appointmentIds = appointments.map(apt => apt.id)
      await apiClient.patch('/appointments/batch-status', {
        appointmentIds,
        status: 'missed',
        missedReason: 'no_show',
        priority: 'high' // Give missed appointments high priority for rescheduling
      })

      // Batch create notifications
      const notifications = appointments.flatMap(appointment => [
        {
          userId: appointment.patientId,
          userType: 'patient' as const,
          title: 'Missed Appointment',
          message: 'You missed your scheduled appointment. Please contact staff to reschedule a new appointment.',
          type: 'appointment',
          priority: 'high' as const
        },
        {
          userId: 'staff',
          userType: 'staff' as const,
          title: 'Patient Missed Appointment',
          message: `Patient missed appointment scheduled for ${new Date(appointment.scheduledTime).toLocaleString()}. Follow up required.`,
          type: 'appointment',
          priority: 'medium' as const
        }
      ])

      await apiClient.post('/notifications/batch', { notifications })
      
      console.log(`Batch processed ${appointments.length} missed appointments`)
    } catch (error) {
      console.error('Batch processing failed, falling back to individual processing:', error)
      // Fallback to individual processing
      for (const appointment of appointments) {
        await this.markAsMissedFallback(appointment)
      }
    }
  }

  private async markAsMissedFallback(appointment: AppointmentStatus) {
    try {
      appointment.status = 'missed'
      appointment.missedReason = 'no_show'
      appointment.priority = 'high'
      await this.updateAppointmentStatus(appointment)

      await notificationService.createNotification({
        userId: appointment.patientId,
        userType: 'patient',
        title: 'Missed Appointment',
        message: 'You missed your scheduled appointment. Please contact staff to reschedule a new appointment.',
        type: 'appointment',
        priority: 'high'
      })

      await notificationService.createNotification({
        userId: 'staff',
        userType: 'staff',
        title: 'Patient Missed Appointment',
        message: `Patient missed appointment scheduled for ${new Date(appointment.scheduledTime).toLocaleString()}. Follow up required.`,
        type: 'appointment',
        priority: 'medium'
      })
    } catch (error) {
      console.error(`Failed to process missed appointment ${appointment.id}:`, error)
    }
  }

  private async updateAppointmentStatus(appointment: AppointmentStatus) {
    try {
      await apiClient.put(`/appointments/${appointment.id}/status`, {
        status: appointment.status
      })
    } catch (error) {
      console.warn('API update failed, using localStorage fallback')
      const appointments = await this.getScheduledAppointments()
      const index = appointments.findIndex(apt => apt.id === appointment.id)
      
      if (index !== -1) {
        appointments[index] = appointment
        localStorage.setItem('appointments', JSON.stringify(appointments))
      }
    }
  }

  async getMissedAppointments(): Promise<AppointmentStatus[]> {
    try {
      return await apiClient.get<AppointmentStatus[]>('/appointments/missed')
    } catch (error) {
      console.warn('API unavailable, using localStorage fallback')
      const appointments = await this.getScheduledAppointments()
      return appointments.filter(apt => apt.status === 'missed')
    }
  }

  async rescheduleAppointment(appointmentId: string, newDate: string, newTime: string, reason?: string) {
    try {
      await apiClient.patch(`/appointments/${appointmentId}/reschedule`, {
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: 'scheduled',
        rescheduleReason: reason,
        priority: 'high' // Maintain high priority for rescheduled appointments
      })
      return true
    } catch (error) {
      console.warn('API unavailable, using localStorage fallback')
      const appointments = await this.getScheduledAppointments()
      const appointment = appointments.find(apt => apt.id === appointmentId)
      
      if (appointment) {
        appointment.status = 'scheduled'
        appointment.scheduledTime = new Date(`${newDate}T${newTime}`)
        appointment.priority = 'high'
        appointment.rescheduleCount = (appointment.rescheduleCount || 0) + 1
        await this.updateAppointmentStatus(appointment)
        return true
      }
      return false
    }
  }

  async updateMissedReason(appointmentId: string, reason: 'no_show' | 'emergency' | 'illness' | 'other') {
    try {
      await apiClient.patch(`/appointments/${appointmentId}/missed-reason`, { reason })
    } catch (error) {
      console.warn('API unavailable, using localStorage fallback')
      const appointments = await this.getScheduledAppointments()
      const appointment = appointments.find(apt => apt.id === appointmentId)
      
      if (appointment) {
        appointment.missedReason = reason
        // Adjust priority based on reason
        if (reason === 'emergency' || reason === 'illness') {
          appointment.priority = 'urgent'
        }
        await this.updateAppointmentStatus(appointment)
      }
    }
  }

  async getPriorityAppointments(): Promise<AppointmentStatus[]> {
    try {
      return await apiClient.get<AppointmentStatus[]>('/appointments/priority')
    } catch (error) {
      const appointments = await this.getScheduledAppointments()
      return appointments
        .filter(apt => apt.priority === 'high' || apt.priority === 'urgent')
        .sort((a, b) => {
          // Sort by priority (urgent first, then high)
          if (a.priority === 'urgent' && b.priority !== 'urgent') return -1
          if (b.priority === 'urgent' && a.priority !== 'urgent') return 1
          // Then by reschedule count (more reschedules = higher priority)
          return (b.rescheduleCount || 0) - (a.rescheduleCount || 0)
        })
    }
  }

  async completeAppointment(appointmentId: string) {
    try {
      await apiClient.patch(`/appointments/${appointmentId}/complete`, {})
    } catch (error) {
      console.warn('API unavailable, using localStorage fallback')
      const appointments = await this.getScheduledAppointments()
      const appointment = appointments.find(apt => apt.id === appointmentId)
      
      if (appointment) {
        appointment.status = 'completed'
        await this.updateAppointmentStatus(appointment)
      }
    }
  }

  async cancelAppointment(appointmentId: string) {
    try {
      await apiClient.patch(`/appointments/${appointmentId}/cancel`, {})
    } catch (error) {
      console.warn('API unavailable, using localStorage fallback')
      const appointments = await this.getScheduledAppointments()
      const appointment = appointments.find(apt => apt.id === appointmentId)
      
      if (appointment) {
        appointment.status = 'cancelled'
        await this.updateAppointmentStatus(appointment)
      }
    }
  }
}

export const appointmentStatusService = new AppointmentStatusService()