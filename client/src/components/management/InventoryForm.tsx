'use client';

import { useState, useEffect } from 'react';
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
import { EmployeePosition, ProductStatus } from '@/types';
import type { Employee, Product, Slot, StocktakingDetail } from '@/types';
import { createStocktaking, getStocktakings } from '@/services/stocktaking.service';
import { getProducts } from '@/services/product.service';
import { getShelves } from '@/services/warehouse.service';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingStocktaking, setIsCreatingStocktaking] = useState(false);
  const [viewingStocktaking, setViewingStocktaking] = useState<Stocktaking | null>(null);
  const [showStocktakingDialog, setShowStocktakingDialog] = useState(false);

  // Form state for creating new stocktaking
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [selectedSlotId, setSelectedSlotId] = useState<number>(1); // Default slot
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus>(ProductStatus.GOOD);
  const [quantity, setQuantity] = useState<number>(0);
  const [stocktakingDetails, setStocktakingDetails] = useState<StocktakingDetail[]>([]);
  const [openProductCombobox, setOpenProductCombobox] = useState(false);
  const [openSlotCombobox, setOpenSlotCombobox] = useState(false);

  const selectedProduct = Array.isArray(products) ? products.find(p => p.id === selectedProductId) : undefined;
  const selectedSlot = Array.isArray(slots) ? slots.find(s => s.id === selectedSlotId) : undefined;

  const filteredStocktakings = stocktakings.filter(stocktaking => {
    if (!stocktaking || !stocktaking.id) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const idMatch = stocktaking.id.toString().includes(searchTerm);
    const nameMatch = stocktaking.employee?.name?.toLowerCase().includes(searchLower) || false;
    return idMatch || nameMatch;
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      loadStocktakings(),
      loadProducts(),
      loadSlots()
    ]);
  };

  const loadProducts = async () => {
    try {
      console.log('Loading products...');
      const result = await getProducts();
      console.log('Products loaded:', result);
      
      // Ensure result is always an array
      if (Array.isArray(result)) {
        console.log(`Loaded ${result.length} products`);
        setProducts(result);
      } else {
        console.error('Products result is not an array:', result);
        setProducts([]);
        toast.error('Dữ liệu sản phẩm không đúng định dạng');
      }
    } catch (error: any) {
      console.error('Load products error:', error);
      setProducts([]);
      toast.error(error.message || 'Không thể tải danh sách sản phẩm');
    }
  };

  const loadSlots = async () => {
    try {
      console.log('Loading slots from shelves...');
      const shelves = await getShelves();
      console.log('Shelves loaded:', shelves);
      
      // Flatten all slots from all racks from all shelves
      const allSlots: Slot[] = [];
      for (const shelf of shelves) {
        if (shelf.racks && Array.isArray(shelf.racks)) {
          for (const rack of shelf.racks) {
            if (rack.slots && Array.isArray(rack.slots)) {
              for (const slot of rack.slots) {
                allSlots.push({
                  ...slot,
                  rack: {
                    ...rack,
                    shelf: shelf,
                  },
                });
              }
            }
          }
        }
      }
      
      console.log(`Total slots loaded: ${allSlots.length}`);
      setSlots(allSlots);
      
      // Set default slot if available
      if (allSlots.length > 0) {
        setSelectedSlotId(allSlots[0].id);
      }
    } catch (error: any) {
      console.error('Load slots error:', error);
      toast.error(error.message || 'Không thể tải danh sách vị trí kho');
    }
  };

  const loadStocktakings = async () => {
    try {
      setIsLoading(true);
      console.log('Loading stocktakings...');
      const result = await getStocktakings(1, 100);
      console.log('Stocktakings loaded:', result);
      
      if (!result || !result.data) {
        console.error('Invalid stocktakings response:', result);
        setStocktakings([]);
        return;
      }

      const mappedStocktakings = result.data.map((st: any) => {
        console.log('Mapping stocktaking:', st);
        return {
          id: st.id,
          employeeId: st.employeeId,
          employee: st.employee || { 
            id: st.employeeId, 
            name: 'Unknown', 
            position: EmployeePosition.INVENTORY 
          },
          createdAt: new Date(st.createdAt),
          // Fix: Backend returns stocktakingDetails, not details
          details: Array.isArray(st.stocktakingDetails) ? st.stocktakingDetails.map((detail: any) => ({
            id: detail.id,
            stocktakingId: detail.stocktakingId,
            productId: detail.productId,
            product: detail.product,
            slotId: detail.slotId,
            slot: detail.slot,
            status: detail.status,
            quantity: detail.quantity,
          })) : []
        };
      });
      
      console.log('Mapped stocktakings:', mappedStocktakings);
      setStocktakings(mappedStocktakings);
    } catch (error: any) {
      console.error('Load stocktakings error:', error);
      setStocktakings([]);
      toast.error(error.message || 'Không thể tải danh sách kiểm kê');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCreateStocktaking = () => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    if (currentUser.position !== 'INVENTORY') {
      toast.error('Chỉ nhân viên kiểm kê mới được phép tạo phiếu');
      return;
    }

    setIsCreatingStocktaking(true);
    setStocktakingDetails([]);
    setSelectedProductId(0);
    setSelectedSlotId(1);
    setSelectedStatus(ProductStatus.GOOD);
    setQuantity(0);
    setBarcodeInput('');
  };

  const handleCancelCreate = () => {
    setIsCreatingStocktaking(false);
    setStocktakingDetails([]);
    setSelectedProductId(0);
    setSelectedSlotId(1);
    setSelectedStatus(ProductStatus.GOOD);
    setQuantity(0);
    setBarcodeInput('');
  };

  const handleBarcodeSearch = () => {
    if (!barcodeInput) return;
    
    const product = products.find(p => p.barcode.toString() === barcodeInput);
    if (product) {
      setSelectedProductId(product.id);
      setQuantity(product.amount || 0);
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

    if (quantity < 0) {
      toast.error('Số lượng phải >= 0');
      return;
    }

    const newId = stocktakingDetails.length + 1;
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
    
    // Reset form
    setSelectedProductId(0);
    setSelectedSlotId(1);
    setSelectedStatus(ProductStatus.GOOD);
    setQuantity(0);
    
    toast.success(`Đã thêm ${product.name} vào danh sách kiểm kê`);
  };

  const handleRemoveDetail = (detailId: number) => {
    setStocktakingDetails(stocktakingDetails.filter(d => d.id !== detailId));
    toast.info('Đã xóa khỏi danh sách kiểm kê');
  };

  const handleConfirmStocktaking = async () => {
    if (!currentUser) {
      toast.error('Không tìm thấy thông tin nhân viên');
      return;
    }

    if (currentUser.position !== 'INVENTORY') {
      toast.error('Nhân viên không có quyền kiểm kê');
      return;
    }

    if (stocktakingDetails.length === 0) {
      toast.error('Phiếu kiểm kê phải có ít nhất 1 mục');
      return;
    }

    try {
      setIsLoading(true);
      
      const requestData: any = {
        authId: currentUser.id,
        products: stocktakingDetails.map(detail => ({
          barcode: detail.product!.barcode,
          slotId: detail.slotId,
          status: detail.status,
          quantity: detail.quantity,
        })),
      };

      await createStocktaking(requestData);
      await loadStocktakings();
      
      // Reset form
      handleCancelCreate();

      toast.success('Lập phiếu kiểm kê thành công!', {
        description: `Đã tạo phiếu với ${stocktakingDetails.length} mục`,
      });
    } catch (error: any) {
      toast.error(error.message || 'Không thể tạo phiếu kiểm kê');
    } finally {
      setIsLoading(false);
    }
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
              <Button 
                onClick={handleStartCreateStocktaking} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!currentUser || currentUser.position !== 'INVENTORY'}
              >
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
                            {products.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.name || ''}
                                onSelect={() => {
                                  setSelectedProductId(product.id);
                                  setQuantity(product.amount || 0);
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
                                  <span className="text-xs text-gray-500">Barcode: {product.barcode} | Tồn: {product.amount}</span>
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
                      Barcode: {selectedProduct.barcode} | Tồn kho hệ thống: {selectedProduct.amount}
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
                          ? `${selectedSlot.rack.shelf.name} > ${selectedSlot.rack.name} > ${selectedSlot.name}`
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
                            {slots.filter(s => s.rack?.shelf).map((slot) => (
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
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Selection */}
                <div className="space-y-2">
                  <Label htmlFor="status">Tình trạng hàng hóa</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => setSelectedStatus(value as ProductStatus)}
                  >
                    <SelectTrigger className="border-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductStatus.GOOD}>Tốt (GOOD)</SelectItem>
                      <SelectItem value={ProductStatus.EXPIRED}>Hết hạn/Hỏng (EXPIRED)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    * Hàng hết hạn/hỏng sẽ được ghi nhận để thống kê và trừ tồn kho
                  </p>
                </div>

                {/* Quantity Input */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Số lượng thực tế kiểm kê</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={quantity || ''}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    placeholder="Nhập số lượng thực tế..."
                    className="border-purple-200"
                  />
                  {selectedProduct && (
                    <p className="text-xs text-gray-500">
                      Chênh lệch: {quantity - (selectedProduct.amount || 0)} 
                      {quantity !== selectedProduct.amount && (
                        <span className={quantity < (selectedProduct.amount || 0) ? 'text-red-600' : 'text-green-600'}>
                          {' '}({quantity > (selectedProduct.amount || 0) ? '+' : ''}{quantity - (selectedProduct.amount || 0)})
                        </span>
                      )}
                    </p>
                  )}
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
                        <TableHead>SL thực tế</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stocktakingDetails.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell>{detail.product!.name}</TableCell>
                          <TableCell>{detail.product!.barcode}</TableCell>
                          <TableCell>
                            {detail.slot && detail.slot.rack?.shelf ? (
                              <div className="flex items-center gap-1 text-sm">
                                <span className="text-gray-600">{detail.slot.rack.shelf.name}</span>
                                <ChevronRight className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">{detail.slot.rack.name}</span>
                                <ChevronRight className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">{detail.slot.name}</span>
                              </div>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-sm ${
                              detail.status === ProductStatus.GOOD 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {detail.status === ProductStatus.GOOD ? 'Tốt' : 'Hết hạn/Hỏng'}
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
                disabled={stocktakingDetails.length === 0 || isLoading}
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

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Đang tải...</p>
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
                      <TableHead className="text-blue-900">Tổng SL</TableHead>
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
                        <TableCell>{detail.product?.name || 'N/A'}</TableCell>
                        <TableCell>{detail.product?.barcode || 'N/A'}</TableCell>
                        <TableCell>
                          {detail.slot && detail.slot.rack?.shelf ? (
                            <div className="flex items-center gap-1 text-sm whitespace-nowrap">
                              <span className="text-gray-600">{detail.slot.rack.shelf.name}</span>
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{detail.slot.rack.name}</span>
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{detail.slot.name}</span>
                            </div>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-sm whitespace-nowrap inline-block ${
                            detail.status === ProductStatus.GOOD 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {detail.status === ProductStatus.GOOD ? 'Tốt' : 'Hết hạn/Hỏng'}
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

              {/* Manager only note */}
              {currentUser?.position === 'MANAGER' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Lưu ý:</strong> Chỉ Quản lý mới có quyền điều chỉnh tồn kho sau khi kiểm kê.
                    Vui lòng sử dụng chức năng "Áp dụng điều chỉnh" để cập nhật tồn kho.
                  </p>
                </div>
              )}
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
