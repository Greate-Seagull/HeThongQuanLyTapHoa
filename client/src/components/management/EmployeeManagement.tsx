import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiClient } from '@/services/api-client'
import { toast } from 'sonner'
import { set } from 'react-hook-form'

enum EmployeePosition {
  SALES = 'SALES',
  INVENTORY = 'INVENTORY',
  RECEIVING = 'RECEIVING',
  MANAGER = 'MANAGER',
}

interface Employee {
  id: number
  name: string
  position: EmployeePosition
  hasActivity?: boolean // true nếu đã có hoạt động ở vai trò này
}

interface Account {
  id: number
  username: string
  employee: Employee
}

interface ApiResponse {
  status: string
  data: Account[]
}

const positionLabels: Record<EmployeePosition, string> = {
  [EmployeePosition.SALES]: 'Nhân viên hóa đơn',
  [EmployeePosition.INVENTORY]: 'Nhân viên kiểm kê',
  [EmployeePosition.RECEIVING]: 'Nhân viên nhập hàng',
  [EmployeePosition.MANAGER]: 'Quản lý',
}

const API_BASE_URL = 'http://localhost:3002/employee-accounts' // Thay đổi URL này

export function EmployeeManagement() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number; name: string }>({
    open: false,
    id: 0,
    name: '',
  })
  const [formData, setFormData] = useState({
    name: '',
    position: EmployeePosition.SALES,
    username: '',
    password: '',
  })

  // Fetch accounts from API
  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get<Account[]>('/employee-accounts')
      // Nếu backend chưa trả về hasActivity, có thể cần map lại ở đây
      setAccounts(
        response.map((acc) => ({
          ...acc,
          employee: {
            ...acc.employee,
            hasActivity: acc.employee.hasActivity ?? false, // fallback nếu chưa có
          },
        }))
      )
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAccounts = accounts
    .filter(
      (account) =>
        account.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.employee.id - a.employee.id)

  const handleAdd = () => {
    setEditingAccount(null)
    setFormData({ name: '', position: EmployeePosition.SALES, username: '', password: '' })
    setSearchTerm('') // Reset search input when opening add dialog
    setIsDialogOpen(true)
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      name: account.employee.name,
      position: account.employee.position,
      username: account.username, // keep for display, but disable editing
      password: '', // not editable
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number, name: string) => {
    setDeleteConfirm({ open: true, id, name })
  }

  const confirmDelete = async () => {
    try {
      const response = await apiClient.delete(`/employee-accounts/${deleteConfirm.id}`)
      if (response) {
        fetchAccounts()
        toast.success('Tài khoản nhân viên đã được xóa thành công!')
      }
    } catch (error: any) {
      // Check for foreign key constraint error from backend
      const backendMsg = error?.response?.data?.message || ''
      if (
        backendMsg.includes('foreign key') ||
        backendMsg.includes('constraint') ||
        backendMsg.includes('FK_') ||
        backendMsg.includes('đã có dữ liệu hoạt động') ||
        error?.response?.status === 400
      ) {
        // Show specific backend reason if available, else generic business message
        const detail =
          backendMsg && backendMsg !== '' && backendMsg !== 'đã có dữ liệu hoạt động'
            ? backendMsg
            : `Nhân viên này đã có dữ liệu hoạt động (Hóa đơn, Nhập hàng hoặc Kiểm kê).`
        toast.error(`Không thể xóa nhân viên "${deleteConfirm.name}": ${detail}`)
      }
    } finally {
      setDeleteConfirm({ open: false, id: 0, name: '' })
    }
  }

  const handleSave = async () => {
    // Validate không cho phép tên rỗng khi thêm hoặc sửa
    if (!formData.name.trim()) {
      toast.error('Tên nhân viên không được để trống!')
      return
    }
    // Validate không cho phép username rỗng khi thêm mới
    if (!editingAccount && !formData.username.trim()) {
      toast.error('Username không được để trống!')
      return
    }
    // Validate password khi thêm mới nhân viên
    if (!editingAccount) {
      if (!formData.password.trim()) {
        toast.error('Mật khẩu không được để trống!')
        return
      }
      if (formData.password.length < 6) {
        toast.error('Mật khẩu phải có ít nhất 6 ký tự!')
        return
      }
    }
    setIsSaving(true)
    try {
      let response
      if (editingAccount) {
        // Edit: only allow name and position
        response = await apiClient.patch(`/employees/${editingAccount.employee.id}`, {
          name: formData.name,
          position: formData.position,
        })
        if (response) {
          fetchAccounts()
          toast.success('Cập nhật nhân viên thành công!')
        } else {
          toast.error('Cập nhật nhân viên thất bại. Vui lòng thử lại.')
        }
      } else {
        // Create new
        response = await apiClient.post(`/employees`, {
          username: formData.username,
          name: formData.name,
          password: formData.password,
          position: formData.position,
        })
        if (response) {
          fetchAccounts()
          toast.success('Nhân viên đã được tạo thành công!')
        } else {
          toast.error('Tạo nhân viên thất bại. Vui lòng thử lại.')
        }
      }
      setIsDialogOpen(false)
    } catch (error: any) {
      const backendMsg = error?.response?.data?.message || ''
      if (
        error?.response?.status === 409 ||
        (backendMsg.toLowerCase().includes('username') &&
          (backendMsg.toLowerCase().includes('tồn tại') ||
            backendMsg.toLowerCase().includes('exists') ||
            backendMsg.toLowerCase().includes('duplicate')))
      ) {
        toast.error('Tên đăng nhập (username) đã tồn tại, vui lòng chọn tên khác!')
      } else {
        toast.error(backendMsg || 'Đã xảy ra lỗi. Vui lòng thử lại.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-900">Quản lý tài khoản nhân viên</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex max-w-md flex-1 gap-2">
              <Input
                placeholder="Tìm kiếm theo tên hoặc username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-blue-200"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Thêm tài khoản
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-blue-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead className="text-blue-900">ID Tài khoản</TableHead>
                    <TableHead className="text-blue-900">Username</TableHead>
                    <TableHead className="text-blue-900">Tên nhân viên</TableHead>
                    <TableHead className="text-blue-900">Chức vụ</TableHead>
                    <TableHead className="text-right text-blue-900">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                        Không tìm thấy tài khoản
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts.map((account) => (
                      <TableRow key={account.id} className="hover:bg-blue-50">
                        <TableCell className="font-medium">NV{account.employee.id}</TableCell>{' '}
                        <TableCell className="font-medium text-blue-600">
                          {account.username}
                        </TableCell>
                        <TableCell>{account.employee.name}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                              account.employee.position === EmployeePosition.SALES
                                ? 'bg-purple-100 text-purple-700'
                                : account.employee.position === EmployeePosition.INVENTORY
                                  ? 'bg-green-100 text-green-700'
                                  : account.employee.position === EmployeePosition.RECEIVING
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {positionLabels[account.employee.position]}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(account)}
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(account.employee.id, account.employee.name)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-blue-200">
          <DialogHeader>
            <DialogTitle className="text-blue-900">
              {editingAccount ? 'Sửa thông tin tài khoản' : 'Thêm tài khoản mới'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editingAccount
                ? 'Cập nhật thông tin tài khoản và nhân viên.'
                : 'Tạo tài khoản mới cho nhân viên.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="border-blue-200"
                placeholder="Nhập username"
                disabled={!!editingAccount} // disable editing username when editing
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Tên nhân viên
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-blue-200"
                placeholder="Nhập tên nhân viên"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium">
                Chức vụ
              </Label>
              <Select
                value={formData.position}
                onValueChange={(value) =>
                  setFormData({ ...formData, position: value as EmployeePosition })
                }
                disabled={!!editingAccount && editingAccount.employee.hasActivity}
              >
                <SelectTrigger
                  className="border-blue-200"
                  disabled={!!editingAccount && editingAccount.employee.hasActivity}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EmployeePosition.SALES}>Nhân viên hóa đơn</SelectItem>
                  <SelectItem value={EmployeePosition.INVENTORY}>Nhân viên kiểm kê</SelectItem>
                  <SelectItem value={EmployeePosition.RECEIVING}>Nhân viên nhập hàng</SelectItem>
                  <SelectItem value={EmployeePosition.MANAGER}>Quản lý</SelectItem>
                </SelectContent>
              </Select>
              {/* Nếu không cho đổi chức vụ, hiển thị cảnh báo */}
              {editingAccount && editingAccount.employee.hasActivity && (
                <div className="mt-1 text-xs text-red-500">
                  Không thể đổi chức vụ vì nhân viên đã có hoạt động ở vai trò này.
                </div>
              )}
            </div>
            {/* Only show password input when adding a new employee */}
            {!editingAccount && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border-blue-200"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-blue-200"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSaving} // ← Thêm dòng này
            >
              {isSaving ? ( // ← Thêm dòng này
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản của "{deleteConfirm.name}"? Hành động này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm({ open: false, id: 0, name: '' })}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
