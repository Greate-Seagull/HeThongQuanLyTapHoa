'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Trash2, Search, ClipboardCheck, Check, ChevronsUpDown, ChevronRight, Eye, Package } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { EmployeePosition, ProductStatus, ProductUnit } from '@/types';
import type { Employee, Product, Slot, StocktakingDetail } from '@/types';

// Mock data - synced with ProductManagement
const mockProducts: Product[] = [
  { id: 1, name: 'Coca Cola 330ml', barcode: 8934673123456, price: 10000, amount: 150, unit: ProductUnit.UNKNOWN, status: ProductStatus.GOOD },
  { id: 2, name: 'Pepsi 330ml', barcode: 8934673123457, price: 9500, amount: 200, unit: ProductUnit.UNKNOWN, status: ProductStatus.GOOD },
  { id: 3, name: 'Bánh Oreo', barcode: 8934673123458, price: 15000, amount: 80, unit: ProductUnit.UNKNOWN, status: ProductStatus.GOOD },
  { id: 4, name: 'Mì Hảo Hảo', barcode: 8934673123459, price: 4000, amount: 300, unit: ProductUnit.UNKNOWN, status: ProductStatus.GOOD },
  { id: 5, name: 'Sữa TH True Milk', barcode: 8934673123460, price: 28000, amount: 50, unit: ProductUnit.UNKNOWN, status: ProductStatus.GOOD },
];

interface Rack {
  id: number;
  name: string;
  shelf: { id: number; name: string };
}

// Mock slots - synced with LocationManagement
const mockSlots: Slot[] = [
  { id: 1, name: 'Ô A', rackId: 1, rack: { id: 1, name: 'Ngăn 1', shelfId: 1, shelf: { id: 1, name: 'Kệ 1' } } as any },
  { id: 2, name: 'Ô B', rackId: 1, rack: { id: 1, name: 'Ngăn 1', shelfId: 1, shelf: { id: 1, name: 'Kệ 1' } } as any },
  { id: 3, name: 'Ô C', rackId: 1, rack: { id: 1, name: 'Ngăn 1', shelfId: 1, shelf: { id: 1, name: 'Kệ 1' } } as any },
  { id: 4, name: 'Ô A', rackId: 2, rack: { id: 2, name: 'Ngăn 2', shelfId: 1, shelf: { id: 1, name: 'Kệ 1' } } as any },
  { id: 5, name: 'Ô B', rackId: 2, rack: { id: 2, name: 'Ngăn 2', shelfId: 1, shelf: { id: 1, name: 'Kệ 1' } } as any },
  { id: 6, name: 'Ô A', rackId: 3, rack: { id: 3, name: 'Ngăn 1', shelfId: 2, shelf: { id: 2, name: 'Kệ 2' } } as any },
];

const inventoryStaff: Employee[] = [
  { id: 1, name: 'Nguyễn Văn Kiệm', position: EmployeePosition.INVENTORY },
  { id: 2, name: 'Trần Thị Nhập', position: EmployeePosition.RECEIVING },
  { id: 3, name: 'Lê Văn Bán', position: EmployeePosition.SALES },
];

interface Stocktaking {
  id: number;
  employeeId: number;
  employee: Employee;
  createdAt: Date;
  details: StocktakingDetail[];
}

interface InventoryFormProps {
  currentUser?: { id: number; position: string };
}

