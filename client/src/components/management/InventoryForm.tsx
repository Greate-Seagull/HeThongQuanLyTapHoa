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
  ClipboardCheck,
  Check,
  ChevronsUpDown,
  ChevronRight,
  Eye,
  Package,
  Loader2,
  Edit,
  AlertCircle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { EmployeePosition, ProductStatus, ProductUnit } from '@/types'
import type { Employee, Product, Slot, StocktakingDetail, StocktakingWithDetails } from '@/types'
import { apiClient } from '@/services/api-client'
import {
  getStocktakings,
  getStocktakingById,
  createStocktaking,
  updateStocktaking,
  deleteStocktaking,
} from '@/services/stocktaking.service'
import { stat } from 'fs'

interface Stocktaking {
  id: number
  employeeId: number
  employee: Employee
  createdAt: Date
  details: StocktakingDetail[]
}
interface SlotWithProduct {
  slotId: number
  slotName: string
  rackId: number
  productId: number
  productName: string
}
interface InventoryFormProps {
  currentUser?: { id: number; position: string }
}

// Helper: Lấy số lượng hiện tại của sản phẩm tại slot

// Helper: Cập nhật trạng thái sản phẩm
async function updateProductStatus(productId: number, slotId: number, status: ProductStatus) {
  try {
    const response = await apiClient.patch(`products/${productId}/status`, {
      status: status,
    })
    console.log(response)
  } catch (err: any) {
    throw new Error(`Không thể cập nhật trạng thái: ${err.message}`)
  }
}

