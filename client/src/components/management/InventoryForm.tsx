'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Trash2, Search, ClipboardCheck, Check, ChevronsUpDown, ChevronRight, Eye, Package, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { EmployeePosition, ProductStatus, ProductUnit } from '@/types';
import type { Employee, Product, Slot, StocktakingDetail, StocktakingWithDetails } from '@/types';
import { apiClient } from '@/services/api-client'; // Import API Client
import { getStocktakings, getStocktakingById, createStocktaking } from '@/services/stocktaking.service';

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
  // 1. STATE DỮ LIỆU (Thay thế cho Mock Data)
  const [products, setProducts] = useState<Product[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [stocktakings, setStocktakings] = useState<StocktakingWithDetails[]>([]);
  
  // State UI
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingStocktaking, setIsCreatingStocktaking] = useState(false);
  const [viewingStocktaking, setViewingStocktaking] = useState<Stocktaking | null>(null);
  const [showStocktakingDialog, setShowStocktakingDialog] = useState(false);

  // Form state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [selectedSlotId, setSelectedSlotId] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus>(ProductStatus.GOOD);
  const [quantity, setQuantity] = useState<number>(0);
  const [stocktakingDetails, setStocktakingDetails] = useState<StocktakingDetail[]>([]);
  const [openProductCombobox, setOpenProductCombobox] = useState(false);
  const [openSlotCombobox, setOpenSlotCombobox] = useState(false);

  // Helper tìm kiếm (Dùng state products/slots thay vì mock)
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedSlot = slots.find(s => s.id === selectedSlotId);

  const filteredStocktakings = stocktakings.filter(stocktaking =>
    stocktaking.id.toString().includes(searchTerm) ||
    (stocktaking.employee?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. FETCH DATA TỪ API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi song song các API cần thiết
        const [productsData, slotsData, stocktakingsData] = await Promise.all([
          apiClient.get<any>('/products'),     // API lấy danh sách sản phẩm
          apiClient.get<any>('/slots'),        // API lấy danh sách vị trí
          getStocktakings()                    // API lấy lịch sử kiểm kê
        ]);

        // Xử lý dữ liệu trả về (tùy format backend trả về mảng trực tiếp hay bọc trong object)
        setProducts(Array.isArray(productsData) ? productsData : (productsData?.data || []));
        setSlots(Array.isArray(slotsData) ? slotsData : (slotsData?.data || []));
  setStocktakings(Array.isArray(stocktakingsData) ? stocktakingsData : []);

      } catch (err: any) {
        toast.error(err.message || 'Lỗi tải dữ liệu hệ thống');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 3. HANDLERS
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
    // Tìm trong state products thay vì mockProducts
    const product = products.find(p => p.barcode?.toString() === barcodeInput);
    if (product) {
      setSelectedProductId(product.id);
      toast.success(`Tìm thấy: ${product.name}`);
    } else {
      toast.error('Không tìm thấy sản phẩm với mã vạch này');
    }
    setBarcodeInput('');
  };

  const handleAddDetail = () => {
    if (!selectedProductId) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }
    const product = products.find(p => p.id === selectedProductId);
    if (!product) {
      toast.error('Sản phẩm không tồn tại');
      return;
    }

    if (!selectedSlotId) {
      toast.error('Vui lòng chọn vị trí');
      return;
    }
    const slot = slots.find(s => s.id === selectedSlotId);
    if (!slot) {
      toast.error('Vị trí không tồn tại');
      return;
    }

    if (quantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    // Tạo ID tạm cho chi tiết phiếu (client-side only)
    const newId = Date.now(); 
    const newDetail: StocktakingDetail = {
      id: newId, 
      stocktakingId: 0,
      productId: product.id,
      product,
      slotId: slot.id,
      slot,
      status: selectedStatus,
      quantity,
    };

    setStocktakingDetails([...stocktakingDetails, newDetail]);
    
    // Reset form nhập nhanh
    setSelectedProductId(0);
    setQuantity(0);
    toast.success(`Đã thêm ${product.name}`);
  };

  const handleRemoveDetail = (detailId: number) => {
    setStocktakingDetails(stocktakingDetails.filter(d => d.id !== detailId));
    toast.info('Đã xóa dòng chi tiết');
  };

  const handleConfirmStocktaking = async () => {
    if (!currentUser) {
      toast.error('Lỗi: Không tìm thấy thông tin nhân viên');
      return;
    }
    if (currentUser.position !== 'INVENTORY' && currentUser.position !== 'MANAGER') {
      toast.error('Bạn không có quyền lập phiếu kiểm kê. Chỉ nhân viên "Kiểm kê" hoặc "Quản lý" mới có quyền tạo phiếu kiểm kê.');
      return;
    }
    if (stocktakingDetails.length === 0) {
      toast.error('Phiếu kiểm kê trống');
      return;
    }

    setLoading(true);
    try {
      await createStocktaking({
        employeeId: currentUser.id,
        details: stocktakingDetails.map(d => ({
          productId: d.productId,
          slotId: d.slotId,
          status: d.status,
          quantity: d.quantity,
        }))
      });
      toast.success('Lưu phiếu kiểm kê thành công!');
      
      // Reset form
      setIsCreatingStocktaking(false);
      setStocktakingDetails([]);
      
      // Reload danh sách
  const data = await getStocktakings();
  setStocktakings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || 'Lưu phiếu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStocktaking = async (stocktaking: Stocktaking) => {
    setLoadingDetail(true);
    setShowStocktakingDialog(true);
    try {
      const detail = await getStocktakingById(stocktaking.id);
      setViewingStocktaking({
        ...detail,
        details: detail.stocktakingDetails || [],
        createdAt: new Date(detail.createdAt)
      } as Stocktaking);
    } catch (err: any) {
      setViewingStocktaking(null);
      toast.error('Không thể tải chi tiết phiếu');
    } finally {
      setLoadingDetail(false);
    }
  };

  // 4. RENDER
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
                    if (e.key === 'Enter') handleBarcodeSearch();
                  }}
                  className="border-purple-200"
                />
                <Button onClick={handleBarcodeSearch} className="bg-purple-600 hover:bg-purple-700">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Product & Slot Selection */}
            <div className="bg-white p-4 rounded-lg border border-purple-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Combobox */}
                <div className="space-y-2">
                  <Label>Sản phẩm</Label>
                  <Popover open={openProductCombobox} onOpenChange={setOpenProductCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openProductCombobox}
                        className="w-full justify-between border-purple-200"
                      >
                        {selectedProduct ? selectedProduct.name : "Chọn sản phẩm..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Tìm sản phẩm..." />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                          <CommandGroup>
                            {products.map((product) => (
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
                                    selectedProductId === product.id ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                {product.name} ({product.barcode})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Slot Combobox */}
                <div className="space-y-2">
                  <Label>Vị trí (Slot)</Label>
                  <Popover open={openSlotCombobox} onOpenChange={setOpenSlotCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openSlotCombobox}
                        className="w-full justify-between border-purple-200"
                      >
                        {selectedSlot ? `${selectedSlot.rack?.name} - ${selectedSlot.name}` : "Chọn vị trí..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Tìm kiếm vị trí..." />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy vị trí</CommandEmpty>
                          <CommandGroup heading="Danh sách vị trí">
                            {slots.map((slot) => (
                              <CommandItem
                                key={slot.id}
                                value={`${slot.rack?.shelf?.name} ${slot.rack?.name} ${slot.name}`}
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
                                  <span>{slot.rack?.shelf?.name || 'Kệ ??'}</span>
                                  <ChevronRight className="h-3 w-3" />
                                  <span>{slot.rack?.name || 'Tầng ??'}</span>
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
                              <span className="text-gray-600">{detail.slot!.rack?.shelf?.name}</span>
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{detail.slot!.rack?.name}</span>
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
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Xác nhận lưu phiếu
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

            <div className="min-h-[48px]">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Đang tải dữ liệu...</span>
                </div>
              ) : stocktakings.length === 0 ? (
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
                        <TableCell>{new Date(stocktaking.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{stocktaking.employee?.name || ''}</TableCell>
                        <TableCell>{Array.isArray(stocktaking.stocktakingDetails) ? stocktaking.stocktakingDetails.length : 0}</TableCell>
                        <TableCell>
                          {Array.isArray(stocktaking.stocktakingDetails)
                            ? stocktaking.stocktakingDetails.reduce((sum: number, d: any) => sum + (d.quantity || 0), 0)
                            : 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewStocktaking(stocktaking as any)}
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
            </div>
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
          {loadingDetail ? (
            <div className="text-center py-12 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin inline-block mr-2" />
              Đang tải chi tiết phiếu...
            </div>
          ) : viewingStocktaking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Người kiểm</p>
                  <p className="font-semibold">{viewingStocktaking.employee.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày kiểm</p>
                  <p className="font-semibold">{new Date(viewingStocktaking.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
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
                        <TableCell>{detail.product?.name}</TableCell>
                        <TableCell>{detail.product?.barcode}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm whitespace-nowrap">
                            <span className="text-gray-600">{detail.slot?.rack?.shelf?.name}</span>
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{detail.slot?.rack?.name}</span>
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{detail.slot?.name}</span>
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