'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LogIn, Store } from 'lucide-react'
import { useAuthStore, UserRole } from '@/store/auth-store'
import { toast } from 'sonner'
import { customerSignIn, employeeSignIn, ownerSignIn } from '@/services/auth.service'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner')
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setIsLoading(true)

    try {
      let response: any
      let userData: any

      if (selectedRole === 'customer') {
        response = await customerSignIn({
          phoneNumber: username,
          password: password,
        })
        
        userData = {
          username: username,
          role: 'customer' as UserRole,
          customerId: response.user?.id,
        }
        
        if (response.user) {
          toast.success(`Đăng nhập thành công! Chào mừng ${response.user.name}`)
        }
      } else if (selectedRole === 'staff') {
        response = await employeeSignIn({
          username: username,
          password: password,
        })
        
        console.log('Employee sign-in response:', response)
        
        // ✅ Allow MANAGER to login as staff
        if (response.employee) {
          userData = {
            username: username,
            role: 'staff' as UserRole,
            employeeData: response.employee,
          }
          
          console.log('userData created:', userData)
          toast.success(`Đăng nhập thành công! Chào mừng ${response.employee.name}`)
        } else {
          toast.warning('Đăng nhập thành công, nhưng thông tin nhân viên chưa đầy đủ')
        }
      } else if (selectedRole === 'owner') {
        response = await employeeSignIn({
          username: username,
          password: password,
        })
        
        // ✅ Only MANAGER can access owner dashboard
        if (response.employee?.position !== 'MANAGER') {
          toast.error('Chỉ chủ cửa hàng (MANAGER) mới có thể đăng nhập với vai trò này')
          setIsLoading(false)
          return
        }
        
        userData = {
          username: username,
          role: 'owner' as UserRole,
          employeeData: response.employee,
        }
        
        if (response.employee) {
          toast.success(`Đăng nhập thành công! Chào mừng ${response.employee.name}`)
        }
      }

      login(userData, response.token)
      
      toast.success('Đăng nhập thành công!')
      
      // Navigate based on role
      if (selectedRole === 'owner') {
        router.push('/dashboard/owner')
      } else if (selectedRole === 'staff') {
        router.push('/dashboard/staff')
      } else {
        router.push('/dashboard/customer')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
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
          <CardTitle className="text-2xl text-blue-900">Hệ Thống Quản Lý Tạp Hóa</CardTitle>
          <CardDescription>Đăng nhập vào tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role" className="text-blue-900">Vai trò</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={selectedRole === 'owner' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('owner')}
                className={selectedRole === 'owner' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-200'}
              >
                Chủ CH
              </Button>
              <Button
                type="button"
                variant={selectedRole === 'staff' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('staff')}
                className={selectedRole === 'staff' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-200'}
              >
                Nhân viên
              </Button>
              <Button
                type="button"
                variant={selectedRole === 'customer' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('customer')}
                className={selectedRole === 'customer' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-200'}
              >
                Khách hàng
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-blue-900">
              {selectedRole === 'customer' ? 'Số điện thoại' : 'Tên đăng nhập'}
            </Label>
            <Input
              id="username"
              type={selectedRole === 'customer' ? 'tel' : 'text'}
              placeholder={selectedRole === 'customer' ? 'Nhập số điện thoại' : 'Nhập tên đăng nhập'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-blue-200 focus:border-blue-600"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-900">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-blue-200 focus:border-blue-600"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <Button 
            onClick={handleLogin} 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>

          <div className="flex justify-between text-sm">
            <Link
              href="/auth/forgot-password"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Quên mật khẩu?
            </Link>
            <Link
              href="/auth/register"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Đăng ký
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
