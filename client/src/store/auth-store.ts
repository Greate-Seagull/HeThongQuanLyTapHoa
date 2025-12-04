import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'owner' | 'staff' | 'customer'

export interface EmployeePosition {
  id: number
  position: 'SALES' | 'INVENTORY' | 'RECEIVING'
  name: string
}

export interface User {
  username: string
  role: UserRole
  employeeData?: EmployeePosition
  userId?: number
  customerId?: number
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (user: User, token?: string) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: (user, token) =>
        set({
          user,
          accessToken: token || null,
          isAuthenticated: true,
        }),
      logout: () => {
        // Clear token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
        }
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        })
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      setToken: (token) =>
        set({
          accessToken: token,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
