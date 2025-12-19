'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Trash2, Search, ClipboardCheck, Check, ChevronsUpDown, ChevronRight, Eye, Package, Pencil } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { EmployeePosition, ProductStatus } from '@/types';
import type { Employee, Product, Slot, StocktakingDetail } from '@/types';
import { createStocktaking, getStocktakings, updateStocktaking, deleteStocktaking } from '@/services/stocktaking.service';
import { getProducts } from '@/services/product.service';
import { getShelves } from '@/services/warehouse.service';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [editingStocktaking, setEditingStocktaking] = useState<Stocktaking | null>(null);
  const [deletingStocktakingId, setDeletingStocktakingId] = useState<number | null>(null);

  // Form state for creating new stocktaking
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [selectedSlotId, setSelectedSlotId] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus>(ProductStatus.GOOD);
  const [quantity, setQuantity] = useState<number>(0);
  const [stocktakingDetails, setStocktakingDetails] = useState<StocktakingDetail[]>([]);
  const [openProductCombobox, setOpenProductCombobox] = useState(false);
  const [openSlotCombobox, setOpenSlotCombobox] = useState(false);

  const selectedProduct = Array.isArray(products) ? products.find(p => p.id === selectedProductId) : undefined;
  const selectedSlot = Array.isArray(slots) ? slots.find(s => s.id === selectedSlotId) : undefined;

  // Filter slots based on selected product's slotDetails
  const availableSlots = selectedProductId && selectedProduct?.slotDetails && selectedProduct.slotDetails.length > 0
    ? slots.filter(slot => {
        // Check if this slot is assigned to the selected product
        const isAssigned = selectedProduct.slotDetails!.some(sd => sd.slotId === slot.id);
        if (isAssigned) {
          console.log(`✅ Slot ${slot.id} (${slot.name}) is assigned to product ${selectedProduct.id}`);
        }
        return isAssigned;
      })
    : [];

  // Debug log for slot filtering
  useEffect(() => {
    if (selectedProduct) {
      console.log('=== SLOT FILTERING DEBUG ===');
      console.log('Selected Product:', {
        id: selectedProduct.id,
        name: selectedProduct.name,
        slotDetails: selectedProduct.slotDetails
      });
      console.log('SlotDetail IDs:', selectedProduct.slotDetails?.map(sd => sd.slotId));
      console.log('Available Slots:', availableSlots.map(s => ({ id: s.id, name: s.name })));
      console.log('Total Slots in System:', slots.length);
      console.log('===========================');
    }
  }, [selectedProductId, selectedProduct, availableSlots]);

  const filteredStocktakings = stocktakings.filter(stocktaking => {
    if (!stocktaking || !stocktaking.id) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const idMatch = stocktaking.id.toString().includes(searchTerm);
    const nameMatch = stocktaking.employee?.name?.toLowerCase().includes(searchLower) || false;
    return idMatch || nameMatch;
  });

  const hasLoadedRef = useRef(false);

  // Load initial data ONCE on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    
    const loadData = async () => {
      await Promise.all([
        loadProducts(),
        loadSlots(),
        loadStocktakings()
      ]);
    };
    
    loadData();
  }, []);

  const loadProducts = async () => {
    try {
      console.log('Loading products...');
      const result = await getProducts();
      console.log('Products loaded (raw):', result);
      
      if (Array.isArray(result)) {
        console.log(`✅ Loaded ${result.length} products`);
        console.log('First product example:', result[0]);
        setProducts(result);
      } else {
        console.error('❌ Products result is not an array:', result);
        setProducts([]);
        toast.error('Dữ liệu sản phẩm không đúng định dạng');
      }
    } catch (error: any) {
      console.error('❌ Load products error:', error);
      setProducts([]);
      toast.error(error.message || 'Không thể tải danh sách sản phẩm');
    }
  };

  const loadSlots = async () => {
    try {
      console.log('Loading slots from shelves...');
      const shelves = await getShelves();
      console.log('Shelves loaded:', shelves);
      
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
      
      console.log(`✅ Total slots loaded: ${allSlots.length}`);
      console.log('Example slots:', allSlots.slice(0, 3));
      setSlots(allSlots);
      setSelectedSlotId(0);
    } catch (error: any) {
      console.error('❌ Load slots error:', error);
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
        console.error('❌ Invalid stocktakings response:', result);
        setStocktakings([]);
        return;
      }

      const mappedStocktakings = result.data.map((st: any) => ({
        id: st.id,
        employeeId: st.employeeId,
        employee: st.employee || { 
          id: st.employeeId, 
          name: 'Unknown', 
          position: EmployeePosition.INVENTORY 
        },
        createdAt: new Date(st.createdAt),
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
      }));
      
      console.log(`✅ Mapped stocktakings: ${mappedStocktakings.length} items`);
      setStocktakings(mappedStocktakings);
    } catch (error: any) {
      console.error('❌ Load stocktakings error:', error);
      setStocktakings([]);
      toast.error(error.message || 'Không thể tải danh sách kiểm kê');
    } finally {
      setIsLoading(false);
    }
  };

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
    setEditingStocktaking(null);
    setStocktakingDetails([]);
    setSelectedProductId(0);
    setSelectedSlotId(0);
    setSelectedStatus(ProductStatus.GOOD);
    setQuantity(0);
    setBarcodeInput('');
  };

  const handleBarcodeSearch = () => {
    if (!barcodeInput) return;
    
    const product = products.find(p => p.barcode.toString() === barcodeInput);
    if (product) {
      console.log('🔍 Found product by barcode:', product);
      console.log('🔍 Product has slotDetails:', product.slotDetails);
      
      setSelectedProductId(product.id);
      setQuantity(product.amount || 0);
      setSelectedSlotId(0); // Reset slot when product changes
      
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

    const product = products.find(p => p.id === selectedProductId);
    if (!product) {
      toast.error('Mã barcode không tồn tại');
      return;
    }

    // Validate - Kiểm tra mã vị trí
    if (!selectedSlotId) {
      toast.error('Vui lòng chọn vị trí (kệ/ngăn/ô)');
      return;
    }

    const slot = slots.find(s => s.id === selectedSlotId);
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

      if (editingStocktaking) {
        // Update existing stocktaking
        console.log('Updating stocktaking #' + editingStocktaking.id, requestData);
        await updateStocktaking(editingStocktaking.id, requestData);
        toast.success('Cập nhật phiếu kiểm kê thành công!');
      } else {
        // Create new stocktaking
        console.log('Creating stocktaking with data:', requestData);
        await createStocktaking(requestData);
        toast.success('Lập phiếu kiểm kê thành công!', {
          description: `Đã tạo phiếu với ${stocktakingDetails.length} mục`,
        });
      }
      
      await loadStocktakings();
      handleCancelCreate();
    } catch (error: any) {
      console.error('❌ Save stocktaking error:', error);
      toast.error(error.message || 'Không thể lưu phiếu kiểm kê');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewStocktaking = (stocktaking: Stocktaking) => {
    setViewingStocktaking(stocktaking);
    setShowStocktakingDialog(true);
  };

  const handleEditStocktaking = (stocktaking: Stocktaking) => {
    if (currentUser?.position !== 'INVENTORY') {
      toast.error('Chỉ nhân viên kiểm kê mới có quyền chỉnh sửa phiếu');
      return;
    }

    // Load stocktaking data into form
    setEditingStocktaking(stocktaking);
    setIsCreatingStocktaking(true);
    setStocktakingDetails(stocktaking.details);
    
    toast.info('Đang chỉnh sửa phiếu kiểm kê #' + stocktaking.id);
  };

  const handleDeleteStocktaking = async (id: number) => {
    if (currentUser?.position !== 'INVENTORY') {
      toast.error('Chỉ nhân viên kiểm kê mới có quyền xóa phiếu');
      return;
    }

    setDeletingStocktakingId(id);
  };

  const confirmDeleteStocktaking = async () => {
    if (!deletingStocktakingId) return;

    try {
      setIsLoading(true);
      await deleteStocktaking(deletingStocktakingId);
      await loadStocktakings();
      toast.success('Xóa phiếu kiểm kê thành công');
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa phiếu kiểm kê');
    } finally {
      setIsLoading(false);
      setDeletingStocktakingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Debug Panel */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="bg-orange-100 py-3">
          <CardTitle className="text-sm text-orange-900">🔍 Debug Info</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2 text-xs">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-semibold">Products:</p>
              <p className={products.length > 0 ? 'text-green-600' : 'text-red-600'}>
                {products.length > 0 ? `✅ ${products.length} loaded` : '❌ Not loaded'}
              </p>
            </div>
            <div>
              <p className="font-semibold">Total Slots:</p>
              <p className={slots.length > 0 ? 'text-green-600' : 'text-red-600'}>
                {slots.length > 0 ? `✅ ${slots.length} loaded` : '❌ Not loaded'}
              </p>
            </div>
            <div>
              <p className="font-semibold">Available Slots:</p>
              <p className={selectedProductId ? 'text-blue-600' : 'text-gray-400'}>
                {selectedProductId 
                  ? `${availableSlots.length} for selected product` 
                  : 'Select product first'}
              </p>
            </div>
          </div>
          {selectedProduct && (
            <div className="pt-2 border-t border-orange-200">
              <p className="font-semibold">Selected Product:</p>
              <p className="text-gray-600">
                {selectedProduct.name} (ID: {selectedProduct.id})
              </p>
              <p className="text-gray-600">
                SlotDetails: {selectedProduct.slotDetails?.length || 0} locations
              </p>
              {selectedProduct.slotDetails && selectedProduct.slotDetails.length > 0 && (
                <p className="text-blue-600">
                  Slot IDs: {selectedProduct.slotDetails.map(sd => sd.slotId).join(', ')}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Header */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-blue-900">
              {editingStocktaking 
                ? `Chỉnh sửa Phiếu Kiểm Kê #${editingStocktaking.id}` 
                : 'Quản Lý Phiếu Kiểm Kê'
              }
            </CardTitle>
            {!isCreatingStocktaking && (
              <Button onClick={handleStartCreateStocktaking} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Lập phiếu kiểm kê
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Create/Edit Stocktaking Form */}
      {isCreatingStocktaking && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader className="bg-purple-100">
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              {editingStocktaking ? 'Chỉnh Sửa Phiếu Kiểm Kê' : 'Lập Phiếu Kiểm Kê Mới'}
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
                                  console.log('📦 Selected product:', product);
                                  console.log('📦 Product slotDetails:', product.slotDetails);
                                  
                                  setSelectedProductId(product.id);
                                  setQuantity(product.amount || 0);
                                  setSelectedSlotId(0); // Reset slot selection
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
                                  <span className="text-xs text-gray-500">
                                    Barcode: {product.barcode} | Tồn: {product.amount}
                                    {product.slotDetails && ` | ${product.slotDetails.length} vị trí`}
                                  </span>
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
                      {selectedProduct.slotDetails && ` | ${selectedProduct.slotDetails.length} vị trí được gán`}
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
                        disabled={!selectedProductId}
                        className="w-full justify-between border-purple-200"
                      >
                        {selectedSlot && selectedSlot.rack?.shelf && selectedSlotId !== 0
                          ? `${selectedSlot.rack.shelf.name} > ${selectedSlot.rack.name} > ${selectedSlot.name}`
                          : !selectedProductId
                          ? 'Vui lòng chọn sản phẩm trước'
                          : availableSlots.length === 0
                          ? 'Sản phẩm chưa được phân bổ vị trí'
                          : 'Chọn vị trí...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Tìm kiếm vị trí..." />
                        <CommandList>
                          <CommandEmpty>
                            {selectedProductId && availableSlots.length === 0
                              ? 'Sản phẩm này chưa được phân bổ vị trí nào'
                              : 'Không tìm thấy vị trí'
                            }
                          </CommandEmpty>
                          <CommandGroup heading={`Vị trí cho ${selectedProduct?.name || 'sản phẩm'}`}>
                            {availableSlots.map((slot) => (
                              <CommandItem
                                key={slot.id}
                                value={`${slot.rack!.shelf!.name} ${slot.rack!.name} ${slot.name}`}
                                onSelect={() => {
                                  console.log('📍 Selected slot:', slot);
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
                                  <span className="font-semibold">{slot.rack!.shelf!.name}</span>
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
                  {selectedProductId && (
                    <p className="text-xs text-gray-500">
                      {availableSlots.length === 0 
                        ? '⚠️ Sản phẩm chưa được phân bổ vị trí. Vui lòng liên hệ quản lý.'
                        : `✅ ${availableSlots.length} vị trí khả dụng cho sản phẩm này`
                      }
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

              <Button 
                onClick={handleAddDetail} 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={!selectedProductId || !selectedSlotId || selectedSlotId === 0}
              >
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
                disabled={stocktakingDetails.length === 0 || isLoading}
              >
                <Check className="mr-2 h-4 w-4" />
                {editingStocktaking ? 'Cập nhật phiếu kiểm kê' : 'Xác nhận lưu phiếu kiểm kê'}
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
                        <TableCell className="font-medium">
                          PKK{stocktaking.id.toString().padStart(3, '0')}
                        </TableCell>
                        <TableCell>{stocktaking.createdAt.toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{stocktaking.employee.name}</TableCell>
                        <TableCell>{stocktaking.details.length}</TableCell>
                        <TableCell>
                          {stocktaking.details.reduce((sum, d) => sum + d.quantity, 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewStocktaking(stocktaking)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStocktaking(stocktaking)}
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              title="Chỉnh sửa"
                              disabled={currentUser?.position !== 'INVENTORY'}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStocktaking(stocktaking.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Xóa"
                              disabled={currentUser?.position !== 'INVENTORY'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingStocktakingId} onOpenChange={() => setDeletingStocktakingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phiếu kiểm kê</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phiếu kiểm kê PKK{deletingStocktakingId?.toString().padStart(3, '0')}? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteStocktaking}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa phiếu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
