import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

enum EmployeePosition {
  SALES = 'SALES',
  INVENTORY = 'INVENTORY',
  RECEIVING = 'RECEIVING',
  MANAGER = 'MANAGER',
}

interface Employee {
  id: number;
  name: string;
  position: EmployeePosition;
}

interface EmployeeAccount {
  id: number;
  employeeId: number;
  username: string;
  passwordHash: string;
  salt: string;
  loggedAt: Date;
}

interface EmployeeWithAccount extends Employee {
  account?: EmployeeAccount;
}

const mockEmployees: EmployeeWithAccount[] = [
  { 
    id: 1, 
    name: 'Nguyễn Văn Kiểm', 
    position: EmployeePosition.INVENTORY,
    account: {
      id: 1,
      employeeId: 1,
      username: 'nvkiem',
      passwordHash: 'hash',
      salt: 'salt',
      loggedAt: new Date('2024-11-20')
    }
  },
  { 
    id: 2, 
    name: 'Trần Thị Nhập', 
    position: EmployeePosition.RECEIVING,
    account: {
      id: 2,
      employeeId: 2,
      username: 'ttnhap',
      passwordHash: 'hash',
      salt: 'salt',
      loggedAt: new Date('2024-11-21')
    }
  },
  { 
    id: 3, 
    name: 'Lê Văn Bán', 
    position: EmployeePosition.SALES,
    account: {
      id: 3,
      employeeId: 3,
      username: 'lvban',
      passwordHash: 'hash',
      salt: 'salt',
      loggedAt: new Date('2024-11-22')
    }
  },
  { 
    id: 4, 
    name: 'Phạm Thị Lan', 
    position: EmployeePosition.INVENTORY
  },
  { 
    id: 5, 
    name: 'Hoàng Văn Hùng', 
    position: EmployeePosition.RECEIVING
  },
];

const positionLabels: Record<EmployeePosition, string> = {
  [EmployeePosition.SALES]: 'Nhân viên hóa đơn',
  [EmployeePosition.INVENTORY]: 'Nhân viên kiểm kê',
  [EmployeePosition.RECEIVING]: 'Nhân viên nhập hàng',
  [EmployeePosition.MANAGER]: 'Quản lý',
}

const API_BASE_URL = 'http://localhost:3001/employee-accounts' // Thay đổi URL này

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<EmployeeWithAccount[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeWithAccount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number; name: string }>({
    open: false,
    id: 0,
    name: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    position: EmployeePosition.SALES,
    username: '',
  });

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.account?.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({ name: '', position: EmployeePosition.SALES, username: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (employee: EmployeeWithAccount) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      position: employee.position,
      username: employee.account?.username || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const confirmDelete = () => {
    setEmployees(employees.filter(employee => employee.id !== deleteConfirm.id));
  };

  const handleSave = () => {
    if (editingEmployee) {
      setEmployees(employees.map(employee =>
        employee.id === editingEmployee.id 
          ? { 
              ...employee, 
              name: formData.name, 
              position: formData.position,
              account: formData.username ? {
                ...employee.account!,
                username: formData.username,
              } : employee.account
            } 
          : employee
      ));
    } else {
      const newId = Math.max(...employees.map(e => e.id), 0) + 1;
      const newEmployee: EmployeeWithAccount = {
        id: newId,
        name: formData.name,
        position: formData.position,
      };
      if (formData.username) {
        newEmployee.account = {
          id: newId,
          employeeId: newId,
          username: formData.username,
          passwordHash: 'hash',
          salt: 'salt',
          loggedAt: new Date(),
        };
      }
      setEmployees([...employees, newEmployee]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-900">Quản Lý Nhân Viên</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2 flex-1 max-w-md">
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
              Thêm nhân viên
            </Button>
          </div>

          <div className="border border-blue-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-blue-900">ID</TableHead>
                  <TableHead className="text-blue-900">Tên nhân viên</TableHead>
                  <TableHead className="text-blue-900">Chức vụ</TableHead>
                  <TableHead className="text-blue-900">Username</TableHead>
                  <TableHead className="text-blue-900">Đăng nhập lần cuối</TableHead>
                  <TableHead className="text-blue-900 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-blue-50">
                    <TableCell>{employee.id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-sm ${
                        employee.position === EmployeePosition.SALES 
                          ? 'bg-purple-100 text-purple-700'
                          : employee.position === EmployeePosition.INVENTORY
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {positionLabels[employee.position]}
                      </span>
                    </TableCell>
                    <TableCell>{employee.account?.username || '-'}</TableCell>
                    <TableCell>
                      {employee.account?.loggedAt 
                        ? new Date(employee.account.loggedAt).toLocaleDateString('vi-VN')
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(employee.id, employee.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-blue-200" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-blue-900">
              {editingEmployee ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editingEmployee ? 'Cập nhật thông tin nhân viên hiện tại.' : 'Tạo một nhân viên mới.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên nhân viên</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Chức vụ</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData({ ...formData, position: value as EmployeePosition })}
              >
                <SelectTrigger className="border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EmployeePosition.SALES}>Nhân viên hóa đơn</SelectItem>
                  <SelectItem value={EmployeePosition.INVENTORY}>Nhân viên kiểm kê</SelectItem>
                  <SelectItem value={EmployeePosition.RECEIVING}>Nhân viên nhập hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="border-blue-200"
                placeholder="Để trống nếu chưa có tài khoản"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-blue-200">
              Hủy
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa nhân viên "${deleteConfirm.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDelete}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
}
