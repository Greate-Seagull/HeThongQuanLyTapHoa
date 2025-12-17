'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { User, Phone, Save, Edit, X, Shield, Briefcase, Award, KeyRound, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { EmployeePosition } from '@/types'

interface ProfilePageProps {
  user: any
  role: 'owner' | 'staff' | 'customer'
}

export function ProfilePage({ user, role }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  
  // Chỉ lưu các trường có trong schema
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || user?.phoneNumber || '',
    username: user?.username || '',
  })

  // State cho form đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSave = () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập họ và tên')
      return
    }

    // Validate phone cho Customer
    if (role === 'customer' && !formData.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }

    // Validate phone format
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.trim())) {
      toast.error('Số điện thoại không hợp lệ (10-11 số)')
      return
    }

    // Validate username cho Owner/Staff
    if ((role === 'owner' || role === 'staff') && !formData.username.trim()) {
      toast.error('Vui lòng nhập tên đăng nhập')
      return
    }

    // Mock: Update user data
    toast.success('Cập nhật thông tin thành công!', {
      description: 'Thông tin cá nhân đã được lưu',
    })
    
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: user?.name || '',
      phone: user?.phone || user?.phoneNumber || '',
      username: user?.username || '',
    })
    setIsEditing(false)
  }

  const getPositionLabel = (position: string) => {
    switch (position) {
      case EmployeePosition.INVENTORY:
        return 'Nhân viên kiểm kê'
      case EmployeePosition.RECEIVING:
        return 'Nhân viên nhập hàng'
      case EmployeePosition.SALES:
        return 'Nhân viên hóa đơn'
      default:
        return position
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Chủ cửa hàng'
      case 'staff':
        return 'Nhân viên'
      case 'customer':
        return 'Khách hàng'
      default:
        return role
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'staff':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'customer':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleChangePassword = () => {
    // Validation
    if (!passwordData.currentPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu hiện tại')
      return
    }

    if (!passwordData.newPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu mới')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('Mật khẩu mới phải khác mật khẩu hiện tại')
      return
    }

    // Mock: Validate current password (trong thực tế sẽ kiểm tra với backend)
    // Giả sử mật khẩu hiện tại là "123456"
    if (passwordData.currentPassword !== '123456') {
      toast.error('Mật khẩu hiện tại không đúng')
      return
    }

    // Success
    toast.success('Đổi mật khẩu thành công!', {
      description: 'Mật khẩu của bạn đã được cập nhật',
    })

    // Reset form và đóng dialog
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setIsChangePasswordOpen(false)
  }

  const handleClosePasswordDialog = () => {
    // Reset form khi đóng
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setIsChangePasswordOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        </div>

        {/* Main Content - 2 cột responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cột trái - Avatar và thông tin vai trò */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Hồ sơ</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-lg">
                    <User className="h-16 w-16" />
                  </div>
                  <div className={`absolute bottom-0 right-0 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center ${
                    role === 'owner' ? 'bg-purple-500' : role === 'staff' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {role === 'owner' ? (
                      <Shield className="h-5 w-5 text-white" />
                    ) : role === 'staff' ? (
                      <Briefcase className="h-5 w-5 text-white" />
                    ) : (
                      <Award className="h-5 w-5 text-white" />
                    )}
                  </div>
                </div>

                {/* Tên */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{formData.name || 'Chưa có tên'}</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getRoleBadgeColor(role)}`}>
                    <span className="text-sm font-medium">{getRoleLabel(role)}</span>
                  </div>
                </div>

                {/* Thông tin bổ sung theo vai trò */}
                <div className="w-full pt-4 border-t border-gray-200 space-y-3">
                  {role === 'staff' && user?.position && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Chức vụ:</span>
                      <span className="font-medium text-gray-900">{getPositionLabel(user.position)}</span>
                    </div>
                  )}
                  
                  {role === 'customer' && user?.point !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Điểm tích lũy:</span>
                      <span className="font-semibold text-blue-600">{user.point.toLocaleString('vi-VN')} điểm</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Mã ID:</span>
                    <span className="font-medium text-gray-900">#{user?.id || '---'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cột phải - Form chỉnh sửa thông tin */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Thông tin chi tiết</CardTitle>
                    <CardDescription>
                      {isEditing ? 'Chỉnh sửa thông tin cá nhân' : 'Xem thông tin tài khoản'}
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Họ và tên - Có trong schema: User.name hoặc Employee.name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      Họ và tên
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nhập họ và tên"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
                        {formData.name || 'Chưa cập nhật'}
                      </div>
                    )}
                  </div>

                  {/* Username - Chỉ hiển thị cho Owner/Staff (EmployeeAccount.username) */}
                  {(role === 'owner' || role === 'staff') && (
                    <div className="space-y-2">
                      <Label htmlFor="username" className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-gray-500" />
                        Tên đăng nhập
                      </Label>
                      {isEditing ? (
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          placeholder="Nhập tên đăng nhập"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
                          {formData.username || 'Chưa cập nhật'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Số điện thoại - Chỉ hiển thị cho Customer (Account.phoneNumber) */}
                  {role === 'customer' && (
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        Số điện thoại
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Nhập số điện thoại"
                          type="tel"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
                          {formData.phone || 'Chưa cập nhật'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chức vụ - Read only cho Staff (Employee.position) */}
                  {role === 'staff' && user?.position && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        Chức vụ
                      </Label>
                      <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
                        {getPositionLabel(user.position)}
                      </div>
                      <p className="text-xs text-gray-500">Chức vụ không thể thay đổi</p>
                    </div>
                  )}

                  {/* Điểm tích lũy - Read only cho Customer (User.point) */}
                  {role === 'customer' && user?.point !== undefined && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-gray-500" />
                        Điểm tích lũy
                      </Label>
                      <div className="px-3 py-2 bg-blue-50 rounded-md border border-blue-200">
                        <span className="font-semibold text-blue-700">
                          {user.point.toLocaleString('vi-VN')} điểm
                        </span>
                        <span className="text-sm text-blue-600 ml-2">
                          (≈ {(user.point).toLocaleString('vi-VN')}đ)
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">1 điểm = 1đ giảm giá khi mua hàng</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Lưu thay đổi
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="flex-1 border-gray-300 hover:bg-gray-50">
                        <X className="h-4 w-4 mr-2" />
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Thông tin bảo mật */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Bảo mật tài khoản</CardTitle>
                <CardDescription>Quản lý mật khẩu và bảo mật</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">Mật khẩu</p>
                      <p className="text-sm text-gray-500">Đổi mật khẩu định kỳ để bảo mật tài khoản</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsChangePasswordOpen(true)} className="border-blue-600 text-blue-600 hover:bg-blue-50">
                      <KeyRound className="h-4 w-4 mr-2" />
                      Đổi mật khẩu
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">Đăng nhập gần nhất</p>
                      <p className="text-sm text-gray-500">
                        {user?.loggedAt 
                          ? new Date(user.loggedAt).toLocaleString('vi-VN')
                          : 'Chưa có thông tin'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog đổi mật khẩu */}
      <Dialog open={isChangePasswordOpen} onOpenChange={handleClosePasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-900">
              <Lock className="h-5 w-5" />
              Đổi mật khẩu
            </DialogTitle>
            <DialogDescription>
              Nhập mật khẩu hiện tại và mật khẩu mới. Mật khẩu phải có tối thiểu 6 ký tự.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Mật khẩu hiện tại */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Nhập mật khẩu hiện tại"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="border-blue-200 focus:border-blue-600"
              />
            </div>

            {/* Mật khẩu mới */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="border-blue-200 focus:border-blue-600"
              />
              {passwordData.newPassword && passwordData.newPassword.length < 6 && (
                <p className="text-xs text-red-600">Mật khẩu phải có tối thiểu 6 ký tự</p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleChangePassword()
                  }
                }}
                className="border-blue-200 focus:border-blue-600"
              />
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-xs text-red-600">Mật khẩu xác nhận không khớp</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClosePasswordDialog} className="border-gray-300 hover:bg-gray-50">
              Hủy
            </Button>
            <Button onClick={handleChangePassword} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Lưu mật khẩu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
