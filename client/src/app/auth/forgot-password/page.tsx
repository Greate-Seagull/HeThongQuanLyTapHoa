'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { KeyRound, ArrowLeft, Store, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

// Mock database của users đã đăng ký (tuân thủ schema - không có email)
const existingUsers = [
  { username: 'admin', role: 'owner', name: 'Chủ cửa hàng' },
  { username: 'nvkiem', role: 'staff', name: 'Nguyễn Văn Kiểm' },
  { username: 'ttnhap', role: 'staff', name: 'Trần Thị Nhập' },
  { username: 'lvban', role: 'staff', name: 'Lê Văn Bán' },
]

export default function ForgotPasswordPage() {
  const [accountInfo, setAccountInfo] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const router = useRouter()

  const handleSubmit = () => {
    if (!accountInfo.trim()) {
      toast.error('Vui lòng nhập tên đăng nhập')
      return
    }

    // Kiểm tra username có tồn tại không
    const user = existingUsers.find(u => 
      u.username.toLowerCase() === accountInfo.toLowerCase()
    )

    if (!user) {
      toast.error('Tài khoản không tồn tại trong hệ thống', {
        description: 'Vui lòng kiểm tra lại tên đăng nhập',
      })
      return
    }

    // Tìm thấy tài khoản
    setIsSubmitted(true)
    toast.success('Đã tìm thấy tài khoản!', {
      description: `Vui lòng liên hệ quản trị viên để đặt lại mật khẩu cho tài khoản "${user.username}"`,
      duration: 5000,
    })

    // Mock: Sau 2 giây chuyển về trang login
    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-blue-200 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Store className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-blue-900">Quên Mật Khẩu</CardTitle>
          <CardDescription>Hệ thống quản lý tạp hóa - Nhập thông tin tài khoản để đặt lại mật khẩu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSubmitted ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="flex items-start gap-2">
                  <KeyRound className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Nhập tên đăng nhập của bạn. Hệ thống sẽ xác nhận và hướng dẫn bạn liên hệ quản trị viên để đặt lại mật khẩu.</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountInfo" className="text-blue-900">Tên đăng nhập</Label>
                <Input
                  id="accountInfo"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={accountInfo}
                  onChange={(e) => setAccountInfo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit()
                    }
                  }}
                  className="border-blue-200 focus:border-blue-600"
                  autoFocus
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Xác nhận
              </Button>

              <Link href="/auth/login" className="block">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full border-blue-200 text-blue-900 hover:bg-blue-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại đăng nhập
                </Button>
              </Link>
            </>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Đã tìm thấy tài khoản!</h3>
                <p className="text-sm text-gray-600">
                  Vui lòng liên hệ quản trị viên cửa hàng để được hỗ trợ đặt lại mật khẩu.
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Đang chuyển về trang đăng nhập...
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
