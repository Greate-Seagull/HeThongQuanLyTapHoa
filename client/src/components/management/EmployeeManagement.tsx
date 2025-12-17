import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const API_BASE_URL = 'http://localhost:3001/employee-accounts' // Thay đổi URL này

export function EmployeeManagement() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [searchTerm, setSearchTerm] = useState('')
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
  })

  // Fetch accounts from API
  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get<Account[]>('/employee-accounts')
      console.log(response)

      setAccounts(response)
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAccounts = accounts.filter(
    (account) =>
      account.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setEditingAccount(null)
    setFormData({ name: '', position: EmployeePosition.SALES, username: '' })
    setIsDialogOpen(true)
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      name: account.employee.name,
      position: account.employee.position,
      username: account.username,
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
        setDeleteConfirm({ open: false, id: 0, name: '' })
      } else {
        toast.error('Xóa tài khoản thất bại. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  const handleSave = async () => {
    try {
      if (editingAccount) {
        // Update existing account
        const response = await apiClient.put<Account>(`/employee-accounts`, {
          id: editingAccount.id,
          username: formData.username,
          name: formData.name,
          position: formData.position,
        })
        if (response) {
          fetchAccounts()
          toast.success('Tài khoản nhân viên đã được cập nhật thành công!')
        } else {
          toast.error('Cập nhật tài khoản thất bại. Vui lòng thử lại.')
        }
      } else {
        // Create new account
        const response = await apiClient.post<Account>(`/employee-accounts`, {
          username: formData.username,
          name: formData.name,
          position: formData.position,
        })
        if (response) {
          fetchAccounts()
          toast.success('Tài khoản nhân viên đã được tạo thành công!')
        } else {
          toast.error('Tạo tài khoản thất bại. Vui lòng thử lại.')
        }
      }
      setIsDialogOpen(false)
    } catch (error) {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <CardTitle className="text-2xl text-white">Quản lý tài khoản nhân viên</CardTitle>
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
                <table className="w-full">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-blue-900">ID Tài khoản</th>
                      <th className="p-4 text-left font-semibold text-blue-900">Username</th>
                      <th className="p-4 text-left font-semibold text-blue-900">Tên nhân viên</th>
                      <th className="p-4 text-left font-semibold text-blue-900">Chức vụ</th>
                      <th className="p-4 text-right font-semibold text-blue-900">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account) => (
                      <tr key={account.id} className="border-t border-blue-100 hover:bg-blue-50">
                        <td className="p-4 font-medium">{account.employee.id}</td>
                        <td className="p-4 font-medium text-blue-600">{account.username}</td>
                        <td className="p-4">{account.employee.name}</td>
                        <td className="p-4">
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
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(account)}
                            className="mr-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="border-blue-200">
            <DialogHeader>
              <DialogTitle className="text-xl text-blue-900">
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
                >
                  <SelectTrigger className="border-blue-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EmployeePosition.SALES}>Nhân viên hóa đơn</SelectItem>
                    <SelectItem value={EmployeePosition.INVENTORY}>Nhân viên kiểm kê</SelectItem>
                    <SelectItem value={EmployeePosition.RECEIVING}>Nhân viên nhập hàng</SelectItem>
                    <SelectItem value={EmployeePosition.MANAGER}>Quản lý</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-blue-200"
              >
                Hủy
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                Lưu
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
    </div>
  )
}