export function InventoryForm({ currentUser }: InventoryFormProps) {
  const [stocktakings, setStocktakings] = useState<Stocktaking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingStocktaking, setIsCreatingStocktaking] = useState(false);
  const [viewingStocktaking, setViewingStocktaking] = useState<Stocktaking | null>(null);
  const [showStocktakingDialog, setShowStocktakingDialog] = useState(false);

  // Form state for creating new stocktaking
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [selectedSlotId, setSelectedSlotId] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus>(ProductStatus.GOOD);
  const [quantity, setQuantity] = useState<number>(0);
  const [stocktakingDetails, setStocktakingDetails] = useState<StocktakingDetail[]>([]);
  const [openProductCombobox, setOpenProductCombobox] = useState(false);
  const [openSlotCombobox, setOpenSlotCombobox] = useState(false);

  const selectedProduct = mockProducts.find(p => p.id === selectedProductId);
  const selectedSlot = mockSlots.find(s => s.id === selectedSlotId);

  const filteredStocktakings = stocktakings.filter(stocktaking =>
    stocktaking.id.toString().includes(searchTerm) ||
    stocktaking.employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartCreateStocktaking = () => {
    setIsCreatingStocktaking(true);
    setStocktakingDetails([]);
    setSelectedProductId(0);
    setSelectedSlotId(0);
    setSelectedStatus(ProductStatus.GOOD);
    setQuantity(0);
    setBarcodeInput('');
  };

  const handleCancelCreate = () => {
    setIsCreatingStocktaking(false);
    setStocktakingDetails([]);
    setSelectedProductId(0);
    setSelectedSlotId(0);
    setSelectedStatus(ProductStatus.GOOD);
    setQuantity(0);
    setBarcodeInput('');
  };

  const handleBarcodeSearch = () => {
    if (!barcodeInput) return;
    
    const product = mockProducts.find(p => p.barcode.toString() === barcodeInput);
    if (product) {
      setSelectedProductId(product.id);
      toast.success(`Tìm thấy: ${product.name}`);
    } else {
      toast.error('Không tìm thấy sản phẩm với mã vạch này');
    }
    setBarcodeInput('');
  };

  const handleAddDetail = () => {
    // Validate - Kiểm tra barcode
    if (!selectedProductId) {
      toast.error('Vui lòng chọn sản phẩm (barcode)');
      return;
    }

    const product = mockProducts.find(p => p.id === selectedProductId);
    if (!product) {
      toast.error('Mã barcode không tồn tại');
      return;
    }

    // Validate - Kiểm tra mã vị trí
    if (!selectedSlotId) {
      toast.error('Vui lòng chọn vị trí (kệ/ngăn/ô)');
      return;
    }

    const slot = mockSlots.find(s => s.id === selectedSlotId);
    if (!slot) {
      toast.error('Mã vị trí không tồn tại');
      return;
    }

    // Validate - Kiểm tra tình trạng
    if (!selectedStatus) {
      toast.error('Vui lòng chọn tình trạng');
      return;
    }

    if (!Object.values(ProductStatus).includes(selectedStatus)) {
      toast.error('Tên tình trạng không tồn tại');
      return;
    }

    // Validate - Kiểm tra số lượng
    if (quantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    // Thêm vào danh sách kiểm kê
    const newId = stocktakingDetails.length + 1;
    const newDetail: StocktakingDetail = {
      id: newId,
      stocktakingId: 0, // Will be set when stocktaking is created
      productId: product.id,
      product,
      slotId: slot.id,
      slot,
      status: selectedStatus,
      quantity,
    };

    setStocktakingDetails([...stocktakingDetails, newDetail]);
    
    // Reset form
    setSelectedProductId(0);
    setSelectedSlotId(0);
    setSelectedStatus(ProductStatus.GOOD);
    setQuantity(0);
    
    toast.success(`Đã thêm ${product.name} vào danh sách kiểm kê`);
  };

  const handleRemoveDetail = (detailId: number) => {
    setStocktakingDetails(stocktakingDetails.filter(d => d.id !== detailId));
    toast.info('Đã xóa khỏi danh sách kiểm kê');
  };

  const handleConfirmStocktaking = () => {
    // Kiểm tra mã nhân viên có tồn tại
    if (!currentUser) {
      toast.error('Không tìm thấy thông tin nhân viên');
      return;
    }

    // Kiểm tra nhân viên có quyền kiểm kê không (position = INVENTORY)
    if (currentUser.position !== 'INVENTORY') {
      toast.error('Nhân viên không có quyền kiểm kê. Chỉ nhân viên "Kiểm kê" mới có quyền lập phiếu kiểm kê.');
      return;
    }

    const employee = inventoryStaff.find(e => e.id === currentUser.id) || {
      id: currentUser.id,
      name: 'Nhân viên',
      position: EmployeePosition.INVENTORY
    };

    // Kiểm tra phiếu có dữ liệu không
    if (stocktakingDetails.length === 0) {
      toast.error('Phiếu kiểm kê phải có ít nhất 1 mục');
      return;
    }

    // Kiểm tra lại từng mục kiểm kê
    for (const detail of stocktakingDetails) {
      // Kiểm tra barcode
      const product = mockProducts.find(p => p.id === detail.productId);
      if (!product) {
        toast.error(`Barcode không tồn tại`);
        return;
      }

      // Kiểm tra mã vị trí
      const slot = mockSlots.find(s => s.id === detail.slotId);
      if (!slot) {
        toast.error(`Mã vị trí của ${product.name} không tồn tại`);
        return;
      }

      // Kiểm tra tình trạng
      if (!Object.values(ProductStatus).includes(detail.status)) {
        toast.error(`Tên tình trạng của ${product.name} không tồn tại`);
        return;
      }

      // Kiểm tra số lượng
      if (detail.quantity <= 0) {
        toast.error(`Số lượng của ${product.name} phải lớn hơn 0`);
        return;
      }
    }

    // Tạo phiếu kiểm kê
    const newId = Math.max(...stocktakings.map(s => s.id), 0) + 1;
    const newStocktaking: Stocktaking = {
      id: newId,
      employeeId: employee.id,
      employee,
      createdAt: new Date(),
      details: stocktakingDetails,
    };

    // Lưu phiếu kiểm kê
    setStocktakings([newStocktaking, ...stocktakings]);
    
    // Reset form
    setIsCreatingStocktaking(false);
    setStocktakingDetails([]);
    setSelectedProductId(0);
    setSelectedSlotId(0);
    setSelectedStatus(ProductStatus.GOOD);
    setQuantity(0);

    // Gửi thông báo đến quản lý (mock)
    console.log('[NOTIFICATION TO MANAGER] Phiếu kiểm kê mới:', newStocktaking);

    // Hiển thị thông báo thành công
    toast.success('Lập phiếu kiểm kê thành công!', {
      description: `Phiếu PKK${newId.toString().padStart(3, '0')} đã được tạo với ${stocktakingDetails.length} mục. Đã gửi thông báo đến quản lý.`,
    });
  };

  const handleViewStocktaking = (stocktaking: Stocktaking) => {
    setViewingStocktaking(stocktaking);
    setShowStocktakingDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-blue-900">Quản Lý Phiếu Kiểm Kê</CardTitle>
            {!isCreatingStocktaking && (
              <Button onClick={handleStartCreateStocktaking} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Lập phiếu kiểm kê
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Create Stocktaking Form */}
      {isCreatingStocktaking && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader className="bg-purple-100">
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Lập Phiếu Kiểm Kê Mới
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Barcode Scanner */}
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <Label className="text-purple-900 mb-2 block">Quét mã vạch hoặc nhập barcode sản phẩm</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập barcode sản phẩm..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleBarcodeSearch();
                    }
                  }}
                  className="border-purple-200"
                />
                <Button onClick={handleBarcodeSearch} className="bg-purple-600 hover:bg-purple-700">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Product and Location Selection */}
            <div className="bg-white p-4 rounded-lg border border-purple-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Selection */}
                <div className="space-y-2">
                  <Label>Chọn hàng hóa (Barcode)</Label>
                  <Popover open={openProductCombobox} onOpenChange={setOpenProductCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openProductCombobox}
                        className="w-full justify-between border-purple-200"
                      >
                        {selectedProduct ? selectedProduct.name : 'Chọn sản phẩm...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Tìm kiếm sản phẩm..." />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy sản phẩm</CommandEmpty>
                          <CommandGroup heading="Danh sách sản phẩm">
                            {mockProducts.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.name || ''}
                                onSelect={() => {
                                  setSelectedProductId(product.id);
                                  setOpenProductCombobox(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    selectedProductId === product.id ? 'opacity-100' : 'opacity-0'
                                  }`}
                                />
                                <div className="flex flex-col">
                                  <span>{product.name}</span>
                                  <span className="text-xs text-gray-500">Barcode: {product.barcode}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedProduct && (
                    <p className="text-xs text-gray-500">
                      Barcode: {selectedProduct.barcode} | Tồn kho: {selectedProduct.amount}
                    </p>
                  )}
                </div>

                {/* Location Selection */}
                <div className="space-y-2">
                  <Label>Vị trí (Kệ/Ngăn/Ô)</Label>
                  <Popover open={openSlotCombobox} onOpenChange={setOpenSlotCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openSlotCombobox}
                        className="w-full justify-between border-purple-200"
                      >
                        {selectedSlot && selectedSlot.rack?.shelf
                          ? `${selectedSlot.rack!.shelf!.name} > ${selectedSlot.rack!.name} > ${selectedSlot.name}`
                          : 'Chọn vị trí...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Tìm kiếm vị trí..." />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy vị trí</CommandEmpty>
                          <CommandGroup heading="Danh sách vị trí">
                            {mockSlots.filter(s => s.rack?.shelf).map((slot) => (
                              <CommandItem
                                key={slot.id}
                                value={`${slot.rack!.shelf!.name} ${slot.rack!.name} ${slot.name}`}
                                onSelect={() => {
                                  setSelectedSlotId(slot.id);
                                  setOpenSlotCombobox(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    selectedSlotId === slot.id ? 'opacity-100' : 'opacity-0'
                                  }`}
                                />
                                <div className="flex items-center gap-1 text-sm">
                                  <span>{slot.rack!.shelf!.name}</span>
                                  <ChevronRight className="h-3 w-3" />
                                  <span>{slot.rack!.name}</span>
                                  <ChevronRight className="h-3 w-3" />
                                  <span>{slot.name}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedSlot && (
                    <p className="text-xs text-gray-500">
                      Mã vị trí: Slot #{selectedSlot.id}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Selection */}
                <div className="space-y-2">
                  <Label htmlFor="status">Tình trạng</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => setSelectedStatus(value as ProductStatus)}
                  >
                    <SelectTrigger className="border-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductStatus.GOOD}>Tốt</SelectItem>
                      <SelectItem value={ProductStatus.EXPIRED}>Hết hạn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity Input */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Số lượng</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity || ''}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    placeholder="Nhập số lượng..."
                    className="border-purple-200"
                  />
                </div>
              </div>

              <Button onClick={handleAddDetail} className="w-full bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Thêm vào danh sách kiểm kê
              </Button>
            </div>

            {/* Stocktaking Details Table */}
            {stocktakingDetails.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Danh sách kiểm kê ({stocktakingDetails.length} mục)
                </h3>
                <div className="border border-purple-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-purple-50">
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Barcode</TableHead>
                        <TableHead>Vị trí</TableHead>
                        <TableHead>Tình trạng</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stocktakingDetails.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell>{detail.product!.name}</TableCell>
                          <TableCell>{detail.product!.barcode}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-gray-600">{detail.slot!.rack!.shelf!.name}</span>
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{detail.slot!.rack!.name}</span>
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{detail.slot!.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-sm ${
                              detail.status === ProductStatus.GOOD 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {detail.status === ProductStatus.GOOD ? 'Tốt' : 'Hết hạn'}
                            </span>
                          </TableCell>
                          <TableCell>{detail.quantity}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDetail(detail.id)}
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
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={handleCancelCreate}
                className="border-gray-300"
              >
                Hủy
              </Button>
              <Button 
                onClick={handleConfirmStocktaking}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={stocktakingDetails.length === 0}
              >
                <Check className="mr-2 h-4 w-4" />
                Xác nhận lưu phiếu kiểm kê
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stocktaking History */}
      {!isCreatingStocktaking && (
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-900">Lịch Sử Kiểm Kê</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-2 mb-6 max-w-md">
              <Input
                placeholder="Tìm kiếm theo mã phiếu hoặc người kiểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-blue-200"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {stocktakings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Chưa có phiếu kiểm kê nào</p>
                <p className="text-sm">Nhấn "Lập phiếu kiểm kê" để bắt đầu</p>
              </div>
            ) : (
              <div className="border border-blue-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="text-blue-900">Mã phiếu</TableHead>
                      <TableHead className="text-blue-900">Ngày kiểm</TableHead>
                      <TableHead className="text-blue-900">Người kiểm</TableHead>
                      <TableHead className="text-blue-900">Số mục</TableHead>
                      <TableHead className="text-blue-900">Tổng số lượng</TableHead>
                      <TableHead className="text-blue-900 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStocktakings.map((stocktaking) => (
                      <TableRow key={stocktaking.id} className="hover:bg-blue-50">
                        <TableCell>PKK{stocktaking.id.toString().padStart(3, '0')}</TableCell>
                        <TableCell>{stocktaking.createdAt.toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{stocktaking.employee.name}</TableCell>
                        <TableCell>{stocktaking.details.length}</TableCell>
                        <TableCell>
                          {stocktaking.details.reduce((sum, d) => sum + d.quantity, 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewStocktaking(stocktaking)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stocktaking Details Dialog */}
      <Dialog open={showStocktakingDialog} onOpenChange={setShowStocktakingDialog}>
        <DialogContent className="border-blue-200 max-w-[95vw] lg:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Chi tiết phiếu kiểm kê</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {viewingStocktaking && `Mã phiếu: PKK${viewingStocktaking.id.toString().padStart(3, '0')}`}
            </DialogDescription>
          </DialogHeader>

          {viewingStocktaking && (
            <div className="space-y-4">
              {/* Thông tin phiếu */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Người kiểm</p>
                  <p className="font-semibold">{viewingStocktaking.employee.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày kiểm</p>
                  <p className="font-semibold">{viewingStocktaking.createdAt.toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              {/* Danh sách sản phẩm kiểm kê */}
              <div className="border border-blue-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="text-blue-900">Sản phẩm</TableHead>
                      <TableHead className="text-blue-900">Barcode</TableHead>
                      <TableHead className="text-blue-900">Vị trí</TableHead>
                      <TableHead className="text-blue-900">Tình trạng</TableHead>
                      <TableHead className="text-blue-900">SL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingStocktaking.details.map((detail) => (
                      <TableRow key={detail.id} className="hover:bg-blue-50">
                        <TableCell>{detail.product!.name}</TableCell>
                        <TableCell>{detail.product!.barcode}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm whitespace-nowrap">
                            <span className="text-gray-600">{detail.slot!.rack!.shelf!.name}</span>
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{detail.slot!.rack!.name}</span>
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{detail.slot!.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-sm whitespace-nowrap inline-block ${
                            detail.status === ProductStatus.GOOD 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {detail.status === ProductStatus.GOOD ? 'Tốt' : 'Hết hạn'}
                          </span>
                        </TableCell>
                        <TableCell>{detail.quantity}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-blue-100 font-semibold">
                      <TableCell colSpan={4} className="text-right">Tổng số lượng:</TableCell>
                      <TableCell>
                        {viewingStocktaking.details.reduce((sum, d) => sum + d.quantity, 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setShowStocktakingDialog(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
