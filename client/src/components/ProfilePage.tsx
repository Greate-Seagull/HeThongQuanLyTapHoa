'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  User,
  Phone,
  Save,
  Edit,
  X,
  Shield,
  Briefcase,
  Award,
  KeyRound,
  Lock,
  Loader2,
} from 'lucide-react'
import { apiClient } from '@/services/api-client'
import { toast } from 'sonner'
import { set } from 'react-hook-form'

enum EmployeePosition {
  SALES = 'SALES',
  INVENTORY = 'INVENTORY',
  RECEIVING = 'RECEIVING',
  MANAGER = 'MANAGER',
}

interface UserProfile {
  id: number
  username: string
  name: string
  position?: EmployeePosition
  phoneNumber?: string
  point?: number
  type: 'EMPLOYEE' | 'CUSTOMER'
  employeeId?: number // Thêm trường này để lưu id của bảng Employee
}

interface ApiResponse {
  status: string
  data: UserProfile
}

interface ProfilePageProps {
  user?: {
    id: number
    name: string
    username: string
    loggedAt: Date
  }
  role?: string
}

const API_BASE_URL = 'http://localhost:3000' // Thay URL này

export function ProfilePage({ user: initialUser, role }: ProfilePageProps = {}) {
  // Đóng dialog đổi mật khẩu
  const handleClosePasswordDialog = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsChangePasswordOpen(false);
  }
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    username: '',
    phoneNumber: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Fetch user profile from API
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      // Thử lấy profile nhân viên trước, bỏ qua redirect 401 nếu lỗi
      try {
        const response = await apiClient.get<any>('/employee-accounts/profile', {
          skipAuthRedirect: true,
        } as any)
        console.log('API /employee-accounts/profile response:', response);
        // Luôn lấy employeeId từ response (không fallback sang id)
        setUser({ ...response, type: 'EMPLOYEE', employeeId: response.employeeId });
        console.log('user.employeeId set:', response.employeeId);
        setFormData({
          id: response.employeeId,
          name: response.name,
          username: response.username,
          phoneNumber: '',
        })
      } catch (error: any) {
        // Nếu lỗi 401, thử lấy profile khách hàng
        if (error.response?.status === 401) {
          const response = await apiClient.get<any>('/accounts/profile')
          // Mapping dữ liệu khách hàng (Account structure)
          setUser({
            id: response.id,
            name: response.user.name,
            phoneNumber: response.phoneNumber,
            point: response.user.point,
            type: 'CUSTOMER',
            username: '',
          })
          setFormData({
            id: response.id,
            name: response.user.name,
            username: '',
            phoneNumber: response.phoneNumber,
          })
        } else {
          throw error
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true)
    // Validation
    if (!formData.name.trim()) {
      toast.error('Họ và tên không được để trống!');
      setIsSaving(false);
      return;
    }
    // Chỉ kiểm tra username nếu là EMPLOYEE hoặc MANAGER
    if ((user?.type === 'EMPLOYEE' || user?.position === EmployeePosition.MANAGER)) {
      if (!formData.username.trim()) {
        toast.error('Tên đăng nhập không được để trống!');
        setIsSaving(false);
        return;
      }
      // Có thể bổ sung validate ký tự đặc biệt, độ dài nếu muốn
    }

    try {
      let response;
      if (user?.type === 'CUSTOMER') {
        // Cập nhật thông tin khách hàng
        response = await apiClient.put<UserProfile>('/accounts/profile', {
          id: formData.id,
          name: formData.name,
          phoneNumber: formData.phoneNumber,
        });
      } else if (user?.position === EmployeePosition.MANAGER) {
        // Chỉ MANAGER mới gửi employeeId lên /accounts/manager
        const managerPayload = {
          id: user.employeeId,
          name: formData.name,
          username: formData.username,
        };
        console.log('USER object:', user);
        console.log('PUT /accounts/manager payload:', managerPayload);
        response = await apiClient.put<UserProfile>('/accounts/manager', managerPayload);
      } else if (user?.type === 'EMPLOYEE') {
        // Nhân viên thường gửi id là EmployeeAccount id lên /employee-accounts
        const employeePayload = {
          id: user.id,
          name: formData.name,
          username: formData.username,
        };
        console.log('USER object:', user);
        console.log('PUT /employee-accounts payload:', employeePayload);
        response = await apiClient.put<UserProfile>('/employee-accounts', employeePayload);
      } else {
        toast.error('Không xác định được loại tài khoản để cập nhật!');
        setIsSaving(false);
        return;
      }
      const result = response;
      // Đảm bảo giữ lại type và position đúng cho từng loại user
      if (user?.position === EmployeePosition.MANAGER) {
        setUser({
          ...result,
          type: 'EMPLOYEE',
          position: EmployeePosition.MANAGER,
          // Giữ lại employeeId cũ để lần sau vẫn gửi đúng
          employeeId: user.employeeId,
        });
      } else if (user?.type === 'EMPLOYEE') {
        setUser({
          ...result,
          type: 'EMPLOYEE',
          position: user.position,
          employeeId: user.employeeId,
        });
      } else if (user?.type === 'CUSTOMER') {
        setUser({
          ...result,
          type: 'CUSTOMER',
        });
      } else {
        setUser(result);
      }
      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSaving(false);
    }
  }

  const handleCancel = () => {
    setFormData({
      id: user?.id || 0,
      name: user?.name || '',
      username: user?.username || '',
      phoneNumber: user?.phoneNumber || '',
    })
    setIsEditing(false)
  }

  const handleChangePassword = async () => {
    if (isChangingPassword) return;
    setIsChangingPassword(true);
    // Validation
    if (!passwordData.currentPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu hiện tại')
      setIsChangingPassword(false);
      return
    }

    if (!passwordData.newPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu mới')
      setIsChangingPassword(false);
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự')
      setIsChangingPassword(false);
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      setIsChangingPassword(false);
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('Mật khẩu mới phải khác mật khẩu hiện tại')
      setIsChangingPassword(false);
      return
    }

    try {
      let response;
      if (user?.position === EmployeePosition.MANAGER) {
        response = await apiClient.post('/accounts/manager/change-password', {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        });
      } else if (user?.type === 'EMPLOYEE') {
        response = await apiClient.post('/employee-accounts/change-password', {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        });
      } else {
        response = await apiClient.post('/accounts/change-password', {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        });
      }
      toast.success('Đổi mật khẩu thành công!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangePasswordOpen(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      const msg = error.response?.data?.message?.toLowerCase?.() || '';
      if (msg.includes('mật khẩu') && msg.includes('sai')) {
        toast.error('Mật khẩu hiện tại không đúng!');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Mật khẩu hiện tại không đúng!');
      }
    } finally {
      setIsChangingPassword(false);
    }
  }

  const getPositionLabel = (position?: string) => {
    if (!position) return 'Khách hàng thân thiết'
    switch (position) {
      case EmployeePosition.INVENTORY:
        return 'Nhân viên kiểm kê'
      case EmployeePosition.RECEIVING:
        return 'Nhân viên nhập hàng'
      case EmployeePosition.SALES:
        return 'Nhân viên hóa đơn'
      case EmployeePosition.MANAGER:
        return 'Quản lý'
      default:
        return position
    }
  }

  const getPositionColor = (position?: string) => {
    if (!position) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    switch (position) {
      case EmployeePosition.MANAGER:
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case EmployeePosition.SALES:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case EmployeePosition.INVENTORY:
        return 'bg-green-100 text-green-800 border-green-200'
      case EmployeePosition.RECEIVING:
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <Card className="p-6">
          <p className="text-gray-600">Không thể tải thông tin người dùng</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Cột trái - Avatar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Hồ sơ</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg">
                    <User className="h-16 w-16" />
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white ${
                      user.type === 'CUSTOMER'
                        ? 'bg-yellow-500'
                        : user.position === EmployeePosition.MANAGER
                          ? 'bg-purple-500'
                          : 'bg-blue-500'
                    }`}
                  >
                    {user.type === 'CUSTOMER' ? (
                      <Award className="h-5 w-5 text-white" />
                    ) : user.position === EmployeePosition.MANAGER ? (
                      <Shield className="h-5 w-5 text-white" />
                    ) : (
                      <Briefcase className="h-5 w-5 text-white" />
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="mb-1 text-xl font-semibold text-gray-900">{user.name}</h3>
                  <div
                    className={`inline-flex items-center rounded-full border px-3 py-1 ${getPositionColor(user.position)}`}
                  >
                    <span className="text-sm font-medium">{getPositionLabel(user.position)}</span>
                  </div>
                </div>

                <div className="w-full space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Mã ID:</span>
                    <span className="font-medium text-gray-900">#{user.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {user.type === 'CUSTOMER' ? 'SĐT:' : 'Username:'}
                    </span>
                    <span className="font-medium text-gray-900">
                      {user.type === 'CUSTOMER' ? user.phoneNumber : user.username}
                    </span>
                  </div>
                  {user.type === 'CUSTOMER' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Điểm tích lũy:</span>
                      <span className="font-bold text-blue-600">{user.point} điểm</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cột phải - Form */}
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
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Họ và tên */}
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
                      <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900">
                        {formData.name}
                      </div>
                    )}
                  </div>

                  {/* Username hoặc Số điện thoại */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={user.type === 'CUSTOMER' ? 'phoneNumber' : 'username'}
                      className="flex items-center gap-2"
                    >
                      {user.type === 'CUSTOMER' ? (
                        <Phone className="h-4 w-4 text-gray-500" />
                      ) : (
                        <KeyRound className="h-4 w-4 text-gray-500" />
                      )}
                      {user.type === 'CUSTOMER' ? 'Số điện thoại' : 'Tên đăng nhập'}
                    </Label>
                    {isEditing ? (
                      <Input
                        id={user.type === 'CUSTOMER' ? 'phoneNumber' : 'username'}
                        value={user.type === 'CUSTOMER' ? formData.phoneNumber : formData.username}
                        onChange={(e) =>
                          user.type === 'CUSTOMER'
                            ? setFormData({ ...formData, phoneNumber: e.target.value })
                            : setFormData({ ...formData, username: e.target.value })
                        }
                        placeholder={
                          user.type === 'CUSTOMER' ? 'Nhập số điện thoại' : 'Nhập tên đăng nhập'
                        }
                        disabled={user.type === 'CUSTOMER'} // Thường SĐT là định danh, không cho sửa dễ dàng
                      />
                    ) : (
                      <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900">
                        {user.type === 'CUSTOMER' ? formData.phoneNumber : formData.username}
                      </div>
                    )}
                  </div>

                  {/* Chức vụ - Read only */}
                  {user.type === 'EMPLOYEE' && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        Chức vụ
                      </Label>
                      <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900">
                        {getPositionLabel(user.position)}
                      </div>
                      <p className="text-xs text-gray-500">Chức vụ không thể thay đổi</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-3 border-t border-gray-200 pt-4">
                      <Button
                        onClick={handleSave}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Lưu thay đổi
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="flex-1 border-gray-300 hover:bg-gray-50"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bảo mật */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Bảo mật tài khoản</CardTitle>
                <CardDescription>Quản lý mật khẩu và bảo mật</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div>
                      <p className="font-medium text-gray-900">Mật khẩu</p>
                      <p className="text-sm text-gray-500">
                        Đổi mật khẩu định kỳ để bảo mật tài khoản
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsChangePasswordOpen(true)}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <KeyRound className="mr-2 h-4 w-4" />
                      Đổi mật khẩu
                    </Button>
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
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Nhập mật khẩu hiện tại"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="border-blue-200 focus:border-blue-600"
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleChangePassword()
                  }
                }}
                className="border-blue-200 focus:border-blue-600"
              />
              {passwordData.confirmPassword &&
                passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-xs text-red-600">Mật khẩu xác nhận không khớp</p>
                )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleClosePasswordDialog}
              className="border-gray-300 hover:bg-gray-50"
            >
              Hủy
            </Button>
            <Button
              onClick={handleChangePassword}
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={isChangingPassword}
            >
              <Save className="mr-2 h-4 w-4" />
              {isChangingPassword ? 'Đang lưu...' : 'Lưu mật khẩu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
