'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Edit, Trash2, Search, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import {
  getProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  ProductCategory,
  CreateProductCategoryRequest,
  UpdateProductCategoryRequest,
} from '@/services/product-category.service'

export function ProductCategoryManagement() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number; name: string }>({
    open: false,
    id: 0,
    name: '',
  })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  // Load categories on mount
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const data = await getProductCategories()
      setCategories(data)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCategories = categories
    .filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const handleOpenDialog = (category?: ProductCategory) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || '',
      })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', description: '' })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên loại sản phẩm')
      return
    }

    try {
      setIsLoading(true)

      if (editingCategory) {
        // Update existing category
        const updateData: UpdateProductCategoryRequest = {
          id: editingCategory.id,
          name: formData.name,
          description: formData.description || undefined,
        }
        await updateProductCategory(updateData)
        toast.success('Cập nhật loại sản phẩm thành công!')
      } else {
        // Create new category
        const createData: CreateProductCategoryRequest = {
          name: formData.name,
          description: formData.description || undefined,
        }
        await createProductCategory(createData)
        toast.success('Thêm loại sản phẩm thành công!')
      }

      handleCloseDialog()
      loadCategories()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    setDeleteConfirm({ open: true, id, name })
  }

  const confirmDelete = async () => {
    // 1. Tìm loại sản phẩm đang chọn xoá
    const category = categories.find((c) => c.id === deleteConfirm.id)

    // 2. Kiểm tra ràng buộc
    if (category && category._count && category._count.products > 0) {
      toast.error(
        `Không thể xóa loại sản phẩm "${category.name}" vì đang có ${category._count.products} sản phẩm.`
      )
      setDeleteConfirm({ ...deleteConfirm, open: false }) // Đóng dialog
      return
    }

    try {
      setIsLoading(true)
      await deleteProductCategory(deleteConfirm.id)
      toast.success('Xóa loại sản phẩm thành công!')
      loadCategories()
    } catch (error: any) {
      // Xử lý lỗi từ backend (nếu có ràng buộc khác mà frontend chưa check hết)
      toast.error('Không thể xóa loại sản phẩm này vì đã có dữ liệu liên quan.')
    } finally {
      setIsLoading(false)
      setDeleteConfirm({ ...deleteConfirm, open: false })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-900">Quản Lý Loại Sản Phẩm</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex max-w-md flex-1 gap-2">
              <Input
                placeholder="Tìm kiếm theo tên loại sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-blue-200"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Thêm Loại Sản Phẩm
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-blue-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>Tên Loại</TableHead>
                  <TableHead>Mô Tả</TableHead>
                  <TableHead className="text-center">Số Sản Phẩm</TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                      Không tìm thấy loại sản phẩm nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.id}</TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {category.description || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {category._count?.products || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(category)}
                          disabled={isLoading}
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id, category.name)}
                          disabled={isLoading}
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
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Cập Nhật Loại Sản Phẩm' : 'Thêm Loại Sản Phẩm Mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên Loại Sản Phẩm *</Label>
              <Input
                id="name"
                placeholder="Nhập tên loại sản phẩm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô Tả</Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isLoading}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : editingCategory ? 'Cập Nhật' : 'Thêm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Xác nhận xóa"
        description={`Bạn có chắc muốn xóa loại sản phẩm "${deleteConfirm.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDelete}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  )
}
