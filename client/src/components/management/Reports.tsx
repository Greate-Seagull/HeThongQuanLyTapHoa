import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Package, DollarSign } from 'lucide-react';

export function Reports() {
  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-900">Báo Cáo Chênh Lệch Theo Tháng</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <Select defaultValue="2024">
              <SelectTrigger className="w-40 border-blue-200">
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="11">
              <SelectTrigger className="w-40 border-blue-200">
                <SelectValue placeholder="Chọn tháng" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    Tháng {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <BarChart3 className="mr-2 h-4 w-4" />
              Xem báo cáo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Doanh thu</p>
                    <p className="text-blue-900">850,000,000đ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lợi nhuận</p>
                    <p className="text-blue-900">125,000,000đ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tồn kho</p>
                    <p className="text-blue-900">1,245 sản phẩm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
            <h3 className="text-blue-900 mb-4">Chênh lệch so với tháng trước</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Doanh thu:</span>
                <span className="text-green-600">+12.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lợi nhuận:</span>
                <span className="text-green-600">+8.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hàng tồn kho:</span>
                <span className="text-red-600">-5.2%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
