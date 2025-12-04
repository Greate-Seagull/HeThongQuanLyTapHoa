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

      // Call different API endpoints based on selected role
      if (selectedRole === 'customer') {
        // ⚠️ IMPORTANT: Backend expects phoneNumber, not username
        // For now, we'll use username as phoneNumber
        // TODO: Update UI to use phone number field for customers
        response = await customerSignIn({
          phoneNumber: username,
          password: password,
        })
        
        // ⚠️ Backend only returns token, missing user data
        // We'll create minimal user object until backend adds full response
        userData = {
          username: username, // Using phoneNumber as username for now
          role: 'customer' as UserRole,
          customerId: undefined, // Backend doesn't return this yet
        }
      } else if (selectedRole === 'staff') {
        response = await employeeSignIn({
          username: username,
          password: password,
        })
        
        // ⚠️ CRITICAL: Backend only returns token, missing employee data
        // Cannot determine position (SALES/INVENTORY/RECEIVING) without employee object
        // This will cause issues in dashboard that rely on position
        userData = {
          username: username,
          role: 'staff' as UserRole,
          employeeData: undefined, // Backend doesn't return this yet
        }
        
        toast.warning('Đăng nhập thành công, nhưng thông tin nhân viên chưa đầy đủ')
      } else if (selectedRole === 'owner') {
        // ⚠️ CRITICAL: No owner endpoint exists yet
        // This will throw error until backend implements it
        try {
          response = await ownerSignIn({
            username: username,
            password: password,
          })
          
          userData = {
            username: username,
            role: 'owner' as UserRole,
            userId: undefined,
          }
        } catch (error: any) {
          toast.error('Chức năng đăng nhập chủ cửa hàng chưa được backend hỗ trợ')
          setIsLoading(false)
          return
        }
      }

      // Store token is already handled in auth.service.ts via apiClient.setToken()
      // Also store in auth store for persistence
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
            <Label htmlFor="username" className="text-blue-900">Tên đăng nhập</Label>
            <Input
              id="username"
              type="text"
              placeholder="Nhập tên đăng nhập"
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
