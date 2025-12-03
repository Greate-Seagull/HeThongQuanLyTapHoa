'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Star } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'

export default function CustomerDashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication after mount
    if (!user) {
      router.push('/auth/login')
    } else if (user.role !== 'customer') {
      router.push('/auth/login')
    } else {
      setIsLoading(false)
    }
  }, [user, router])

  const menuItems = [
    { id: 'points', label: 'Điểm tích lũy', icon: <Award className="h-4 w-4" /> },
  ]

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout
      menuItems={menuItems}
      activeMenu="points"
      onMenuChange={() => {}}
    >
      <div className="space-y-6">
        <Card className="max-w-2xl mx-auto border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Award className="h-6 w-6" />
              Điểm Tích Lũy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div>
                <div className="text-gray-600 mb-2 text-lg">Điểm hiện tại của bạn</div>
                <div className="flex items-center justify-center gap-2 text-5xl font-bold">
                  <Star className="h-10 w-10 text-yellow-500 fill-yellow-500" />
                  <span className="text-blue-900">1,250 điểm</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                <div className="p-6 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Tổng điểm tích lũy</div>
                  <div className="text-3xl font-semibold text-blue-900">2,500</div>
                </div>
                <div className="p-6 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Điểm đã sử dụng</div>
                  <div className="text-3xl font-semibold text-blue-900">1,250</div>
                </div>
              </div>

              <div className="text-base text-gray-600 pt-4 bg-yellow-50 p-4 rounded-lg">
                💡 Tích lũy thêm điểm để nhận được nhiều ưu đãi hấp dẫn!
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
