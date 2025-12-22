import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const skipAuthRedirect = (error.config as any)?.skipAuthRedirect

        if (error.response?.status === 401 && !skipAuthRedirect) {
          // Handle unauthorized access
          this.clearToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login' // Fixed: was '/sign-in'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken')
    }
    return null
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
    }
  }

  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token)
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<any>(url, config)
    // Backend wraps response in { data: {...}, status: "success" }
    // Unwrap it to get the actual data
    if (response.data && response.data.data) {
      return response.data.data as T
    }
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    console.log('📤 POST Request:', { url, data })
    
    try {
      const response = await this.client.post<any>(url, data, config)
      
      // ✅ Add detailed logging for debugging
      console.log('📥 POST Response:', {
        status: response.status,
        data: response.data,
      })
      
      // Backend wraps response in { data: {...}, status: "success" }
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      return response.data
    } catch (error: any) {
      // ✅ CRITICAL: Log full error details
      console.error('❌ POST Error:', {
        url,
        data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorData: error.response?.data,
        message: error.message,
      })
      
      throw error
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<any>(url, data, config)
    // Backend wraps response in { data: {...}, status: "success" }
    if (response.data && response.data.data) {
      return response.data.data as T
    }
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<any>(url, data, config)
    // Backend wraps response in { data: {...}, status: "success" }
    if (response.data && response.data.data) {
      return response.data.data as T
    }
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<any>(url, config)
    // Backend wraps response in { data: {...}, status: "success" }
    if (response.data && response.data.data) {
      return response.data.data as T
    }
    return response.data
  }
}

export const apiClient = new ApiClient()
