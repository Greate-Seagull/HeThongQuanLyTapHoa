import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

enum PromotionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

interface Promotion {
  id: number;
  name: string;
  description: string | null;
  startedAt: Date;
  endedAt: Date;
  condition: string | null;
  value: number;
  promotionType: PromotionType;
}

const mockPromotions: Promotion[] = [
  { 
    id: 1, 
    name: 'Giảm giá mùa hè', 
    description: 'Giảm 20% cho tất cả sản phẩm',
    startedAt: new Date('2024-06-01'),
    endedAt: new Date('2024-08-31'),
    condition: 'Đơn hàng từ 100,000đ',
    value: 20,
    promotionType: PromotionType.PERCENTAGE
  },
  { 
    id: 2, 
    name: 'Khuyến mãi tết', 
    description: 'Giảm 30% dịp tết nguyên đán',
    startedAt: new Date('2024-01-01'),
    endedAt: new Date('2024-02-15'),
    condition: 'Đơn hàng từ 200,000đ',
    value: 30,
    promotionType: PromotionType.PERCENTAGE
  },
  { 
    id: 3, 
    name: 'Giảm giá cố định', 
    description: 'Giảm 50,000đ cho đơn hàng',
    startedAt: new Date('2024-11-01'),
    endedAt: new Date('2024-12-31'),
    condition: 'Đơn hàng từ 300,000đ',
    value: 50000,
    promotionType: PromotionType.FIXED
  },
];

export function PromotionManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startedAt: '',
    endedAt: '',
    condition: '',
    value: 0,
    promotionType: PromotionType.PERCENTAGE,
  });

  const filteredPromotions = promotions.filter(promo =>
    promo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingPromotion(null);
    setFormData({ 
      name: '', 
      description: '', 
      startedAt: '', 
      endedAt: '', 
      condition: '',
      value: 0,
      promotionType: PromotionType.PERCENTAGE
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description || '',
      startedAt: promotion.startedAt.toISOString().split('T')[0],
      endedAt: promotion.endedAt.toISOString().split('T')[0],
      condition: promotion.condition || '',
      value: promotion.value,
      promotionType: promotion.promotionType,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      setPromotions(promotions.filter(promo => promo.id !== id));
    }
  };

  const handleSave = () => {
    if (editingPromotion) {
      setPromotions(promotions.map(promo =>
        promo.id === editingPromotion.id 
          ? { 
              ...promo,
              name: formData.name,
              description: formData.description || null,
              startedAt: new Date(formData.startedAt),
              endedAt: new Date(formData.endedAt),
              condition: formData.condition || null,
              value: formData.value,
              promotionType: formData.promotionType
            } 
          : promo
      ));
    } else {
      const newId = Math.max(...promotions.map(p => p.id), 0) + 1;
      setPromotions([...promotions, { 
        id: newId,
        name: formData.name,
        description: formData.description || null,
        startedAt: new Date(formData.startedAt),
        endedAt: new Date(formData.endedAt),
        condition: formData.condition || null,
        value: formData.value,
        promotionType: formData.promotionType
      }]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-900">Quản Lý Khuyến Mãi</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2 flex-1 max-w-md">
              <Input
                placeholder="Tìm kiếm theo tên khuyến mãi..."
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
              Thêm khuyến mãi
            </Button>
          </div>

          <div className="border border-blue-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-blue-900">ID</TableHead>
                  <TableHead className="text-blue-900">Tên khuyến mãi</TableHead>
                  <TableHead className="text-blue-900">Loại</TableHead>
                  <TableHead className="text-blue-900">Giá trị</TableHead>
                  <TableHead className="text-blue-900">Ngày bắt đầu</TableHead>
                  <TableHead className="text-blue-900">Ngày kết thúc</TableHead>
                  <TableHead className="text-blue-900 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.map((promo) => (
                  <TableRow key={promo.id} className="hover:bg-blue-50">
                    <TableCell>KM{promo.id.toString().padStart(3, '0')}</TableCell>
                    <TableCell>{promo.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-sm ${
                        promo.promotionType === PromotionType.PERCENTAGE
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {promo.promotionType === PromotionType.PERCENTAGE ? 'Phần trăm' : 'Cố định'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {promo.promotionType === PromotionType.PERCENTAGE 
                        ? `${promo.value}%`
                        : `${promo.value.toLocaleString('vi-VN')}đ`
                      }
                    </TableCell>
                    <TableCell>{promo.startedAt.toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{promo.endedAt.toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(promo)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(promo.id)}
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
        <DialogContent className="border-blue-200 max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-blue-900">
              {editingPromotion ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editingPromotion ? 'Cập nhật thông tin khuyến mãi hiện tại' : 'Tạo một khuyến mãi mới'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên khuyến mãi</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border-blue-200"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="promotionType">Loại khuyến mãi</Label>
                <Select
                  value={formData.promotionType}
                  onValueChange={(value) => setFormData({ ...formData, promotionType: value as PromotionType })}
                >
                  <SelectTrigger className="border-blue-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PromotionType.PERCENTAGE}>Phần trăm (%)</SelectItem>
                    <SelectItem value={PromotionType.FIXED}>Giá cố định (VNĐ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">
                  {formData.promotionType === PromotionType.PERCENTAGE ? 'Giá trị (%)' : 'Giá trị (VNĐ)'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value || ''}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  className="border-blue-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Điều kiện áp dụng</Label>
              <Input
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="border-blue-200"
                placeholder="VD: Đơn hàng từ 100,000đ"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startedAt">Ngày bắt đầu</Label>
                <Input
                  id="startedAt"
                  type="date"
                  value={formData.startedAt}
                  onChange={(e) => setFormData({ ...formData, startedAt: e.target.value })}
                  className="border-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endedAt">Ngày kết thúc</Label>
                <Input
                  id="endedAt"
                  type="date"
                  value={formData.endedAt}
                  onChange={(e) => setFormData({ ...formData, endedAt: e.target.value })}
                  className="border-blue-200"
                />
              </div>
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
