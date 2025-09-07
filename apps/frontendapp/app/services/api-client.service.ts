class ApiClientService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'
  private retryAttempts = 3
  private retryDelay = 1000 // 1 second

  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {},
    attempt = 1
  ): Promise<T> {
    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      }

      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (attempt < this.retryAttempts) {
        await this.delay(this.retryDelay * attempt)
        return this.makeRequest(url, options, attempt + 1)
      }
      throw error
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async get<T>(url: string): Promise<T> {
    return this.makeRequest<T>(url, { method: 'GET' })
  }

  async post<T>(url: string, data: any): Promise<T> {
    return this.makeRequest<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(url: string, data: any): Promise<T> {
    return this.makeRequest<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async patch<T>(url: string, data: any): Promise<T> {
    return this.makeRequest<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(url: string): Promise<T> {
    return this.makeRequest<T>(url, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClientService()