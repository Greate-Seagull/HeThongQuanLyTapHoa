import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Loader2 } from 'lucide-react';
import { apiClient } from '@/services/api-client';

interface User {
  id: number;
  name: string;
  point: number;
}

interface Account {
  id: number;
  phoneNumber: string;
  user: User;
}

interface ApiResponse {
  status: string;
  data: Account[];
}

export function CustomerManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/accounts');
      console.log(response);
      
      setAccounts(response);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu khách hàng');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.phoneNumber.includes(searchTerm)
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
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                {error}
                <Button 
                  onClick={fetchCustomers} 
                  className="ml-4 bg-blue-600 hover:bg-blue-700"
                >
                  Thử lại
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead className="text-blue-900">ID</TableHead>
                    <TableHead className="text-blue-900">Tên khách hàng</TableHead>
                    <TableHead className="text-blue-900">Số điện thoại</TableHead>
                    <TableHead className="text-blue-900">Điểm tích lũy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        Không tìm thấy khách hàng
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts.map((account) => (
                      <TableRow key={account.id} className="hover:bg-blue-50">
                        <TableCell>KH{account.user.id.toString().padStart(3, '0')}</TableCell>
                        <TableCell>{account.user.name}</TableCell>
                        <TableCell>{account.phoneNumber}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-700">
                            {account.user.point} điểm
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}