// Real-time queue management service
export interface QueuePatient {
  id: string
  name: string
  appointmentTime: string
  doctor: string
  status: "scheduled" | "checked-in" | "waiting" | "in-consultation" | "completed"
  priority: "low" | "normal" | "high"
  waitTime: number
  checkInTime?: Date
  estimatedCallTime?: Date
}

export interface QueueStats {
  totalPatients: number
  averageWaitTime: number
  priorityPatients: number
  completedToday: number
}

class QueueService {
  private queue: QueuePatient[] = [
    {
      id: "P001",
      name: "Sarah Johnson",
      appointmentTime: "9:00 AM",
      doctor: "Dr. Wilson",
      status: "checked-in",
      priority: "high",
      waitTime: 5,
      checkInTime: new Date(Date.now() - 10 * 60 * 1000),
      estimatedCallTime: new Date(Date.now() + 5 * 60 * 1000),
    },
    {
      id: "P002",
      name: "John Smith",
      appointmentTime: "9:30 AM",
      doctor: "Dr. Wilson",
      status: "waiting",
      priority: "normal",
      waitTime: 25,
      checkInTime: new Date(Date.now() - 20 * 60 * 1000),
      estimatedCallTime: new Date(Date.now() + 25 * 60 * 1000),
    },
    {
      id: "P003",
      name: "Michael Chen",
      appointmentTime: "10:00 AM",
      doctor: "Dr. Wilson",
      status: "scheduled",
      priority: "normal",
      waitTime: 45,
      estimatedCallTime: new Date(Date.now() + 45 * 60 * 1000),
    },
    {
      id: "P004",
      name: "Emma Davis",
      appointmentTime: "10:30 AM",
      doctor: "Dr. Wilson",
      status: "scheduled",
      priority: "normal",
      waitTime: 65,
      estimatedCallTime: new Date(Date.now() + 65 * 60 * 1000),
    },
  ]

  private listeners: Array<(queue: QueuePatient[], stats: QueueStats) => void> = []
  private updateInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startRealTimeUpdates()
  }

  // Subscribe to queue updates
  subscribe(callback: (queue: QueuePatient[], stats: QueueStats) => void) {
    this.listeners.push(callback)
    // Immediately call with current state
    callback(this.queue, this.getStats())

    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  // Get current queue
  getQueue(): QueuePatient[] {
    return [...this.queue]
  }

  // Get queue statistics
  getStats(): QueueStats {
    const totalPatients = this.queue.length
    const averageWaitTime = Math.round(
      this.queue.reduce((sum, patient) => sum + patient.waitTime, 0) / totalPatients || 0,
    )
    const priorityPatients = this.queue.filter((p) => p.priority === "high").length
    const completedToday = 8 // Mock completed count

    return {
      totalPatients,
      averageWaitTime,
      priorityPatients,
      completedToday,
    }
  }

  // Update patient status
  updatePatientStatus(patientId: string, status: QueuePatient["status"]) {
    const patientIndex = this.queue.findIndex((p) => p.id === patientId)
    if (patientIndex !== -1) {
      this.queue[patientIndex].status = status

      if (status === "completed") {
        // Remove completed patients after a delay
        setTimeout(() => {
          this.queue = this.queue.filter((p) => p.id !== patientId)
          this.notifyListeners()
        }, 2000)
      }

      this.recalculateWaitTimes()
      this.notifyListeners()
    }
  }

  // Move patient in queue
  movePatient(patientId: string, direction: "up" | "down") {
    const currentIndex = this.queue.findIndex((p) => p.id === patientId)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= this.queue.length) return

    // Swap patients
    const temp = this.queue[currentIndex]
    this.queue[currentIndex] = this.queue[newIndex]
    this.queue[newIndex] = temp

    this.recalculateWaitTimes()
    this.notifyListeners()
  }

  // Set patient priority
  setPriority(patientId: string, priority: QueuePatient["priority"]) {
    const patient = this.queue.find((p) => p.id === patientId)
    if (patient) {
      patient.priority = priority

      // Move high priority patients to front
      if (priority === "high") {
        this.queue = this.queue.sort((a, b) => {
          if (a.priority === "high" && b.priority !== "high") return -1
          if (a.priority !== "high" && b.priority === "high") return 1
          return 0
        })
      }

      this.recalculateWaitTimes()
      this.notifyListeners()
    }
  }

  // Add new patient to queue
  addPatient(patient: Omit<QueuePatient, "waitTime" | "estimatedCallTime">) {
    const newPatient: QueuePatient = {
      ...patient,
      waitTime: this.calculateInitialWaitTime(),
      estimatedCallTime: new Date(Date.now() + this.calculateInitialWaitTime() * 60 * 1000),
    }

    this.queue.push(newPatient)
    this.recalculateWaitTimes()
    this.notifyListeners()
  }

  // Get patient position in queue
  getPatientPosition(patientId: string): number {
    return this.queue.findIndex((p) => p.id === patientId) + 1
  }

  // Check if patient should be notified (within 10 minutes of their turn)
  shouldNotifyPatient(patientId: string): boolean {
    const patient = this.queue.find((p) => p.id === patientId)
    return patient ? patient.waitTime <= 10 : false
  }

  private startRealTimeUpdates() {
    this.updateInterval = setInterval(() => {
      this.simulateQueueProgress()
      this.recalculateWaitTimes()
      this.notifyListeners()
    }, 30000) // Update every 30 seconds
  }

  private simulateQueueProgress() {
    // Simulate natural queue progression
    this.queue.forEach((patient) => {
      if (patient.status === "waiting" || patient.status === "checked-in") {
        // Reduce wait time by 1-3 minutes randomly
        const reduction = Math.floor(Math.random() * 3) + 1
        patient.waitTime = Math.max(0, patient.waitTime - reduction)

        // Update estimated call time
        patient.estimatedCallTime = new Date(Date.now() + patient.waitTime * 60 * 1000)
      }
    })

    // Occasionally move a patient to consultation
    if (Math.random() < 0.3) {
      const waitingPatient = this.queue.find((p) => p.status === "waiting" && p.waitTime <= 5)
      if (waitingPatient) {
        waitingPatient.status = "in-consultation"
      }
    }

    // Occasionally complete a consultation
    if (Math.random() < 0.2) {
      const consultingPatient = this.queue.find((p) => p.status === "in-consultation")
      if (consultingPatient) {
        this.updatePatientStatus(consultingPatient.id, "completed")
      }
    }
  }

  private recalculateWaitTimes() {
    const cumulativeTime = 0
    const averageConsultationTime = 15 // minutes

    this.queue.forEach((patient, index) => {
      if (patient.status === "completed") return

      if (patient.status === "in-consultation") {
        patient.waitTime = 0
      } else {
        // Calculate based on position and average consultation time
        const patientsAhead = this.queue
          .slice(0, index)
          .filter((p) => p.status !== "completed" && p.status !== "scheduled").length

        patient.waitTime = Math.max(1, patientsAhead * averageConsultationTime + Math.floor(Math.random() * 10))
        patient.estimatedCallTime = new Date(Date.now() + patient.waitTime * 60 * 1000)
      }
    })
  }

  private calculateInitialWaitTime(): number {
    const activePatients = this.queue.filter((p) => p.status !== "completed").length
    return Math.max(15, activePatients * 15 + Math.floor(Math.random() * 20))
  }

  private notifyListeners() {
    const stats = this.getStats()
    this.listeners.forEach((callback) => callback([...this.queue], stats))
  }

  // Cleanup
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    this.listeners = []
  }
}

// Singleton instance
export const queueService = new QueueService()