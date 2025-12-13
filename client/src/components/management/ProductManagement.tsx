import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus, Edit, Trash2, Search, Save, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

enum ProductUnit {
  UNKNOWN = 'UNKNOWN',
}

enum ProductStatus {
  GOOD = 'GOOD',
  EXPIRED = 'EXPIRED',
}

interface Product {
  id: number;
  name: string;
  unit: ProductUnit;
  price: number;
  barcode: number;
  amount: number;
  status: ProductStatus;
  supplier?: {
    id: number;
    name: string;
  } | null;
  category?: {
    id: number;
    name: string;
  } | null;
}

interface PendingProduct {
  tempId: string;
  id?: number;
  name: string;
  unit: ProductUnit;
  price: number;
  barcode: number;
  amount: number;
  status: ProductStatus;
  isNew: boolean;
  supplier?: {
    id: number;
    name: string;
  } | null;
  category?: {
    id: number;
    name: string;
  } | null;
}

const mockProducts: Product[] = [
  { 
    id: 1, 
    name: 'Coca Cola 330ml', 
    unit: ProductUnit.UNKNOWN, 
    price: 10000, 
    barcode: 8934673123456, 
    amount: 150, 
    status: ProductStatus.GOOD,
    supplier: { id: 1, name: 'Công ty Nước Giải Khát Coca-Cola' },
    category: { id: 1, name: 'Nước giải khát' }
  },
  { 
    id: 2, 
    name: 'Pepsi 330ml', 
    unit: ProductUnit.UNKNOWN, 
    price: 9500, 
    barcode: 8934673123457, 
    amount: 200, 
    status: ProductStatus.GOOD,
    supplier: { id: 2, name: 'Công ty PepsiCo Việt Nam' },
    category: { id: 1, name: 'Nước giải khát' }
  },
  { 
    id: 3, 
    name: 'Bánh Oreo', 
    unit: ProductUnit.UNKNOWN, 
    price: 15000, 
    barcode: 8934673123458, 
    amount: 80, 
    status: ProductStatus.GOOD,
    supplier: { id: 3, name: 'Mondelez Kinh Đô' },
    category: { id: 2, name: 'Bánh kẹo' }
  },
  { 
    id: 4, 
    name: 'Mì Hảo Hảo', 
    unit: ProductUnit.UNKNOWN, 
    price: 4000, 
    barcode: 8934673123459, 
    amount: 300, 
    status: ProductStatus.GOOD,
    supplier: { id: 4, name: 'Công ty Acecook Việt Nam' },
    category: { id: 3, name: 'Mì ăn liền' }
  },
  { 
    id: 5, 
    name: 'Sữa TH True Milk', 
    unit: ProductUnit.UNKNOWN, 
    price: 28000, 
    barcode: 8934673123460, 
    amount: 50, 
    status: ProductStatus.GOOD,
    supplier: { id: 5, name: 'TH True Milk' },
    category: { id: 4, name: 'Sữa' }
  },
];

// Mock Suppliers
const mockSuppliers = [
  { id: 1, name: 'Công ty Nước Giải Khát Coca-Cola' },
  { id: 2, name: 'Công ty PepsiCo Việt Nam' },
  { id: 3, name: 'Mondelez Kinh Đô' },
  { id: 4, name: 'Công ty Acecook Việt Nam' },
  { id: 5, name: 'TH True Milk' },
];

