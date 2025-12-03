'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { UserPlus, ArrowLeft, Store } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()

  const handleRegister = async () => {
    if (!fullName || !phoneNumber || !password || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu không khớp!')
      return
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setIsLoading(true)

    try {
      // TODO: Replace with actual API call
      // await apiClient.post('/auth/register', { fullName, phoneNumber, password })
      
      toast.success('Đăng ký thành công!')
      router.push('/auth/login')
    } catch (error) {
      toast.error('Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
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
          <CardTitle className="text-2xl text-blue-900">Đăng Ký Tài Khoản</CardTitle>
          <CardDescription>Tạo tài khoản khách hàng mới</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-blue-900">Họ và tên</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Nhập họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border-blue-200 focus:border-blue-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-blue-900">Số điện thoại</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Nhập số điện thoại"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="border-blue-200 focus:border-blue-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-900">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-blue-200 focus:border-blue-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-blue-900">Xác nhận mật khẩu</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border-blue-200 focus:border-blue-600"
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            />
          </div>

          <Button 
            onClick={handleRegister} 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
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
        </CardContent>
      </Card>
    </div>
  )
}
