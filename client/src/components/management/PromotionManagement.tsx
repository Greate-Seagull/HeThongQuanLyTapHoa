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
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2, Search, Loader2, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/services/api-client'
import { toast } from 'sonner'

enum PromotionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

interface Promotion {
  id: number
  name: string
  description: string | null
  startedAt: Date | string
  endedAt: Date | string
  value: number
  promotionType: PromotionType
  promotionDetails?: PromotionDetail[]
}

interface PromotionDetail {
  productId: number
  promotionId: number
  product?: Product
}

interface Product {
  id: number
  name: string
  barcode: number
  price: number
}

interface ApiResponse {
  status: string
  data: Promotion[]
}

export function PromotionManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number; name: string }>({
    open: false,
    id: 0,
    name: '',
  })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startedAt: '',
    endedAt: '',
    selectedProducts: [] as number[],
    value: 0,
    promotionType: PromotionType.PERCENTAGE,
  })

  useEffect(() => {
    fetchPromotions()
    fetchProducts()
  }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<any>('/promotions')
      const promotionsData = response.data?.data || response.data || response
      if (Array.isArray(promotionsData)) {
        setPromotions(promotionsData)
      } else {
        console.error('Promotions data is not an array:', promotionsData)
        setPromotions([])
      }
      setError(null)
    } catch (err) {
      setError('Không thể tải dữ liệu khuyến mãi')
      console.error('Error fetching promotions:', err)
      setPromotions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get<any>('/products')
      // API returns {products: [...]} format
      const productsData = response.products || response.data?.products || response.data || response
      if (Array.isArray(productsData)) {
        setProducts(productsData)
      } else {
        console.error('Products data is not an array:', productsData)
        setProducts([])
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setProducts([])
    }
  }

  const filteredPromotions = promotions
    .filter((promo) => promo.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.id - a.id)

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.barcode.toString().includes(productSearchTerm)
  )

  const handleAdd = () => {
    setEditingPromotion(null)
    setProductSearchTerm('')
    setFormData({
      name: '',
      description: '',
      startedAt: '',
      endedAt: '',
      selectedProducts: [],
      value: 0,
      promotionType: PromotionType.PERCENTAGE,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setProductSearchTerm('')
    const startDate = new Date(promotion.startedAt).toISOString().split('T')[0]
    const endDate = new Date(promotion.endedAt).toISOString().split('T')[0]

    const productIds = promotion.promotionDetails?.map((pd) => pd.productId) || []
    console.log('Editing promotion:', promotion.name)
    console.log('Promotion details:', promotion.promotionDetails)
    console.log('Selected product IDs:', productIds)

    setFormData({
      name: promotion.name,
      description: promotion.description || '',
      startedAt: startDate,
      endedAt: endDate,
      selectedProducts: productIds,
      value: promotion.value,
      promotionType: promotion.promotionType,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number, name: string) => {
  setDeleteConfirm({ open: true, id, name })
  }

const confirmDelete = async () => {
    try {
      const data = await apiClient.delete(`/promotions/${deleteConfirm.id}`)
      if (data) {
        toast.success('Khuyến mãi đã được xóa thành công')
        fetchPromotions()
      }
    } catch (err: any) {
      console.error('Error deleting promotion:', err)
      // Nếu backend trả về lỗi do đã có dữ liệu trong hóa đơn thì báo lỗi rõ ràng
      const msg = err?.response?.data?.message || ''
      if (typeof msg === 'string' && (msg.includes('hóa đơn') || msg.includes('invoice'))) {
        toast.error('Không thể xóa khuyến mãi vì đã được sử dụng trong hóa đơn.')
      } else {
        toast.error('Không thể xóa khuyến mãi.')
      }
    } finally {
      setDeleteConfirm({ open: false, id: 0, name: '' })
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên khuyến mãi')
      return
    }
    if (!formData.selectedProducts || formData.selectedProducts.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm áp dụng khuyến mãi')
      return
    }
    if (!formData.startedAt || !formData.endedAt) {
      toast.error('Vui lòng chọn ngày bắt đầu và ngày kết thúc')
      return
    }
    const startDate = new Date(formData.startedAt)
    const endDate = new Date(formData.endedAt)
    if (startDate >= endDate) {
      toast.error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc')
      return
    }
    if (formData.promotionType === PromotionType.PERCENTAGE && formData.value > 100) {
      toast.error('Phần trăm khuyến mãi không được vượt quá 100%')
      return
    }
    if (formData.value <= 0) {
      toast.error('Giá trị khuyến mãi phải lớn hơn 0')
      return
    }

    setIsSaving(true)
    const promotionData: any = {
      name: formData.name,
      description: formData.description || null,
      startedAt: new Date(formData.startedAt).toISOString(),
      endedAt: new Date(formData.endedAt).toISOString(),
      value: formData.value,
      promotionType: formData.promotionType,
      promotionDetails: formData.selectedProducts.map((id) => ({ productId: id })),
    }
    try {
      console.log('=== SAVING PROMOTION ===')
      console.log('Is editing:', !!editingPromotion)
      console.log('Promotion data:', promotionData)
      if (editingPromotion) {
        const response = await apiClient.put<Promotion>(
          `/promotions/${editingPromotion.id}`,
          promotionData
        )
        if (response) {
          toast.success('Khuyến mãi đã được cập nhật thành công')
          fetchPromotions()
        }
      } else {
        const response = await apiClient.post<Promotion>('/promotions', promotionData)
        if (response) {
          toast.success('Khuyến mãi đã được tạo thành công')
          fetchPromotions()
        }
      }
      setIsDialogOpen(false)
    } catch (err) {
      console.error('Error saving promotion:', err)
      toast.error('Không thể lưu khuyến mãi')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleProduct = (productId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter((id) => id !== productId)
        : [...prev.selectedProducts, productId],
    }))
  }

  const removeProduct = (productId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter((id) => id !== productId),
    }))
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('vi-VN')
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-900">Quản Lý Khuyến Mãi</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex max-w-md flex-1 gap-2">
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

          <div className="overflow-hidden rounded-lg border border-blue-200">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="py-12 text-center text-red-600">
                {error}
                <Button onClick={fetchPromotions} className="ml-4 bg-blue-600 hover:bg-blue-700">
                  Thử lại
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead className="text-blue-900">ID</TableHead>
                    <TableHead className="text-blue-900">Tên khuyến mãi</TableHead>
                    <TableHead className="text-blue-900">Loại</TableHead>
                    <TableHead className="text-blue-900">Giá trị</TableHead>
                    <TableHead className="text-blue-900">Ngày bắt đầu</TableHead>
                    <TableHead className="text-blue-900">Ngày kết thúc</TableHead>
                    <TableHead className="text-right text-blue-900">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromotions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                        Không tìm thấy khuyến mãi
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPromotions.map((promo) => (
                      <TableRow key={promo.id} className="hover:bg-blue-50">
                        <TableCell>KM{promo.id.toString().padStart(3, '0')}</TableCell>
                        <TableCell>{promo.name}</TableCell>
                        <TableCell>
                          <span
                            className={`rounded px-2 py-1 text-sm ${
                              promo.promotionType === PromotionType.PERCENTAGE
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {promo.promotionType === PromotionType.PERCENTAGE
                              ? 'Phần trăm'
                              : 'Cố định'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {promo.promotionType === PromotionType.PERCENTAGE
                            ? `${promo.value}%`
                            : `${promo.value.toLocaleString('vi-VN')}đ`}
                        </TableCell>
                        <TableCell>{formatDate(promo.startedAt)}</TableCell>
                        <TableCell>{formatDate(promo.endedAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(promo)}
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(promo.id, promo.name)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="max-h-[90vh] max-w-2xl overflow-y-auto border-blue-200"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="text-blue-900">
              {editingPromotion ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editingPromotion
                ? 'Cập nhật thông tin khuyến mãi hiện tại'
                : 'Tạo một khuyến mãi mới'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pr-2">
            {/* Added padding-right for scrollbar */}
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, promotionType: value as PromotionType })
                  }
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
                  {formData.promotionType === PromotionType.PERCENTAGE
                    ? 'Giá trị (%)'
                    : 'Giá trị (VNĐ)'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0
                    const maxVal =
                      formData.promotionType === PromotionType.PERCENTAGE ? 100 : Infinity
                    setFormData({ ...formData, value: Math.min(val, maxVal) })
                  }}
                  className="border-blue-200"
                  min="0"
                  max={formData.promotionType === PromotionType.PERCENTAGE ? '100' : undefined}
                />
                {formData.promotionType === PromotionType.PERCENTAGE && formData.value > 100 && (
                  <p className="text-xs text-red-600">Tối đa 100%</p>
                )}
              </div>
            </div>

            {/* Selected Products Section */}
            <div className="space-y-2">
              <Label>Sản phẩm áp dụng</Label>
              {formData.selectedProducts.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {formData.selectedProducts.map((productId) => {
                    const product = products.find((p) => p.id === productId)
                    if (!product) return null
                    return (
                      <Badge key={productId} variant="secondary" className="gap-1">
                        {product.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeProduct(productId)}
                        />
                      </Badge>
                    )
                  })}
                </div>
              )}

              {/* Search box for products */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="border-blue-200 pl-9"
                />
              </div>

              <div className="max-h-40 overflow-y-auto rounded border border-blue-200 p-3">
                {products.length === 0 ? (
                  <p className="text-center text-gray-500">Đang tải sản phẩm...</p>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-center text-gray-500">Không tìm thấy sản phẩm</p>
                ) : (
                  <div className="space-y-2">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-2 rounded p-2 hover:bg-blue-50"
                      >
                        <Checkbox
                          id={`product-${product.id}`}
                          checked={formData.selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleProduct(product.id)}
                        />
                        <label
                          htmlFor={`product-${product.id}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            Mã: {product.barcode} | Giá: {product.price.toLocaleString('vi-VN')}đ
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                {formData.startedAt &&
                  formData.endedAt &&
                  new Date(formData.startedAt) >= new Date(formData.endedAt) && (
                    <p className="text-xs text-red-600">Ngày bắt đầu phải nhỏ hơn ngày kết thúc</p>
                  )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-blue-200"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa khuyến mãi "${deleteConfirm.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDelete}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  )
}
