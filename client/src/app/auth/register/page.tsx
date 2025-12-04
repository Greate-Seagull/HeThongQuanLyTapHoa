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
  
  const router = useRouter()

  const handleRegister = () => {
    // Validation
    if (!fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên')
      return
    }

    if (!username.trim()) {
      toast.error('Vui lòng nhập tên đăng nhập')
      return
    }

    // Kiểm tra username đã tồn tại
    const userExists = existingUsers.some(u => u.username.toLowerCase() === username.toLowerCase())
    if (userExists) {
      toast.error('Tên đăng nhập đã tồn tại trong hệ thống', {
        description: 'Vui lòng chọn tên đăng nhập khác',
      })
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

    // Đăng ký thành công
    const positionLabel = position === EmployeePosition.INVENTORY ? 'Kiểm kê' : 
                          position === EmployeePosition.RECEIVING ? 'Nhập hàng' : 'Bán hàng'
    
    toast.success('Đăng ký tài khoản thành công!', {
      description: `Tài khoản ${username} (${selectedRole === 'staff' ? `Nhân viên ${positionLabel}` : 'Khách hàng'}) đã được tạo`,
    })

    // Mock: Thêm user vào database
    if (selectedRole === 'staff') {
      existingUsers.push({ username, role: selectedRole, position })
    } else {
      existingUsers.push({ username, role: selectedRole })
    }

    setTimeout(() => {
      router.push('/auth/login')
    }, 1500)
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

          {/* Position Selection for Staff */}
          {selectedRole === 'staff' && (
            <div className="space-y-2">
              <Label htmlFor="position" className="text-blue-900">Chức vụ</Label>
              <select
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value as EmployeePosition)}
                className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value={EmployeePosition.SALES}>Nhân viên bán hàng</option>
                <option value={EmployeePosition.RECEIVING}>Nhân viên nhập hàng</option>
                <option value={EmployeePosition.INVENTORY}>Nhân viên kiểm kê</option>
              </select>
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
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Đăng ký
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
