'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Trash2, Search, Package, ShoppingCart, Check, ChevronsUpDown, Eye, Pencil } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { toast } from 'sonner';
import { EmployeePosition } from '@/types';
import type { Employee, Product } from '@/types';
import { 
  createGoodReceipt, 
  getGoodReceipts, 
  updateGoodReceipt, 
  deleteGoodReceipt 
} from '@/services/good-receipt.service';
import { getProducts } from '@/services/product.service';
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

interface GoodReceiptDetail {
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

interface GoodReceipt {
  id: number;
  employeeId: number;
  employee: Employee;
  createdAt: Date;
  goodReceiptDetails: GoodReceiptDetail[];
}

interface ImportFormProps {
  currentUser?: { id: number; position: string };
}

export function ImportForm({ currentUser }: ImportFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [goodReceipts, setGoodReceipts] = useState<GoodReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingReceipt, setIsCreatingReceipt] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<GoodReceipt | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<GoodReceipt | null>(null);
  const [deletingReceiptId, setDeletingReceiptId] = useState<number | null>(null);
  
  // Form state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [importPrice, setImportPrice] = useState<number>(0);
  const [receiptDetails, setReceiptDetails] = useState<GoodReceiptDetail[]>([]);
  const [openProductCombobox, setOpenProductCombobox] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const availableProducts = products.filter(
    p => !receiptDetails.some(d => d.productId === p.id)
  );

