export interface User {
  id: string
  email: string
  name: string
  role: 'patient' | 'doctor' | 'admin'
}

export const auth = {
  login: async (email: string, password: string): Promise<User> => {
    // Implementation will be added
    throw new Error('Not implemented')
  },
  
  logout: async (): Promise<void> => {
    // Implementation will be added
  },
}