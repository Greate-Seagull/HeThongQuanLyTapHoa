'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

export default function Home() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Redirect to appropriate dashboard if already logged in
    if (isAuthenticated && user) {
      if (user.role === 'owner') {
        router.push('/dashboard/owner')
      } else if (user.role === 'staff') {
        router.push('/dashboard/staff')
      } else if (user.role === 'customer') {
        router.push('/dashboard/customer')
      }
    } else {
      // Not logged in, redirect to login
      router.push('/auth/login')
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  )
}
