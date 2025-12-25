'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Plus,
  Trash2,
  Search,
  Package,
  ShoppingCart,
  Check,
  ChevronsUpDown,
  Eye,
  Edit,
  Loader2,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { toast } from 'sonner'
import { ProductUnit, ProductStatus, EmployeePosition } from '@/types'
import type { Employee, Product } from '@/types'
import { createGoodReceipt } from '@/services/good-receipt.service'
import { apiClient } from '@/services/api-client'

// ...existing code...

// ...existing code...

// Local interfaces cho component này
interface GoodReceiptDetail {
  productId: number
  product: Product
  quantity: number
  price: number
}

interface GoodReceipt {
  id: number
  employeeId: number
  employee: Employee
  createdAt: Date
  details: GoodReceiptDetail[]
}

interface ImportFormProps {
  currentUser?: { id: number; position: string }
}

export function ImportForm({ currentUser }: ImportFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [goodReceipts, setGoodReceipts] = useState<GoodReceipt[]>([])
  const [loading, setLoading] = useState(false)
  const [isEditingReceipt, setIsEditingReceipt] = useState(false) // ← THÊM
  const [editingReceiptId, setEditingReceiptId] = useState<number | null>(null) // ← THÊM
  // TODO: Fetch goodReceipts history from API if needed
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreatingReceipt, setIsCreatingReceipt] = useState(false)
  const [viewingReceipt, setViewingReceipt] = useState<GoodReceipt | null>(null)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)

  // Form state for creating new receipt
  const [selectedProductId, setSelectedProductId] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(0)
  const [importPrice, setImportPrice] = useState<number>(0)
  const [receiptDetails, setReceiptDetails] = useState<GoodReceiptDetail[]>([])
  const [openProductCombobox, setOpenProductCombobox] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState('')
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get<Product[]>('/products')
        const productData = res?.products || res?.products || []

        setProducts(Array.isArray(productData) ? productData : [])
      } catch (err) {
        setProducts([])
        toast.error('Không thể tải danh sách sản phẩm')
      }
    }
    fetchProducts()
  }, [])

  // Fetch goodReceipts history from API (if backend đã có)
  // Load lịch sử phiếu nhập kho từ API
  const fetchReceipts = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<any[]>('/good-receipts')
      setGoodReceipts(
        Array.isArray(res)
          ? res.map((r, idx) => {
              // Chuẩn hóa dữ liệu phiếu nhập
              const details = Array.isArray(r.goodReceiptDetails)
                ? r.goodReceiptDetails
                : Array.isArray(r.details)
                  ? r.details
                  : []
              return {
                id: typeof r.id === 'number' ? r.id : idx + 1, // fallback nếu id null
                employeeId: r.employeeId,
                employee:
                  r.employee && r.employee.name
                    ? r.employee
                    : { name: 'Chưa rõ', id: r.employeeId },
                createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
                details: details.map((d: any, i: number) => ({
                  ...d,
                  product: d.product || { name: '---', barcode: '', id: d.productId },
                  productId: d.productId,
                })),
              }
            })
          : []
      )
    } catch (err) {
      setGoodReceipts([])
      // toast.error('Không thể tải lịch sử phiếu nhập');
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchReceipts()
  }, [])

  // Lọc sản phẩm chưa được thêm vào phiếu
  const availableProducts = Array.isArray(products)
    ? products.filter((p) => !receiptDetails.some((d) => d.productId === p.id))
    : []
  const handleStartEdit = (receipt: GoodReceipt) => {
    setIsEditingReceipt(true)
    setIsCreatingReceipt(true) // ← THÊM dòng này

    setEditingReceiptId(receipt.id)

    // Load dữ liệu phiếu nhập vào form
    setReceiptDetails(
      receipt.details.map((d) => ({
        productId: d.productId,
        product: d.product,
        quantity: d.quantity,
        price: d.price,
      }))
    )

    // Reset các field khác
    setSelectedProductId(0)
    setQuantity(0)
    setImportPrice(0)
    setBarcodeInput('')
  }
  const selectedProduct = Array.isArray(products)
    ? products.find((p) => p.id === selectedProductId)
    : undefined
  const filteredReceipts = goodReceipts.filter((receipt) => {
    const idStr = receipt.id?.toString() || ''
    const pnhStr =
      typeof receipt.id === 'number' ? `PNH${receipt.id.toString().padStart(3, '0')}` : ''
    const search = searchTerm.trim().toLowerCase()
    return (
      idStr.includes(search) ||
      pnhStr.toLowerCase().includes(search) ||
      (receipt.employee?.name || '').toLowerCase().includes(search)
    )
  })

  const handleStartCreateReceipt = () => {
    setIsCreatingReceipt(true)
    setReceiptDetails([])
    setSelectedProductId(0)
    setQuantity(0)
    setImportPrice(0)
    setBarcodeInput('')
  }

  const handleCancelCreate = () => {
    setIsCreatingReceipt(false)
    setIsEditingReceipt(false) // ← THÊM
    setEditingReceiptId(null)
    setReceiptDetails([])
    setSelectedProductId(0)
    setQuantity(0)
    setImportPrice(0)
    setBarcodeInput('')
  }

  const handleBarcodeSearch = () => {
    if (!barcodeInput) return

    const product = products.find((p) => p.barcode.toString() === barcodeInput)
    if (product) {
      // Kiểm tra sản phẩm đã được thêm chưa
      if (receiptDetails.some((d) => d.productId === product.id)) {
        toast.error('Sản phẩm đã được thêm vào phiếu nhập')
        return
      }
      setSelectedProductId(product.id)
      setImportPrice(product.price) // Đề xuất giá nhập dựa trên giá bán
      toast.success(`Tìm thấy: ${product.name}`)
    } else {
      toast.error('Không tìm thấy sản phẩm với mã vạch này')
    }
    setBarcodeInput('')
  }

  const handleAddProduct = () => {
    // Validate
    if (!selectedProductId) {
      toast.error('Vui lòng chọn sản phẩm')
      return
    }

    if (quantity <= 0) {
      toast.error('Số lượng nhập phải lớn hơn 0')
      return
    }

    if (importPrice <= 0) {
      toast.error('Giá nhập phải lớn hơn 0')
      return
    }

    const product = products.find((p) => p.id === selectedProductId)
    if (!product) {
      toast.error('Mã hàng hóa không tồn tại')
      return
    }

    // Thêm sản phẩm vào phiếu
    const newDetail: GoodReceiptDetail = {
      productId: product.id,
      product,
      quantity,
      price: importPrice,
    }

    setReceiptDetails([...receiptDetails, newDetail])

    // Reset form
    setSelectedProductId(0)
    setQuantity(0)
    setImportPrice(0)

    toast.success(`Đã thêm ${product.name} vào phiếu nhập`)
  }

  const handleRemoveProduct = (productId: number) => {
    setReceiptDetails(receiptDetails.filter((d) => d.productId !== productId))
    toast.info('Đã xóa sản phẩm khỏi phiếu nhập')
  }

  const handleConfirmReceipt = async () => {
    // Kiểm tra có nhân viên đang đăng nhập không
    if (!currentUser) {
      toast.error('Không tìm thấy thông tin nhân viên')
      return
    }

    // Kiểm tra nhân viên có quyền nhập hàng không (position = RECEIVING)
    if (currentUser.position !== 'RECEIVING' && currentUser.position !== 'MANAGER') {
      toast.error(
        'Bạn không có quyền nhập hàng. Chỉ nhân viên "Nhập kho" hoặc "Quản lý" mới có quyền tạo phiếu nhập.'
      )
      return
    }

    // Kiểm tra phiếu có sản phẩm không
    if (receiptDetails.length === 0) {
      toast.error('Phiếu nhập hàng phải có ít nhất 1 sản phẩm')
      return
    }

    // Kiểm tra lại từng sản phẩm
    for (const detail of receiptDetails) {
      const product = products.find((p) => p.id === detail.productId)
      if (!product) {
        toast.error(`Mã hàng hóa ${detail.productId} không tồn tại`)
        return
      }
      if (detail.quantity <= 0) {
        toast.error(`Số lượng nhập của ${product.name} phải lớn hơn 0`)
        return
      }
      if (detail.price <= 0) {
        toast.error(`Giá nhập của ${product.name} phải lớn hơn 0`)
        return
      }
    }

    setLoading(true)
    try {
      const payload = {
        items: receiptDetails.map((d) => ({
          productId: d.productId,
          quantity: d.quantity,
          price: d.price,
        })),
      }
      // ← THÊM logic edit/create
      if (isEditingReceipt && editingReceiptId) {
        await apiClient.put(`/good-receipts/${editingReceiptId}`, payload)
        toast.success('Cập nhật phiếu nhập thành công!')
      } else {
        await createGoodReceipt(payload)
        toast.success('Nhập hàng thành công!')
      }
      setIsEditingReceipt(false) // ← THÊM
      setEditingReceiptId(null)
      setIsCreatingReceipt(false)
      setReceiptDetails([])
      setSelectedProductId(0)
      setQuantity(0)
      setImportPrice(0)
      // Reload products
      const res = await apiClient.get<Product[]>('/products')
      setProducts(res)
      // Reload goodReceipts history
      await fetchReceipts()
    } catch (err: any) {
      toast.error(err.message || 'Nhập hàng thất bại')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    return receiptDetails.reduce((sum, detail) => sum + detail.quantity * detail.price, 0)
  }

  const handleViewReceipt = async (receipt: GoodReceipt) => {
    // Nếu backend có API get chi tiết phiếu nhập thì gọi ở đây
    // const detail = await apiClient.get<any>(`/good-receipts/${receipt.id}`)
    setViewingReceipt(receipt)
    setShowReceiptDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-900">Quản Lý Phiếu Nhập Hàng</CardTitle>
            {!isCreatingReceipt && (
              <Button onClick={handleStartCreateReceipt} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Tạo phiếu nhập hàng
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Create Receipt Form */}
      {(isCreatingReceipt || isEditingReceipt) && ( // ← Giữ nguyên cái này
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="bg-green-100">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <ShoppingCart className="h-5 w-5" />
              {isEditingReceipt ? 'Chỉnh Sửa Phiếu Nhập Hàng' : 'Tạo Phiếu Nhập Hàng Mới'}{' '}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Barcode Scanner */}
            <div className="rounded-lg border border-green-200 bg-white p-4">
              <Label className="mb-2 block text-green-900">
                Quét mã vạch hoặc nhập mã sản phẩm
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập mã vạch sản phẩm..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleBarcodeSearch()
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
            <div className="space-y-4 rounded-lg border border-green-200 bg-white p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                  setSelectedProductId(product.id)
                                  setImportPrice(product.price)
                                  setOpenProductCombobox(false)
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
                                    Mã vạch: {product.barcode}
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
                      Tồn kho hiện tại: {selectedProduct.amount} | Giá bán:{' '}
                      {selectedProduct.price.toLocaleString('vi-VN')}đ
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  <div className="flex h-10 items-center rounded-md border border-green-200 bg-gray-50 px-3 py-2">
                    {(quantity * importPrice).toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAddProduct}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!selectedProductId || quantity <= 0 || importPrice <= 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm vào phiếu nhập
              </Button>
            </div>

            {/* Receipt Details Table */}
            {receiptDetails.length > 0 && (
              <div className="rounded-lg border border-green-200 bg-white p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-green-900">
                  <Package className="h-4 w-4" />
                  Danh sách hàng hóa ({receiptDetails.length} sản phẩm)
                </h3>
                <div className="overflow-hidden rounded-lg border border-green-200">
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
                          <TableCell>
                            {(detail.quantity * detail.price).toLocaleString('vi-VN')}đ
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveProduct(detail.productId)}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-green-50 font-semibold">
                        <TableCell colSpan={4} className="text-right">
                          Tổng cộng:
                        </TableCell>
                        <TableCell>{calculateTotal().toLocaleString('vi-VN')}đ</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCancelCreate} className="border-gray-300">
                Hủy
              </Button>
              <Button
                onClick={handleConfirmReceipt}
                className="bg-green-600 hover:bg-green-700"
                disabled={receiptDetails.length === 0 || loading} // ← Thêm loading
              >
                {loading ? ( // ← Thêm conditional render
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {isEditingReceipt ? 'Cập nhật phiếu nhập' : 'Xác nhận nhập hàng'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receipt History */}
      {!isCreatingReceipt &&
        !isEditingReceipt && ( // ← SỬA
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-900">Lịch Sử Nhập Hàng</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 flex max-w-md gap-2">
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

              <div className="min-h-[48px]">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    <span>Đang tải dữ liệu phiếu nhập hàng...</span>
                  </div>
                ) : goodReceipts.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Package className="mx-auto mb-3 h-12 w-12 opacity-20" />
                    <p>Chưa có phiếu nhập hàng nào</p>
                    <p className="text-sm">Nhấn "Tạo phiếu nhập hàng" để bắt đầu</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-blue-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-blue-50">
                          <TableHead className="text-blue-900">Mã phiếu</TableHead>
                          <TableHead className="text-blue-900">Ngày nhập</TableHead>
                          <TableHead className="text-blue-900">Người nhập</TableHead>
                          <TableHead className="text-blue-900">Số mặt hàng</TableHead>
                          <TableHead className="text-blue-900">Tổng tiền</TableHead>
                          <TableHead className="text-right text-blue-900">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReceipts.map((receipt, idx) => (
                          <TableRow
                            key={typeof receipt.id === 'number' ? receipt.id : `row-${idx}`}
                            className="hover:bg-blue-50"
                          >
                            <TableCell>
                              {typeof receipt.id === 'number' && !isNaN(receipt.id)
                                ? `PNH${receipt.id.toString().padStart(3, '0')}`
                                : '---'}
                            </TableCell>
                            <TableCell>
                              {receipt.createdAt &&
                              typeof receipt.createdAt.toLocaleDateString === 'function'
                                ? receipt.createdAt.toLocaleDateString('vi-VN')
                                : '---'}
                            </TableCell>
                            <TableCell>{receipt.employee?.name || '---'}</TableCell>
                            <TableCell>
                              {Array.isArray(receipt.details) ? receipt.details.length : 0}
                            </TableCell>
                            <TableCell>
                              {Array.isArray(receipt.details)
                                ? receipt.details
                                    .reduce((sum, d) => sum + d.quantity * d.price, 0)
                                    .toLocaleString('vi-VN')
                                : '0đ'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {' '}
                                {/* ← THÊM wrapper */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStartEdit(receipt)} // ← THÊM
                                  className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                >
                                  <Edit className="h-4 w-4" /> {/* ← Import Edit từ lucide-react */}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewReceipt(receipt)}
                                  className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
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

      {/* Receipt Detail Dialog */}
      {showReceiptDialog && viewingReceipt && (
        <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
          <DialogContent className="max-w-3xl border-blue-200">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Chi tiết phiếu nhập hàng</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Mã phiếu: PNH{viewingReceipt.id.toString().padStart(3, '0')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Thông tin phiếu */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-blue-50 p-4">
                <div>
                  <p className="text-sm text-gray-600">Người nhập</p>
                  <p className="font-semibold">{viewingReceipt.employee.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày nhập</p>
                  <p className="font-semibold">
                    {viewingReceipt.createdAt.toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="overflow-hidden rounded-lg border border-blue-200">
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
                    {viewingReceipt.details.map((detail) => (
                      <TableRow key={detail.productId} className="hover:bg-blue-50">
                        <TableCell>{detail.product.name}</TableCell>
                        <TableCell>{detail.product.barcode}</TableCell>
                        <TableCell>{detail.quantity}</TableCell>
                        <TableCell>{detail.price.toLocaleString('vi-VN')}đ</TableCell>
                        <TableCell>
                          {(detail.quantity * detail.price).toLocaleString('vi-VN')}đ
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-blue-100 font-semibold">
                      <TableCell colSpan={4} className="text-right">
                        Tổng cộng:
                      </TableCell>
                      <TableCell>
                        {viewingReceipt.details
                          .reduce((sum, d) => sum + d.quantity * d.price, 0)
                          .toLocaleString('vi-VN')}
                        đ
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

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
      )}
    </div>
  )
}
