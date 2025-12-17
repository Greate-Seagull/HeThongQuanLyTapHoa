import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';

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
  const [users] = useState<UserWithAccount[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.account?.phoneNumber.includes(searchTerm)
  );

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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
