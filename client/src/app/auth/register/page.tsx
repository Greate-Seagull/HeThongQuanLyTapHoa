'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { UserPlus, ArrowLeft, Store, Users, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { EmployeePosition } from '@/types'
import { customerSignUp, employeeSignUp } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth-store'

type UserRole = 'staff' | 'customer'

// Mock database của users đã đăng ký (không bao gồm owner - owner chỉ có sẵn trong DB)
const existingUsers = [
  { username: 'nvkiem', role: 'staff', position: EmployeePosition.INVENTORY },
  { username: 'ttnhap', role: 'staff', position: EmployeePosition.RECEIVING },
  { username: 'lvban', role: 'staff', position: EmployeePosition.SALES },
  { username: 'khach1', role: 'customer' },
]

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer')
  const [position, setPosition] = useState<EmployeePosition>(EmployeePosition.SALES)
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const handleRegister = async () => {
    // Validation
    if (!fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên')
      return
    }

    if (!username.trim()) {
      toast.error('Vui lòng nhập tên đăng nhập')
      return
    }

    if (!password) {
      toast.error('Vui lòng nhập mật khẩu')
      return
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu không khớp', {
        description: 'Vui lòng kiểm tra lại mật khẩu xác nhận',
      })
      return
    }

    if (selectedRole === 'customer' && !phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }

    if (selectedRole === 'staff' && !employeeId.trim()) {
      toast.error('Vui lòng nhập mã nhân viên')
      return
    }

    setIsLoading(true)

    try {
      if (selectedRole === 'customer') {
        // Customer registration: POST /accounts
        const response = await customerSignUp({
          name: fullName,
          phoneNumber: phone,
          password: password,
        })

        // ⚠️ Backend only returns token, missing user data
        const userData = {
          username: phone, // Using phoneNumber as username
          role: 'customer' as const,
          customerId: undefined,
        }

        login(userData, response.token)

        toast.success('Đăng ký tài khoản khách hàng thành công!', {
          description: 'Bạn đã có thể đăng nhập vào hệ thống',
        })

        setTimeout(() => {
          router.push('/dashboard/customer')
        }, 1500)
      } else if (selectedRole === 'staff') {
        // ⚠️ CRITICAL ISSUE: Backend expects employeeId (employee must exist first)
        // This is a two-step process:
        // 1. Admin must create Employee record first with position
        // 2. Then create EmployeeAccount with employeeId reference
        
        try {
          const response = await employeeSignUp({
            employeeId: parseInt(employeeId),
            username: username,
            password: password,
          })

          // ⚠️ Backend only returns token, missing employee data
          const userData = {
            username: username,
            role: 'staff' as const,
            employeeData: undefined, // Cannot get position without employee data
          }

          login(userData, response.token)

          toast.success('Đăng ký tài khoản nhân viên thành công!', {
            description: 'Bạn đã có thể đăng nhập vào hệ thống',
          })

          setTimeout(() => {
            router.push('/dashboard/staff')
          }, 1500)
        } catch (error: any) {
          // If employeeId doesn't exist, show helpful error
          if (error.message.includes('not found') || error.message.includes('không tồn tại')) {
            toast.error('Mã nhân viên không tồn tại', {
              description: 'Vui lòng liên hệ quản trị viên để tạo hồ sơ nhân viên trước',
            })
          } else {
            throw error
          }
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error('Đăng ký thất bại', {
        description: error.message || 'Vui lòng thử lại sau',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPositionLabel = (pos: EmployeePosition) => {
    switch (pos) {
      case EmployeePosition.INVENTORY:
        return 'Kiểm kê'
      case EmployeePosition.RECEIVING:
        return 'Nhập hàng'
      case EmployeePosition.SALES:
        return 'Bán hàng'
      default:
        return pos
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
          <CardDescription>Hệ thống quản lý tạp hóa - Tạo tài khoản mới để sử dụng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label className="text-blue-900">Vai trò đăng ký</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={selectedRole === 'staff' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('staff')}
                className={`flex flex-col items-center gap-1 h-auto py-3 ${selectedRole === 'staff' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-200'}`}
              >
                <Users className="h-5 w-5" />
                <span className="text-xs">Nhân viên</span>
              </Button>
              <Button
                type="button"
                variant={selectedRole === 'customer' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('customer')}
                className={`flex flex-col items-center gap-1 h-auto py-3 ${selectedRole === 'customer' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-200'}`}
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="text-xs">Khách hàng</span>
              </Button>
            </div>
          </div>

          {/* Employee ID for Staff (Backend requirement) */}
          {selectedRole === 'staff' && (
            <div className="space-y-2">
              <Label htmlFor="employeeId" className="text-blue-900">
                Mã nhân viên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="Nhập mã nhân viên (yêu cầu từ quản trị viên)"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="border-blue-200 focus:border-blue-600"
              />
              <p className="text-xs text-gray-500">
                ⚠️ Quản trị viên phải tạo hồ sơ nhân viên trước khi đăng ký tài khoản
              </p>
            </div>
          )}

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
            <Label htmlFor="username" className="text-blue-900">Tên đăng nhập</Label>
            <Input
              id="username"
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-blue-200 focus:border-blue-600"
            />
          </div>

          {selectedRole === 'customer' && (
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-blue-900">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-blue-200 focus:border-blue-600"
              />
            </div>
          )}

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
