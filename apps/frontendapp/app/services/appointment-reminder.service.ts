import { notificationService } from './notification.service'
import { businessHoursService } from './business-hours.service'
import { apiClient } from './api-client.service'

interface AppointmentReminder {
  appointmentId: string
  patientId: string
  doctorId: string
  scheduledTime: Date
  reminderSent: boolean
}

class AppointmentReminderService {
  private reminderInterval: NodeJS.Timeout | null = null
  private reminderMinutes = 30 // Send reminder 30 minutes before

  startReminderService() {
    // Check every 5 minutes for upcoming appointments
    this.reminderInterval = setInterval(() => {
      this.checkUpcomingAppointments()
    }, 5 * 60 * 1000)
  }

  stopReminderService() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval)
      this.reminderInterval = null
    }
  }

  private async checkUpcomingAppointments() {
    try {
      // Only send reminders during business hours
      if (!businessHoursService.shouldProcessMissedAppointments()) {
        return
      }

      const appointments = await this.getUpcomingAppointments()
      const now = new Date()
      const reminderTime = this.reminderMinutes * 60 * 1000

      for (const appointment of appointments) {
        const appointmentTime = new Date(appointment.scheduledTime)
        const timeUntilAppointment = appointmentTime.getTime() - now.getTime()

        // Send reminder if appointment is 30 minutes away and reminder not sent
        if (timeUntilAppointment <= reminderTime && 
            timeUntilAppointment > 0 && 
            !appointment.reminderSent) {
          await this.sendAppointmentReminder(appointment)
        }
      }
    } catch (error) {
      console.error('Error checking upcoming appointments:', error)
    }
  }

  private async getUpcomingAppointments(): Promise<AppointmentReminder[]> {
    try {
      return await apiClient.get<AppointmentReminder[]>('/appointments/upcoming-reminders')
    } catch (error) {
      // Fallback to localStorage
      const stored = localStorage.getItem('appointments')
      if (stored) {
        const appointments = JSON.parse(stored)
        return appointments
          .filter((apt: any) => apt.status === 'scheduled')
          .map((apt: any) => ({
            appointmentId: apt.id,
            patientId: apt.patientId,
            doctorId: apt.doctorId,
            scheduledTime: new Date(apt.scheduledTime),
            reminderSent: apt.reminderSent || false
          }))
      }
      return []
    }
  }

  private async sendAppointmentReminder(appointment: AppointmentReminder) {
    try {
      const appointmentTime = appointment.scheduledTime.toLocaleString()
      
      // Send reminder notification to patient
      await notificationService.createNotification({
        userId: appointment.patientId,
        userType: 'patient',
        title: 'Appointment Reminder',
        message: `Your appointment is scheduled for ${appointmentTime}. Please arrive 15 minutes early.`,
        type: 'appointment_reminder',
        priority: 'medium'
      })

      // Mark reminder as sent
      await this.markReminderSent(appointment.appointmentId)
      
      console.log(`Reminder sent for appointment ${appointment.appointmentId}`)
    } catch (error) {
      console.error(`Failed to send reminder for appointment ${appointment.appointmentId}:`, error)
    }
  }

  private async markReminderSent(appointmentId: string) {
    try {
      await apiClient.patch(`/appointments/${appointmentId}/reminder-sent`, {})
    } catch (error) {
      // Fallback to localStorage
      const stored = localStorage.getItem('appointments')
      if (stored) {
        const appointments = JSON.parse(stored)
        const updated = appointments.map((apt: any) => 
          apt.id === appointmentId ? { ...apt, reminderSent: true } : apt
        )
        localStorage.setItem('appointments', JSON.stringify(updated))
      }
    }
  }
}

export const appointmentReminderService = new AppointmentReminderService()