// Mock Categories
const mockCategories = [
  { id: 1, name: 'Nước giải khát' },
  { id: 2, name: 'Bánh kẹo' },
  { id: 3, name: 'Mì ăn liền' },
  { id: 4, name: 'Sữa' },
];

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [cancelConfirm, setCancelConfirm] = useState({ open: false });
  const [formData, setFormData] = useState({
    name: '',
    unit: ProductUnit.UNKNOWN,
    price: 0,
    barcode: 0,
    amount: 0, // Always 0 when creating, increased via goods receipt
    status: ProductStatus.GOOD,
    supplierId: 0,
    categoryId: 0,
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.toString().includes(searchTerm)
  );

  // Bước 1: Mở màn hình thêm hàng hóa
  const handleOpenAddDialog = () => {
    setFormData({ 
      name: '', 
      unit: ProductUnit.UNKNOWN, 
      price: 0, 
      barcode: 0, 
      amount: 0, 
      status: ProductStatus.GOOD,
      supplierId: 0,
      categoryId: 0,
    });
    setPendingProducts([]);
    setIsDialogOpen(true);
  };

  // Bước 4-5: Thêm hàng hóa vào danh sách tạm
  const handleAddToPendingList = () => {
    // Validation cơ bản
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên hàng hóa');
      return;
    }
    if (formData.price <= 0) {
      toast.error('Giá phải lớn hơn 0');
      return;
    }
    if (!formData.barcode || formData.barcode.toString().length < 10) {
      toast.error('Barcode phải hợp lệ (ít nhất 10 số)');
      return;
    }

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const newPending: PendingProduct = {
      tempId,
      name: formData.name,
      unit: formData.unit,
      price: formData.price,
      barcode: formData.barcode,
      amount: formData.amount,
      status: formData.status,
      isNew: true,
    };

    setPendingProducts([...pendingProducts, newPending]);
    toast.success('Đã thêm vào danh sách');
    
    // Reset form
    setFormData({ 
      name: '', 
      unit: ProductUnit.UNKNOWN, 
      price: 0, 
      barcode: 0, 
      amount: 0, 
      status: ProductStatus.GOOD,
      supplierId: 0,
      categoryId: 0,
    });
  };

  // Xóa khỏi danh sách tạm
  const handleRemoveFromPending = (tempId: string) => {
    setPendingProducts(pendingProducts.filter(p => p.tempId !== tempId));
    toast.info('Đã xóa khỏi danh sách');
  };

  // Bước 6-11: Xác nhận và lưu toàn bộ danh sách
  const handleConfirmBatch = () => {
    if (pendingProducts.length === 0) {
      toast.error('Danh sách trống');
      return;
    }

    // Bước 7: Tiếp nhận danh sách hàng hóa
    // Bước 8: Kiểm tra từng hàng hóa
    let hasError = false;
    const validatedProducts: PendingProduct[] = [];

    for (const pending of pendingProducts) {
      // Kiểm tra giá > 0
      if (pending.price <= 0) {
        toast.error(`${pending.name}: Giá phải lớn hơn 0`);
        hasError = true;
        break;
      }

      // Kiểm tra barcode hợp lệ
      if (!pending.barcode || pending.barcode.toString().length < 10) {
        toast.error(`${pending.name}: Barcode không hợp lệ`);
        hasError = true;
        break;
      }

      // Kiểm tra hàng hóa có tồn tại (nếu không phải mới)
      if (!pending.isNew && pending.id) {
        const existingProduct = products.find(p => p.id === pending.id);
        if (!existingProduct) {
          toast.error(`${pending.name}: Sản phẩm không tồn tại trong hệ thống`);
          hasError = true;
          break;
        }
      }

      validatedProducts.push(pending);
    }

    if (hasError) {
      return;
    }

    // Bước 9-10: Cập nhật/Thêm mới từng hàng hóa và ghi nhận
    const updatedProducts = [...products];
    let newProductId = Math.max(...products.map(p => p.id), 0) + 1;

    validatedProducts.forEach(pending => {
      if (pending.isNew) {
        // Thêm mới
        updatedProducts.push({
          id: newProductId++,
          name: pending.name,
          unit: pending.unit,
          price: pending.price,
          barcode: pending.barcode,
          amount: pending.amount,
          status: pending.status,
        });
      } else if (pending.id) {
        // Cập nhật
        const index = updatedProducts.findIndex(p => p.id === pending.id);
        if (index !== -1) {
          updatedProducts[index] = {
            ...updatedProducts[index],
            name: pending.name,
            unit: pending.unit,
            price: pending.price,
            barcode: pending.barcode,
            amount: pending.amount,
            status: pending.status,
          };
        }
      }
    });

    setProducts(updatedProducts);
    setPendingProducts([]);
    setIsDialogOpen(false);
    
    // Bước 11: Hiển thị thông báo thành công
    toast.success(`Cập nhật ${validatedProducts.length} hàng hóa thành công!`);
  };

  // Hủy bỏ
  const handleCancelBatch = () => {
    if (pendingProducts.length > 0) {
      setCancelConfirm({ open: true });
    } else {
      setIsDialogOpen(false);
    }
  };

  const confirmCancel = () => {
    setPendingProducts([]);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-900">Quản Lý Sản Phẩm</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2 flex-1 max-w-md">
              <Input
                placeholder="Tìm kiếm theo tên hoặc mã vạch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-blue-200"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleOpenAddDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Thêm hàng hóa
            </Button>
          </div>

          <div className="border border-blue-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-blue-900">Mã vạch</TableHead>
                  <TableHead className="text-blue-900">Tên sản phẩm</TableHead>
                  <TableHead className="text-blue-900">Mã loại SP</TableHead>
                  <TableHead className="text-blue-900">Nhà cung cấp</TableHead>
                  <TableHead className="text-blue-900">Số lượng</TableHead>
                  <TableHead className="text-blue-900">Giá</TableHead>
                  <TableHead className="text-blue-900">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-blue-50">
                    <TableCell>{product.barcode}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      {product.category ? (
                        <span className="px-2 py-1 rounded text-sm bg-purple-100 text-purple-700">
                          {product.category.id}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.supplier ? product.supplier.name : <span className="text-gray-400">Chưa có</span>}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{product.amount}</span>
                    </TableCell>
                    <TableCell>{product.price.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-sm ${
                        product.status === ProductStatus.GOOD 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.status === ProductStatus.GOOD ? 'Tốt' : 'Hết hạn'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog thêm hàng hóa theo batch */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-blue-200 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Thêm hàng hóa</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Chọn hoặc nhập thông tin hàng hóa, thêm vào danh sách và xác nhận
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Bước 2-3: Form nhập thông tin */}
            <div className="space-y-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
              {/* Bước 3-4: Form nhập/chỉnh sửa thông tin */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên hàng hóa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-blue-200 bg-white"
                    placeholder="Nhập tên hàng hóa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode *</Label>
                  <Input
                    id="barcode"
                    type="number"
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: parseInt(e.target.value) || 0 })}
                    className="border-blue-200 bg-white"
                    placeholder="Nhập mã vạch"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Giá bán (VNĐ) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className="border-blue-200 bg-white"
                    placeholder="Nhập giá bán"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Đơn vị tính</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value as ProductUnit })}
                  >
                    <SelectTrigger className="border-blue-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductUnit.UNKNOWN}>Không xác định</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Nhà cung cấp</Label>
                  <Select
                    value={formData.supplierId.toString()}
                    onValueChange={(value) => setFormData({ ...formData, supplierId: parseInt(value) })}
                  >
                    <SelectTrigger className="border-blue-200 bg-white">
                      <SelectValue placeholder="Chọn nhà cung cấp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">-- Không chọn --</SelectItem>
                      {mockSuppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Loại sản phẩm</Label>
                  <Select
                    value={formData.categoryId.toString()}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
                  >
                    <SelectTrigger className="border-blue-200 bg-white">
                      <SelectValue placeholder="Chọn loại sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">-- Không chọn --</SelectItem>
                      {mockCategories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as ProductStatus })}
                  >
                    <SelectTrigger className="border-blue-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductStatus.GOOD}>Tốt</SelectItem>
                      <SelectItem value={ProductStatus.EXPIRED}>Hết hạn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleAddToPendingList} 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!formData.name || !formData.barcode || !formData.price}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm vào danh sách
            </Button>

            {/* Bước 5: Hiển thị danh sách chờ */}
            {pendingProducts.length > 0 && (
              <div className="space-y-2">
                <Label>Danh sách chờ xác nhận ({pendingProducts.length} sản phẩm)</Label>
                <div className="border border-blue-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead className="text-blue-900">Tên hàng hóa</TableHead>
                        <TableHead className="text-blue-900">Barcode</TableHead>
                        <TableHead className="text-blue-900">Giá</TableHead>
                        <TableHead className="text-blue-900">SL</TableHead>
                        <TableHead className="text-blue-900">Loại</TableHead>
                        <TableHead className="text-blue-900 text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingProducts.map((pending) => (
                        <TableRow key={pending.tempId} className="hover:bg-blue-50">
                          <TableCell>{pending.name}</TableCell>
                          <TableCell>{pending.barcode}</TableCell>
                          <TableCell>{pending.price.toLocaleString('vi-VN')}đ</TableCell>
                          <TableCell>{pending.amount}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-sm ${
                              pending.isNew 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {pending.isNew ? 'Mới' : 'Cập nhật'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFromPending(pending.tempId)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          {/* Bước 6: Xác nhận thêm danh sách */}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelBatch} className="border-blue-200">
              Hủy
            </Button>
            <Button 
              onClick={handleConfirmBatch} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={pendingProducts.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Xác nhận ({pendingProducts.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={cancelConfirm.open}
        onOpenChange={(open) => !open && setCancelConfirm({ open: false })}
        title="Hủy thêm hàng hóa?"
        description="Bạn có chắc chắn muốn hủy? Danh sách chờ sẽ bị xóa."
        onConfirm={confirmCancel}
        variant="destructive"
      />
    </div>
  );
}