  const filteredReceipts = goodReceipts.filter(receipt =>
    receipt.id.toString().includes(searchTerm) ||
    receipt.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
  
    const loadData = async () => {
      await loadProducts();
      await loadGoodReceipts();
    };
  
    loadData();
  }, []);

  const loadProducts = async () => {
    try {
      console.log('Loading products...');
      const productsArray = await getProducts();
      console.log(`✅ Loaded ${productsArray.length} products`);
      setProducts(productsArray);
    } catch (error: any) {
      console.error('❌ Load products error:', error);
      setProducts([]);
      toast.error(error.message || 'Không thể tải danh sách sản phẩm');
    }
  };

  const loadGoodReceipts = async () => {
    try {
      setIsLoading(true);
      console.log('Loading good receipts...');
      const result = await getGoodReceipts(1, 100);
      console.log('Good receipts loaded:', result);
      
      if (!result || !result.data) {
        console.error('❌ Invalid response:', result);
        setGoodReceipts([]);
        return;
      }

      const mapped = result.data.map((gr: any) => ({
        id: gr.id,
        employeeId: gr.employeeId,
        employee: gr.employee || { 
          id: gr.employeeId, 
          name: 'Unknown', 
          position: EmployeePosition.RECEIVING 
        },
        createdAt: new Date(gr.createdAt),
        goodReceiptDetails: Array.isArray(gr.goodReceiptDetails)
        ? gr.goodReceiptDetails.map((detail: any) => {
            const clientProduct = products.find(p => p.id === detail.productId);
            return {
              productId: detail.productId,
              product: detail.product || clientProduct || { id: detail.productId, name: 'Unknown', barcode: '', price: 0, amount: 0 },
              quantity: detail.quantity,
              price: detail.price,
            };
          })
        : [],
      }));
      
      console.log(`✅ Mapped ${mapped.length} good receipts`);
      setGoodReceipts(mapped);
    } catch (error: any) {
      console.error('❌ Load good receipts error:', error);
      setGoodReceipts([]);
      toast.error(error.message || 'Không thể tải danh sách phiếu nhập hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCreateReceipt = () => {
    setIsCreatingReceipt(true);
    setReceiptDetails([]);
    setSelectedProductId(0);
    setQuantity(0);
    setImportPrice(0);
    setBarcodeInput('');
  };

  const handleCancelCreate = () => {
    setIsCreatingReceipt(false);
    setEditingReceipt(null);
    setReceiptDetails([]);
    setSelectedProductId(0);
    setQuantity(0);
    setImportPrice(0);
    setBarcodeInput('');
  };

  const handleBarcodeSearch = () => {
    if (!barcodeInput) return;
    
    const product = products.find(p => p.barcode.toString() === barcodeInput);
    if (product) {
      if (receiptDetails.some(d => d.productId === product.id)) {
        toast.error('Sản phẩm đã được thêm vào phiếu nhập');
        return;
      }
      setSelectedProductId(product.id);
      setImportPrice(product.price);
      toast.success(`Tìm thấy: ${product.name}`);
    } else {
      toast.error('Không tìm thấy sản phẩm với mã vạch này');
    }
    setBarcodeInput('');
  };

  const handleAddProduct = () => {
    if (!selectedProductId) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }

    if (quantity <= 0) {
      toast.error('Số lượng nhập phải lớn hơn 0');
      return;
    }

    if (importPrice <= 0) {
      toast.error('Giá nhập phải lớn hơn 0');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) {
      toast.error('Mã hàng hóa không tồn tại');
      return;
    }
    
    const newDetail: GoodReceiptDetail = {
      productId: product.id,
      product,
      quantity,
      price: importPrice,
    };

    setReceiptDetails([...receiptDetails, newDetail]);
    setSelectedProductId(0);
    setQuantity(0);
    setImportPrice(0);
    
    toast.success(`Đã thêm ${product.name} vào phiếu nhập`);
  };

  const handleRemoveProduct = (productId: number) => {
    setReceiptDetails(receiptDetails.filter(d => d.productId !== productId));
    toast.info('Đã xóa sản phẩm khỏi phiếu nhập');
  };

  const handleConfirmReceipt = async () => {
    if (!currentUser) {
      toast.error('Không tìm thấy thông tin nhân viên');
      return;
    }

    if (receiptDetails.length === 0) {
      toast.error('Phiếu nhập hàng phải có ít nhất 1 sản phẩm');
      return;
    }

    try {
      setIsLoading(true);
      
      if (typeof currentUser.id !== 'number' || currentUser.id <= 0) {
        throw new Error(`Invalid employee ID: ${currentUser.id}`);
      }
      
      const requestData = {
        authId: currentUser.id,
        items: receiptDetails.map(detail => ({
          productId: detail.productId,
          quantity: detail.quantity,
          price: detail.price,
        })),
      };
      
      console.log('📤 Sending good receipt request:', requestData);

      if (editingReceipt) {
        await updateGoodReceipt(editingReceipt.id, requestData);
        toast.success('Cập nhật phiếu nhập hàng thành công!');
      } else {
        const response = await createGoodReceipt(requestData);
        console.log('📥 Response:', response);
        
        toast.success('Nhập hàng thành công!', {
          description: `Đã tạo phiếu với ${receiptDetails.length} sản phẩm`,
        });
      }
      
      await loadGoodReceipts();
      await loadProducts();
      handleCancelCreate();
    } catch (error: any) {
      console.error('❌ Save good receipt error:', error);
      
      // ✅ Better error messages
      let errorMessage = error.message || 'Không thể lưu phiếu nhập hàng';
      
      if (errorMessage.includes('not found in database')) {
        errorMessage = 'Một số sản phẩm không tồn tại trong hệ thống. Vui lòng liên hệ quản lý để thêm sản phẩm trước khi nhập hàng.';
      }
      
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReceipt = (receipt: GoodReceipt) => {
    setViewingReceipt(receipt);
    setShowReceiptDialog(true);
  };

  const handleEditReceipt = (receipt: GoodReceipt) => {
    // ✅ CRITICAL FIX: Allow both RECEIVING and MANAGER
    if (currentUser?.position !== 'RECEIVING' && currentUser?.position !== 'MANAGER') {
      toast.error('Chỉ nhân viên nhập kho và quản lý mới có quyền chỉnh sửa phiếu');
      return;
    }

    setEditingReceipt(receipt);
    setIsCreatingReceipt(true);
    setReceiptDetails(receipt.goodReceiptDetails);
    
    toast.info('Đang chỉnh sửa phiếu nhập hàng #' + receipt.id);
  };

  const handleDeleteReceipt = (id: number) => {
    // ✅ CRITICAL FIX: Allow both RECEIVING and MANAGER
    if (currentUser?.position !== 'RECEIVING' && currentUser?.position !== 'MANAGER') {
      toast.error('Chỉ nhân viên nhập kho và quản lý mới có quyền xóa phiếu');
      return;
    }

    setDeletingReceiptId(id);
  };

  const confirmDeleteReceipt = async () => {
    if (!deletingReceiptId) return;

    try {
      setIsLoading(true);
      await deleteGoodReceipt(deletingReceiptId);
      await loadGoodReceipts();
      await loadProducts(); // Reload để cập nhật số lượng tồn kho
      toast.success('Xóa phiếu nhập hàng thành công', {
        description: 'Đã hoàn trả số lượng hàng vào kho',
      });
    } catch (error: any) {
      console.error('❌ Delete good receipt error:', error);
      
      // ✅ Better error display for insufficient stock
      const errorMessage = error.message || 'Không thể xóa phiếu nhập hàng';
      
      if (errorMessage.includes('không đủ tồn kho') || errorMessage.includes('insufficient stock')) {
        toast.error('Không thể xóa phiếu nhập hàng', {
          description: errorMessage,
          duration: 7000, // Longer duration for important error
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setDeletingReceiptId(null);
    }
  };

  const calculateTotal = () => {
    return receiptDetails.reduce((sum, detail) => sum + (detail.quantity * detail.price), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-blue-900">
              {editingReceipt 
                ? `Chỉnh sửa Phiếu Nhập Hàng #${editingReceipt.id}` 
                : 'Quản Lý Phiếu Nhập Hàng'
              }
            </CardTitle>
            {!isCreatingReceipt && (
              <Button onClick={handleStartCreateReceipt} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Tạo phiếu nhập hàng
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Create/Edit Receipt Form */}
      {isCreatingReceipt && (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="bg-green-100">
            <CardTitle className="text-green-900 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {editingReceipt ? 'Chỉnh Sửa Phiếu Nhập Hàng' : 'Tạo Phiếu Nhập Hàng Mới'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Barcode Scanner */}
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <Label className="text-green-900 mb-2 block">Quét mã vạch hoặc nhập mã sản phẩm</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập mã vạch sản phẩm..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleBarcodeSearch();
                    }
                  }}
                  className="border-green-200"
                />
                <Button onClick={handleBarcodeSearch} className="bg-green-600 hover:bg-green-700">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Product Selection */}
            <div className="bg-white p-4 rounded-lg border border-green-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chọn hàng hóa</Label>
                  <Popover open={openProductCombobox} onOpenChange={setOpenProductCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openProductCombobox}
                        className="w-full justify-between border-green-200"
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
                          <CommandGroup heading="Sản phẩm có sẵn">
                            {availableProducts.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.name || ''}
                                onSelect={() => {
                                  setSelectedProductId(product.id);
                                  setImportPrice(product.price);
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
                                  <span className="text-xs text-gray-500">Mã vạch: {product.barcode}</span>
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
                      Tồn kho hiện tại: {selectedProduct.amount} | Giá bán: {selectedProduct.price.toLocaleString('vi-VN')}đ
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Số lượng nhập</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity || ''}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    placeholder="Nhập số lượng..."
                    className="border-green-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="importPrice">Giá nhập (VNĐ)</Label>
                  <Input
                    id="importPrice"
                    type="number"
                    min="1"
                    value={importPrice || ''}
                    onChange={(e) => setImportPrice(parseInt(e.target.value) || 0)}
                    placeholder="Nhập giá nhập..."
                    className="border-green-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Thành tiền</Label>
                  <div className="h-10 px-3 py-2 border border-green-200 rounded-md bg-gray-50 flex items-center">
                    {(quantity * importPrice).toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>

              <Button onClick={handleAddProduct} className="w-full bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Thêm vào phiếu nhập
              </Button>
            </div>

            {/* Receipt Details Table */}
            {receiptDetails.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Danh sách hàng hóa ({receiptDetails.length} sản phẩm)
                </h3>
                <div className="border border-green-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-green-50">
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Mã vạch</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead>Giá nhập</TableHead>
                        <TableHead>Thành tiền</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receiptDetails.map((detail) => (
                        <TableRow key={detail.productId}>
                          <TableCell>{detail.product.name}</TableCell>
                          <TableCell>{detail.product.barcode}</TableCell>
                          <TableCell>{detail.quantity}</TableCell>
                          <TableCell>{detail.price.toLocaleString('vi-VN')}đ</TableCell>
                          <TableCell>{(detail.quantity * detail.price).toLocaleString('vi-VN')}đ</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveProduct(detail.productId)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-green-50 font-semibold">
                        <TableCell colSpan={4} className="text-right">Tổng cộng:</TableCell>
                        <TableCell>{calculateTotal().toLocaleString('vi-VN')}đ</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
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
                onClick={handleConfirmReceipt}
                className="bg-green-600 hover:bg-green-700"
                disabled={receiptDetails.length === 0 || isLoading}
              >
                <Check className="mr-2 h-4 w-4" />
                {editingReceipt ? 'Cập nhật phiếu nhập hàng' : 'Xác nhận nhập hàng'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receipt History */}
      {!isCreatingReceipt && (
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-900">Lịch Sử Nhập Hàng</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-2 mb-6 max-w-md">
              <Input
                placeholder="Tìm kiếm theo mã phiếu hoặc người nhập..."
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
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                <p className="text-gray-500">Đang tải danh sách nhập hàng...</p>
              </div>
            ) : goodReceipts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Chưa có phiếu nhập hàng nào</p>
                <p className="text-sm">Nhấn "Tạo phiếu nhập hàng" để bắt đầu</p>
              </div>
            ) : (
              <div className="border border-blue-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="text-blue-900">Mã phiếu</TableHead>
                      <TableHead className="text-blue-900">Ngày nhập</TableHead>
                      <TableHead className="text-blue-900">Người nhập</TableHead>
                      <TableHead className="text-blue-900">Số mặt hàng</TableHead>
                      <TableHead className="text-blue-900">Tổng tiền</TableHead>
                      <TableHead className="text-blue-900 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceipts.map((receipt) => (
                      <TableRow key={receipt.id} className="hover:bg-blue-50">
                        <TableCell>PNH{receipt.id.toString().padStart(3, '0')}</TableCell>
                        <TableCell>{receipt.createdAt.toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{receipt.employee.name}</TableCell>
                        <TableCell>{receipt.goodReceiptDetails.length}</TableCell>
                        <TableCell>
                          {receipt.goodReceiptDetails.reduce((sum, d) => sum + (d.quantity * d.price), 0).toLocaleString('vi-VN')}đ
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewReceipt(receipt)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditReceipt(receipt)}
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              title="Chỉnh sửa"
                              disabled={currentUser?.position !== 'RECEIVING' && currentUser?.position !== 'MANAGER'}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReceipt(receipt.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Xóa"
                              disabled={currentUser?.position !== 'RECEIVING' && currentUser?.position !== 'MANAGER'}
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
      <AlertDialog open={!!deletingReceiptId} onOpenChange={() => setDeletingReceiptId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phiếu nhập hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phiếu nhập hàng PNH{deletingReceiptId?.toString().padStart(3, '0')}? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteReceipt}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa phiếu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Receipt Detail Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="border-blue-200 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Chi tiết phiếu nhập hàng</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {viewingReceipt && `Mã phiếu: PNH${viewingReceipt.id.toString().padStart(3, '0')}`}
            </DialogDescription>
          </DialogHeader>
          
          {viewingReceipt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Người nhập</p>
                  <p className="font-semibold">{viewingReceipt.employee.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày nhập</p>
                  <p className="font-semibold">{viewingReceipt.createdAt.toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="border border-blue-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="text-blue-900">Sản phẩm</TableHead>
                      <TableHead className="text-blue-900">Mã vạch</TableHead>
                      <TableHead className="text-blue-900">SL</TableHead>
                      <TableHead className="text-blue-900">Giá nhập</TableHead>
                      <TableHead className="text-blue-900">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingReceipt.goodReceiptDetails.map((detail) => (
                      <TableRow key={detail.productId} className="hover:bg-blue-50">
                        <TableCell>{detail.product.name}</TableCell>
                        <TableCell>{detail.product.barcode}</TableCell>
                        <TableCell>{detail.quantity}</TableCell>
                        <TableCell>{detail.price.toLocaleString('vi-VN')}đ</TableCell>
                        <TableCell>{(detail.quantity * detail.price).toLocaleString('vi-VN')}đ</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-blue-100 font-semibold">
                      <TableCell colSpan={4} className="text-right">Tổng cộng:</TableCell>
                      <TableCell>
                        {viewingReceipt.goodReceiptDetails.reduce((sum, d) => sum + (d.quantity * d.price), 0).toLocaleString('vi-VN')}đ
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setShowReceiptDialog(false)}
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
