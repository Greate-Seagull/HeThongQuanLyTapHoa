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
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
)