export function InventoryForm({ currentUser }: InventoryFormProps) {
  // State
  const [products, setProducts] = useState<Product[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [allSlotsWithProduct, setAllSlotsWithProduct] = useState<SlotWithProduct[]>([])
  const [availableSlots, setAvailableSlots] = useState<SlotWithProduct[]>([])
  const [stocktakings, setStocktakings] = useState<StocktakingWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreatingStocktaking, setIsCreatingStocktaking] = useState(false)
  const [viewingStocktaking, setViewingStocktaking] = useState<Stocktaking | null>(null)
  const [showStocktakingDialog, setShowStocktakingDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingStocktakingId, setDeletingStocktakingId] = useState<number | null>(null)
  const [actualQuantity, setActualQuantity] = useState<number>(0)
  // Form state
  const [barcodeInput, setBarcodeInput] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<number>(0)
  const [selectedSlotId, setSelectedSlotId] = useState<number>(0)
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus>(ProductStatus.GOOD)
  const [currentQuantity, setCurrentQuantity] = useState<number>(0)
  const [stocktakingDetails, setStocktakingDetails] = useState<StocktakingDetail[]>([])
  const [openProductCombobox, setOpenProductCombobox] = useState(false)
  const [openSlotCombobox, setOpenSlotCombobox] = useState(false)
  const [isEditingStocktaking, setIsEditingStocktaking] = useState(false)
  const [editingStocktakingId, setEditingStocktakingId] = useState<number | null>(null)
  const [lastCheckedStocktakingCount, setLastCheckedStocktakingCount] = useState<number>(0)

  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const selectedSlot = slots.find((s) => s._id === selectedSlotId)
  const filteredStocktakings = stocktakings
    .filter(
      (stocktaking) =>
        stocktaking.id.toString().includes(searchTerm) ||
        (stocktaking.employee?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.id - a.id) // Sắp xếp theo mã phiếu giảm dần

  // Load dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [productsRes, slotsWithProductRes, stocktakingsData] = await Promise.all([
          apiClient.get<any>('/products'),
          apiClient.get<any>('/slots/list-with-product'), // ← ĐỔI API
          getStocktakings(),
        ])

        const productsArray = productsRes?.products || []
        const slotsData = slotsWithProductRes || [] // ← ĐỔI
        setProducts(productsArray)
        setAllSlotsWithProduct(Array.isArray(slotsData) ? slotsData : []) // ← ĐỔI
        setStocktakings(Array.isArray(stocktakingsData) ? stocktakingsData : [])

        // Kiểm tra phiếu mới cho Manager
        if (currentUser?.position === 'MANAGER') {
          const storedCount = localStorage.getItem('lastStocktakingCount')
          const lastCount = storedCount ? parseInt(storedCount) : 0
          const newCount = Array.isArray(stocktakingsData) ? stocktakingsData.length : 0

          if (newCount > lastCount) {
            const newStocktakings = newCount - lastCount
            toast.info(`Có ${newStocktakings} phiếu kiểm kê mới được tạo`, { duration: 5000 })
          }

          localStorage.setItem('lastStocktakingCount', newCount.toString())
        }
      } catch (err: any) {
        toast.error(err.message || 'Lỗi tải dữ liệu hệ thống')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentUser])

  // Filter slots khi chọn product
  useEffect(() => {
    if (selectedProductId) {
      const filtered = allSlotsWithProduct.filter((slot) => slot.productId === selectedProductId)
      setAvailableSlots(filtered)

      const product = products.find((p) => p.id === selectedProductId)
      setCurrentQuantity(product?.amount || 0)

      if (selectedSlotId && !filtered.find((s) => s.slotId === selectedSlotId)) {
        setSelectedSlotId(0)
      }
    } else {
      setAvailableSlots([])
      setCurrentQuantity(0)
      setSelectedSlotId(0)
    }
  }, [selectedProductId, allSlotsWithProduct, products, selectedSlotId])
  // Handlers
  const handleStartCreateStocktaking = () => {
    setIsCreatingStocktaking(true)
    setStocktakingDetails([])
    setSelectedProductId(0)
    setSelectedSlotId(0)
    setSelectedStatus(ProductStatus.GOOD)
    setCurrentQuantity(0)
    setBarcodeInput('')
  }

  const handleCancelCreate = () => {
    setIsCreatingStocktaking(false)
    setIsEditingStocktaking(false)
    setEditingStocktakingId(null)
    setStocktakingDetails([])
    setSelectedProductId(0)
    setSelectedSlotId(0)
    setSelectedStatus(ProductStatus.GOOD)
    setCurrentQuantity(0)
    setActualQuantity(0) // ← Thêm dòng này

    setBarcodeInput('')
  }

  const handleEditStocktaking = async (stocktaking: Stocktaking) => {
    setIsEditingStocktaking(true)
    setEditingStocktakingId(stocktaking.id)
    setIsCreatingStocktaking(true)

    const detail = await getStocktakingById(stocktaking.id)
    setStocktakingDetails(detail.stocktakingDetails || [])
    setSelectedProductId(0)
    setSelectedSlotId(0)
    setActualQuantity(0)
    setCurrentQuantity(0)
  }

  const handleBarcodeSearch = () => {
    if (!barcodeInput) return
    const product = products.find((p) => p.barcode?.toString() === barcodeInput)
    if (product) {
      setSelectedProductId(product.id)
      toast.success(`Tìm thấy: ${product.name}`)
    } else {
      toast.error('Không tìm thấy sản phẩm với mã vạch này')
    }
    setBarcodeInput('')
  }

  const handleAddDetail = async () => {
    if (!selectedProductId || !selectedSlotId) {
      toast.error('Vui lòng chọn đầy đủ sản phẩm và vị trí')
      return
    }

    if (actualQuantity < 0) {
      toast.error('Số lượng thực tế phải >= 0')
      return
    }

    const product = products.find((p) => p.id === selectedProductId)
    const slotData = allSlotsWithProduct.find((s) => s.slotId === selectedSlotId)

    if (!product || !slotData) {
      toast.error('Sản phẩm hoặc vị trí không hợp lệ')
      return
    }

    const newId = Date.now()
    const newDetail: StocktakingDetail = {
      id: newId,
      stocktakingId: 0,
      productId: product.id,
      product,
      slotId: slotData.slotId,
      slot: {
        _id: slotData.slotId,
        _name: slotData.slotName,
      } as any,
      status: selectedStatus,
      quantity: actualQuantity, // ← Dùng số lượng thực tế
    }

    // Tính chênh lệch
    const difference = currentQuantity - actualQuantity
    const diffText = difference > 0 ? `+${difference}` : difference < 0 ? `${difference}` : 'Khớp'

    toast.success(`Đã thêm ${product.name}`, {
      description: `HT: ${currentQuantity} | Thực tế: ${actualQuantity} | Đã bán: ${diffText}`, // ← ĐỔI text
    })
    setStocktakingDetails([...stocktakingDetails, newDetail])
    setSelectedProductId(0)
    setSelectedSlotId(0)
    setCurrentQuantity(0)
    setActualQuantity(0) // ← Reset

    toast.success(`Đã thêm ${product.name}`, {
      description: `HT: ${currentQuantity} | Thực tế: ${actualQuantity} | Chênh lệch: ${diffText}`,
    })
  }

  const handleRemoveDetail = (detailId: number) => {
    setStocktakingDetails(stocktakingDetails.filter((d) => d.id !== detailId))
    toast.info('Đã xóa dòng chi tiết')
  }

  const handleConfirmStocktaking = async () => {
    if (!currentUser) {
      toast.error('Lỗi: Không tìm thấy thông tin nhân viên')
      return
    }
    if (currentUser.position !== 'INVENTORY' && currentUser.position !== 'MANAGER') {
      toast.error('Bạn không có quyền lập phiếu kiểm kê')
      return
    }
    if (stocktakingDetails.length === 0) {
      toast.error('Phiếu kiểm kê trống')
      return
    }

    setLoading(true)
    try {
      if (isEditingStocktaking && editingStocktakingId) {
        // CẬP NHẬT PHIẾU
        await updateStocktaking(editingStocktakingId, {
          products: stocktakingDetails.map((d) => ({
            barcode: d.product?.barcode || 0,
            slotId: d.slotId,
            status: d.status,
            quantity: d.quantity,
          })),
        })

        // Cập nhật trạng thái sản phẩm
        for (const detail of stocktakingDetails) {
          await updateProductStatus(detail.productId, detail.slotId, detail.status)
        }

        toast.success('Cập nhật phiếu kiểm kê thành công!')
      } else {
        // TẠO MỚI PHIẾU
        await createStocktaking({
          products: stocktakingDetails.map((d) => ({
            barcode: d.product?.barcode || 0,
            slotId: d.slotId,
            status: d.status,
            quantity: d.quantity,
          })),
        })

        // Cập nhật trạng thái sản phẩm
        for (const detail of stocktakingDetails) {
          await updateProductStatus(detail.productId, detail.slotId, detail.status)
        }

        toast.success('Lưu phiếu kiểm kê thành công!')
      }

      // Reset
      handleCancelCreate()
      const data = await getStocktakings()
      setStocktakings(Array.isArray(data) ? data : [])
    } catch (err: any) {
      toast.error(err.message || 'Lưu phiếu thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleViewStocktaking = async (stocktaking: Stocktaking) => {
    setLoadingDetail(true)
    setShowStocktakingDialog(true)
    try {
      const detail = await getStocktakingById(stocktaking.id)
      setViewingStocktaking({
        ...detail,
        details: detail.stocktakingDetails || [],
        createdAt: new Date(detail.createdAt),
      } as Stocktaking)
    } catch (err: any) {
      setViewingStocktaking(null)
      toast.error('Không thể tải chi tiết phiếu')
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleDeleteStocktaking = async (id: number) => {
    setDeletingStocktakingId(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!deletingStocktakingId) return

    setLoading(true)
    try {
      // Lấy chi tiết phiếu để rollback status
      const detail = await getStocktakingById(deletingStocktakingId)

      // Rollback trạng thái về GOOD cho tất cả sản phẩm
      for (const item of detail.stocktakingDetails || []) {
        await updateProductStatus(item.productId, item.slotId, ProductStatus.GOOD)
      }

      // Xóa phiếu
      await deleteStocktaking(deletingStocktakingId)
      toast.success('Đã xóa phiếu kiểm kê và khôi phục trạng thái sản phẩm')

      // Reload
      const data = await getStocktakings()
      setStocktakings(Array.isArray(data) ? data : [])
    } catch (err: any) {
      toast.error(err.message || 'Xóa phiếu thất bại')
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
      setDeletingStocktakingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-900">Quản Lý Phiếu Kiểm Kê</CardTitle>
            {!isCreatingStocktaking && (
              <Button
                onClick={handleStartCreateStocktaking}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Lập phiếu kiểm kê
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Create/Edit Form */}
      {isCreatingStocktaking && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader className="bg-purple-100">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <ClipboardCheck className="h-5 w-5" />
              {isEditingStocktaking ? 'Sửa Phiếu Kiểm Kê' : 'Lập Phiếu Kiểm Kê Mới'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Barcode Scanner */}
            <div className="rounded-lg border border-purple-200 bg-white p-4">
              <Label className="mb-2 block text-purple-900">Quét mã vạch hoặc nhập barcode</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập barcode sản phẩm..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleBarcodeSearch()
                  }}
                  className="border-purple-200"
                />
                <Button onClick={handleBarcodeSearch} className="bg-purple-600 hover:bg-purple-700">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Product & Slot Selection */}
            <div className="space-y-4 rounded-lg border border-purple-200 bg-white p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Product Combobox */}
                <div className="space-y-2">
                  <Label>Sản phẩm</Label>
                  <Popover open={openProductCombobox} onOpenChange={setOpenProductCombobox}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {/* ĐỔI dòng này: */}
                        {selectedProduct ? selectedProduct.name : 'Chọn sản phẩm...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Tìm sản phẩm..." />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy</CommandEmpty>
                          <CommandGroup>
                            {products.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.name + product.barcode}
                                onSelect={() => {
                                  setSelectedProductId(product.id)
                                  setOpenProductCombobox(false)
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${selectedProductId === product.id ? 'opacity-100' : 'opacity-0'}`}
                                />
                                {product.name} — {product.barcode}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Slot Combobox */}
                {/* Slot Combobox */}
                <div className="space-y-2">
                  <Label>Vị trí</Label>
                  <Popover open={openSlotCombobox} onOpenChange={setOpenSlotCombobox}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {selectedSlotId
                          ? (() => {
                              const slot = availableSlots.find((s) => s.slotId === selectedSlotId)
                              return slot
                                ? `${slot.shelfName} - ${slot.rackName} - ${slot.slotName}`
                                : 'Chọn vị trí...'
                            })()
                          : 'Chọn vị trí...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Tìm vị trí..." />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy</CommandEmpty>
                          <CommandGroup>
                            {availableSlots.map((slot) => (
                              <CommandItem
                                key={slot.slotId}
                                value={`${slot.shelfName} ${slot.rackName} ${slot.slotName}`}
                                onSelect={() => {
                                  setSelectedSlotId(slot.slotId)
                                  setOpenSlotCombobox(false)
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${selectedSlotId === slot.slotId ? 'opacity-100' : 'opacity-0'}`}
                                />
                                {slot.shelfName} {slot.rackName} {slot.slotName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Status */}
                <div className="space-y-2">
                  <Label>Tình trạng</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(v) => setSelectedStatus(v as ProductStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductStatus.GOOD}>Tốt</SelectItem>
                      <SelectItem value={ProductStatus.EXPIRED}>Hết hạn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Số lượng hệ thống (Read-only) */}
                <div className="space-y-2">
                  <Label>Số lượng hệ thống</Label>
                  <Input
                    value={currentQuantity}
                    readOnly
                    className="bg-gray-50 font-semibold"
                    placeholder="Chọn sản phẩm"
                  />
                </div>
              </div>

              {/* Thêm dòng mới cho số lượng thực tế */}
              <div className="space-y-2">
                <Label>Số lượng thực tế kiểm kê</Label>
                <Input
                  type="number"
                  value={actualQuantity}
                  onChange={(e) => setActualQuantity(Number(e.target.value) || 0)}
                  placeholder="Nhập số lượng đếm được..."
                  min="0"
                />
              </div>

              <Button
                onClick={handleAddDetail}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm vào danh sách
              </Button>
            </div>

            {/* Details Table */}
            {stocktakingDetails.length > 0 && (
              <div className="rounded-lg border border-purple-200 bg-white p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Package className="h-4 w-4" />
                  Danh sách ({stocktakingDetails.length} mục)
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50">
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>SL Hệ thống</TableHead>
                      <TableHead>SL Thực tế</TableHead>
                      <TableHead>Đã Bán </TableHead>
                      <TableHead className="text-right">Xóa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocktakingDetails.map((detail) => {
                      const systemQty = products.find((p) => p.id === detail.productId)?.amount || 0
                      const actualQty = detail.quantity
                      const diff = systemQty - actualQty

                      return (
                        <TableRow key={detail.id}>
                          <TableCell>{detail.product!.name}</TableCell>
                          <TableCell className="text-sm">
                            {detail.slot!.rack?.shelf?.name} &gt; {detail.slot!.rack?.name} &gt;{' '}
                            {detail.slot!.name}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={detail.status}
                              onValueChange={(v) => {
                                setStocktakingDetails(
                                  stocktakingDetails.map((d) =>
                                    d.id === detail.id ? { ...d, status: v as ProductStatus } : d
                                  )
                                )
                              }}
                            >
                              <SelectTrigger className="h-8 w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={ProductStatus.GOOD}>Tốt</SelectItem>
                                <SelectItem value={ProductStatus.EXPIRED}>Hết hạn</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{systemQty}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={actualQty}
                              onChange={(e) => {
                                const newQty = Number(e.target.value) || 0
                                setStocktakingDetails(
                                  stocktakingDetails.map((d) =>
                                    d.id === detail.id ? { ...d, quantity: newQty } : d
                                  )
                                )
                              }}
                              className="h-8 w-20"
                              min="0"
                            />
                          </TableCell>{' '}
                          <TableCell>
                            <span
                              className={`font-semibold ${
                                diff > 0
                                  ? 'text-green-600'
                                  : diff < 0
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                              }`}
                            >
                              {diff > 0 ? `${diff}` : diff < 0 ? diff : '0'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDetail(detail.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCancelCreate}>
                Hủy
              </Button>
              <Button
                onClick={handleConfirmStocktaking}
                disabled={loading || stocktakingDetails.length === 0}
                className="bg-purple-600"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Xác nhận lưu
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stocktaking List */}
      {!isCreatingStocktaking && (
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-900">Lịch Sử Kiểm Kê</CardTitle>
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

            {loading ? (
              <div className="py-8 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã phiếu</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Người kiểm</TableHead>
                    <TableHead>Số mục</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocktakings.map((st) => (
                    <TableRow key={st.id}>
                      <TableCell>PKK{st.id.toString().padStart(3, '0')}</TableCell>
                      <TableCell>{new Date(st.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>{st.employee?.name}</TableCell>
                      <TableCell>{st.stocktakingDetails?.length || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600"
                          onClick={() => handleViewStocktaking(st as any)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStocktaking(st as any)}
                          className="text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStocktaking(st.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button> */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Dialog */}
      <Dialog open={showStocktakingDialog} onOpenChange={setShowStocktakingDialog}>
        <DialogContent className="max-h-[90vh] max-w-[1000px] overflow-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết phiếu kiểm kê</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin" />
            </div>
          ) : viewingStocktaking ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded bg-gray-50 p-4">
                <div>
                  <p className="text-sm text-gray-600">Người kiểm</p>
                  <p className="font-semibold">{viewingStocktaking.employee?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày kiểm</p>
                  <p className="font-semibold">
                    {new Date(viewingStocktaking.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>SL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingStocktaking.details.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.product?.name}</TableCell>
                        <TableCell className="text-xs">
                          {d.slot?.rack?.shelf?.name} &gt; {d.slot?.rack?.name} &gt; {d.slot?.name}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`rounded px-2 py-1 text-xs ${d.status === ProductStatus.GOOD ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {d.status === ProductStatus.GOOD ? 'Tốt' : 'Hết hạn'}
                          </span>
                        </TableCell>
                        <TableCell>{d.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setShowStocktakingDialog(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Xác nhận xóa phiếu kiểm kê
            </DialogTitle>
            <DialogDescription>
              Hành động này sẽ xóa phiếu kiểm kê và{' '}
              <strong>khôi phục trạng thái sản phẩm về "Tốt"</strong>. Bạn có chắc chắn?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Xóa phiếu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
