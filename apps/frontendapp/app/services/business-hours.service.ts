export interface BusinessHours {
  day: number // 0 = Sunday, 1 = Monday, etc.
  startTime: string // "09:00"
  endTime: string // "17:00"
  isOpen: boolean
}

export interface TimeSlot {
  time: string
  available: boolean
  reason?: string
}

class BusinessHoursService {
  private businessHours: BusinessHours[] = [
    { day: 0, startTime: "08:00", endTime: "18:00", isOpen: true }, // Sunday
    { day: 1, startTime: "08:00", endTime: "18:00", isOpen: true }, // Monday
    { day: 2, startTime: "08:00", endTime: "18:00", isOpen: true }, // Tuesday
    { day: 3, startTime: "08:00", endTime: "18:00", isOpen: true }, // Wednesday
    { day: 4, startTime: "08:00", endTime: "18:00", isOpen: true }, // Thursday
    { day: 5, startTime: "08:00", endTime: "18:00", isOpen: true }, // Friday
    { day: 6, startTime: "08:00", endTime: "18:00", isOpen: true }, // Saturday
  ]

  private appointmentInterval = 15 // minutes
  private minimumAdvanceHours = 2

  isBusinessDay(date: Date): boolean {
    const dayOfWeek = date.getDay()
    const businessDay = this.businessHours.find(bh => bh.day === dayOfWeek)
    return businessDay?.isOpen || false
  }

  getBusinessHours(date: Date): BusinessHours | null {
    const dayOfWeek = date.getDay()
    return this.businessHours.find(bh => bh.day === dayOfWeek) || null
  }

  isWithinBusinessHours(date: Date, time: string): boolean {
    const businessHours = this.getBusinessHours(date)
    if (!businessHours || !businessHours.isOpen) return false

    // Check if time is within business hours
    if (time < businessHours.startTime || time >= businessHours.endTime) return false

    return true
  }

  canScheduleAppointment(appointmentDate: Date, appointmentTime: string): { canSchedule: boolean; reason?: string } {
    const now = new Date()
    const appointmentDateTime = new Date(`${appointmentDate.toDateString()} ${appointmentTime}`)

    // Check if appointment is in the past
    if (appointmentDateTime <= now) {
      return { canSchedule: false, reason: "Cannot schedule appointments in the past" }
    }

    // Check if appointment is at least 2 hours from now
    const twoHoursFromNow = new Date(now.getTime() + (this.minimumAdvanceHours * 60 * 60 * 1000))
    if (appointmentDateTime < twoHoursFromNow) {
      return { canSchedule: false, reason: `Appointments must be scheduled at least ${this.minimumAdvanceHours} hours in advance` }
    }

    // Check if it's a business day
    if (!this.isBusinessDay(appointmentDate)) {
      return { canSchedule: false, reason: "Clinic is closed on this day" }
    }

    // Check if time is within business hours
    if (!this.isWithinBusinessHours(appointmentDate, appointmentTime)) {
      return { canSchedule: false, reason: "Time is outside business hours or during lunch break" }
    }

    return { canSchedule: true }
  }

  getAvailableTimeSlots(date: Date): TimeSlot[] {
    const slots: TimeSlot[] = []
    const businessHours = this.getBusinessHours(date)
    
    if (!businessHours || !businessHours.isOpen) {
      return slots
    }

    // Generate time slots
    const startHour = parseInt(businessHours.startTime.split(':')[0])
    const startMinute = parseInt(businessHours.startTime.split(':')[1])
    const endHour = parseInt(businessHours.endTime.split(':')[0])
    const endMinute = parseInt(businessHours.endTime.split(':')[1])

    let currentTime = new Date()
    currentTime.setHours(startHour, startMinute, 0, 0)
    
    const endTime = new Date()
    endTime.setHours(endHour, endMinute, 0, 0)

    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5) // "HH:MM"
      const canSchedule = this.canScheduleAppointment(date, timeString)
      
      slots.push({
        time: timeString,
        available: canSchedule.canSchedule,
        reason: canSchedule.reason
      })

      // Add interval
      currentTime.setMinutes(currentTime.getMinutes() + this.appointmentInterval)
    }

    return slots
  }

  shouldProcessMissedAppointments(): boolean {
    const now = new Date()
    return this.isWithinBusinessHours(now, now.toTimeString().slice(0, 5))
  }

  getNextBusinessDay(fromDate: Date = new Date()): Date {
    const nextDay = new Date(fromDate)
    nextDay.setDate(nextDay.getDate() + 1)
    
    while (!this.isBusinessDay(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1)
    }
    
    return nextDay
  }

  formatTimeSlot(time: string): string {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }
}

export const businessHoursService = new BusinessHoursService()