import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface User {
  id: number;
  name: string;
  point: number;
}

interface Account {
  id: number;
  userId: number;
  phoneNumber: string;
  passwordHash: string;
  salt: string;
  loggedAt: Date;
}

interface UserWithAccount extends User {
  account?: Account;
}

const mockUsers: UserWithAccount[] = [
  { 
    id: 1, 
    name: 'Nguyễn Văn A', 
    point: 1250,
    account: {
      id: 1,
      userId: 1,
      phoneNumber: '0901234567',
      passwordHash: 'hash',
      salt: 'salt',
      loggedAt: new Date('2024-11-20')
    }
  },
  { 
    id: 2, 
    name: 'Trần Thị B', 
    point: 850,
    account: {
      id: 2,
      userId: 2,
      phoneNumber: '0912345678',
      passwordHash: 'hash',
      salt: 'salt',
      loggedAt: new Date('2024-11-18')
    }
  },
  { 
    id: 3, 
    name: 'Lê Văn C', 
    point: 2100,
    account: {
      id: 3,
      userId: 3,
      phoneNumber: '0923456789',
      passwordHash: 'hash',
      salt: 'salt',
      loggedAt: new Date('2024-11-22')
    }
  },
  { 
    id: 4, 
    name: 'Phạm Thị D', 
    point: 500,
    account: {
      id: 4,
      userId: 4,
      phoneNumber: '0934567890',
      passwordHash: 'hash',
      salt: 'salt',
      loggedAt: new Date('2024-11-15')
    }
  },
];

export function CustomerManagement() {
  const [users, setUsers] = useState<UserWithAccount[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithAccount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    point: 0,
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.account?.phoneNumber.includes(searchTerm)
  );

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', phoneNumber: '', point: 0 });
    setIsDialogOpen(true);
  };

  const handleEdit = (user: UserWithAccount) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      phoneNumber: user.account?.phoneNumber || '',
      point: user.point,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const handleSave = () => {
    if (editingUser) {
      setUsers(users.map(user =>
        user.id === editingUser.id 
          ? { 
              ...user, 
              name: formData.name, 
              point: formData.point,
              account: user.account ? {
                ...user.account,
                phoneNumber: formData.phoneNumber,
              } : undefined
            } 
          : user
      ));
    } else {
      const newId = Math.max(...users.map(u => u.id), 0) + 1;
      const newUser: UserWithAccount = {
        id: newId,
        name: formData.name,
        point: formData.point,
        account: {
          id: newId,
          userId: newId,
          phoneNumber: formData.phoneNumber,
          passwordHash: 'hash',
          salt: 'salt',
          loggedAt: new Date(),
        }
      };
      setUsers([...users, newUser]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-900">Quản Lý Khách Hàng</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2 flex-1 max-w-md">
              <Input
                placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
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
              Thêm khách hàng
            </Button>
          </div>

          <div className="border border-blue-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-blue-900">ID</TableHead>
                  <TableHead className="text-blue-900">Tên khách hàng</TableHead>
                  <TableHead className="text-blue-900">Số điện thoại</TableHead>
                  <TableHead className="text-blue-900">Điểm tích lũy</TableHead>
                  <TableHead className="text-blue-900">Đăng nhập lần cuối</TableHead>
                  <TableHead className="text-blue-900 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-blue-50">
                    <TableCell>KH{user.id.toString().padStart(3, '0')}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.account?.phoneNumber || '-'}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-700">
                        {user.point} điểm
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.account?.loggedAt 
                        ? new Date(user.account.loggedAt).toLocaleDateString('vi-VN')
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
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
              {editingUser ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editingUser ? 'Cập nhật thông tin khách hàng hiện tại.' : 'Thêm một khách hàng mới vào hệ thống.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên khách hàng</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="border-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="point">Điểm tích lũy</Label>
              <Input
                id="point"
                type="number"
                value={formData.point || ''}
                onChange={(e) => setFormData({ ...formData, point: parseInt(e.target.value) || 0 })}
                className="border-blue-200"
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
    </div>
  );
}
