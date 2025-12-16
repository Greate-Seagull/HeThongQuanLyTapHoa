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
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  condition: string | null
  value: number
  promotionType: PromotionType
}

interface ApiResponse {
  status: string
  data: Promotion[]
}

export function PromotionManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    condition: '',
    value: 0,
    promotionType: PromotionType.PERCENTAGE,
  })

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<ApiResponse>('/promotions')
      setPromotions(response)
      setError(null)
    } catch (err) {
      setError('Không thể tải dữ liệu khuyến mãi')
      console.error('Error fetching promotions:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredPromotions = promotions.filter((promo) =>
    promo.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setEditingPromotion(null)
    setFormData({
      name: '',
      description: '',
      startedAt: '',
      endedAt: '',
      condition: '',
      value: 0,
      promotionType: PromotionType.PERCENTAGE,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    const startDate = new Date(promotion.startedAt).toISOString().split('T')[0]
    const endDate = new Date(promotion.endedAt).toISOString().split('T')[0]

    setFormData({
      name: promotion.name,
      description: promotion.description || '',
      startedAt: startDate,
      endedAt: endDate,
      condition: promotion.condition || '',
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
      // TODO: Call DELETE API here
      const data = await apiClient.delete(`/promotions/${deleteConfirm.id}`)
      if (data) {
        toast.success('Khuyến mãi đã được xóa thành công')
        fetchPromotions()
        setDeleteConfirm({ open: false, id: 0, name: '' })
      }
      // Optimistic update
    } catch (err) {
      console.error('Error deleting promotion:', err)
      alert('Không thể xóa khuyến mãi')
    }
  }

  const handleSave = async () => {
    try {
      const promotionData = {
        name: formData.name,
        description: formData.description || null,
        startedAt: new Date(formData.startedAt).toISOString(),
        endedAt: new Date(formData.endedAt).toISOString(),
        condition: formData.condition || null,
        value: formData.value,
        promotionType: formData.promotionType,
      }

      if (editingPromotion) {
        // TODO: Call PUT/PATCH API here
        const response = await apiClient.put<Promotion>(
          `/promotions/${editingPromotion.id}`,
          promotionData
        )
        if (response) {
          toast.success('Khuyến mãi đã được cập nhật thành công')
          fetchPromotions()
        }
      } else {
        // TODO: Call POST API here
        const response = await apiClient.post<Promotion>('/promotions', promotionData)
        if (response) {
          toast.success('Khuyến mãi đã được tạo thành công')
          fetchPromotions()
        }
      }

      setIsDialogOpen(false)
    } catch (err) {
      console.error('Error saving promotion:', err)
      alert('Không thể lưu khuyến mãi')
    }
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
        <DialogContent className="max-w-2xl border-blue-200" aria-describedby={undefined}>
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
                  onChange={(e) =>
                    setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })
                  }
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
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-blue-200"
            >
              Hủy
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Lưu
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
