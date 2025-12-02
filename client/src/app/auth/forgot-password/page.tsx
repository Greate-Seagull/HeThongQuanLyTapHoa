'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { KeyRound, ArrowLeft, Store } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [accountInfo, setAccountInfo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()

  const handleSubmit = async () => {
    if (!accountInfo) {
      toast.error('Vui lòng nhập thông tin tài khoản')
      return
    }

    setIsLoading(true)

    try {
      // TODO: Replace with actual API call
      // await apiClient.post('/auth/forgot-password', { accountInfo })
      
      toast.success('Yêu cầu đặt lại mật khẩu đã được gửi!')
      router.push('/auth/login')
    } catch (error) {
      toast.error('Không tìm thấy tài khoản. Vui lòng thử lại.')
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
          <CardTitle className="text-2xl text-blue-900">Quên Mật Khẩu</CardTitle>
          <CardDescription>Nhập thông tin tài khoản để đặt lại mật khẩu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountInfo" className="text-blue-900">
              Số điện thoại hoặc tên đăng nhập
            </Label>
            <Input
              id="accountInfo"
              type="text"
              placeholder="Nhập số điện thoại hoặc tên đăng nhập"
              value={accountInfo}
              onChange={(e) => setAccountInfo(e.target.value)}
              className="border-blue-200 focus:border-blue-600"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
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
