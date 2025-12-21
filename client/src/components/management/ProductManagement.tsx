import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Search, Save, X, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiClient } from '@/services/api-client'
import { toast } from 'sonner'

enum ProductUnit {
  CAN = 'CAN',
  BOTTLE = 'BOTTLE',
  PACKAGE = 'PACKAGE',
  BOX = 'BOX',
  PIECE = 'PIECE',
}

interface Category {
  id: number
  name: string
  description: string
  _count?: {
    products: number
  }
}

interface Supplier {
  id: number
  name: string
  address: string
  phoneNumber: string
  _count?: {
    products: number
  }
}

interface Product {
  id: number
  name: string
  price: number
  amount: number
  unit: ProductUnit
  barcode: number
  categoryId: number
  supplierId: number
  category: {
    id: number
    name: string
  }
  supplier: {
    id: number
    name: string
  }
}

const unitLabels: Record<ProductUnit, string> = {
  [ProductUnit.CAN]: 'Lon',
  [ProductUnit.BOTTLE]: 'Chai',
  [ProductUnit.PACKAGE]: 'Gói',
  [ProductUnit.BOX]: 'Hộp',
  [ProductUnit.PIECE]: 'Cái',
}

const API_BASE_URL = 'https://your-api-url.com/api'

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number; name: string }>({
    open: false,
    id: 0,
    name: '',
  })
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    amount: 0,
    unit: ProductUnit.BOTTLE,
    barcode: 0,
    categoryId: 0,
    supplierId: 0,
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchSuppliers()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get<{ products: Product[] }>('/products')
      setProducts(response.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get<{ categories: Category[] }>('/product-categories')
      setCategories(response.categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await apiClient.get<{ suppliers: Supplier[] }>('/suppliers')
      console.log(response.suppliers)

      setSuppliers(response.suppliers)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.toString().includes(searchTerm)
    )
    .sort((a, b) => b.id - a.id)

  const handleAdd = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      price: 0,
      amount: 0,
      unit: ProductUnit.BOTTLE,
      barcode: 0,
      categoryId: categories[0]?.id || 0,
      supplierId: suppliers[0]?.id || 0,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price,
      amount: product.amount,
      unit: product.unit,
      barcode: product.barcode,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number, name: string) => {
    setDeleteConfirm({ open: true, id, name })
  }

  const confirmDelete = async () => {
    // 1. Tìm sản phẩm để kiểm tra thông tin
    const product = products.find((p) => p.id === deleteConfirm.id)

    // 2. Kiểm tra tồn kho (Nếu > 0 tức là đã nhập hàng và còn hàng -> Chặn xóa)
    if (product && product.amount > 0) {
      toast.error(
        `Không thể xóa sản phẩm "${product.name}" vì còn tồn kho (${product.amount} ${unitLabels[product.unit]}).`
      )
      setDeleteConfirm({ open: false, id: 0, name: '' })
      return
    }

    try {
      const data = await apiClient.delete(`/products/${deleteConfirm.id}`)
      if (data) {
        setDeleteConfirm({ open: false, id: 0, name: '' })
        toast.success('Sản phẩm đã được xóa thành công')
        fetchProducts()
      }
    } catch (error) {
      // 3. Xử lý trường hợp amount = 0 nhưng đã từng có giao dịch (nhập/xuất)
      // Backend sẽ trả về lỗi FK constraint
      toast.error('Không thể xóa sản phẩm này vì đã có lịch sử nhập hàng hoặc hóa đơn.')
      console.error('Error deleting product:', error)
      setDeleteConfirm({ open: false, id: 0, name: '' })
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm')
      return
    }
    if (formData.price <= 0) {
      toast.error('Giá phải lớn hơn 0')
      return
    }
    if (!formData.barcode || formData.barcode.toString().length < 8) {
      toast.error('Mã vạch phải hợp lệ (ít nhất 8 số)')
      return
    }
    if (!formData.categoryId || formData.categoryId === 0) {
      toast.error('Vui lòng chọn danh mục')
      return
    }
    if (!formData.supplierId || formData.supplierId === 0) {
      toast.error('Vui lòng chọn nhà cung cấp')
      return
    }

    setIsSaving(true)
    try {
      if (editingProduct) {
        const response = await apiClient.put<Product>(`/products`, {
          id: editingProduct.id,
          name: formData.name,
          price: formData.price,
          amount: formData.amount,
          unit: formData.unit,
          barcode: formData.barcode,
          categoryId: formData.categoryId,
          supplierId: formData.supplierId,
        })
        if (response) {
          setIsDialogOpen(false)
          toast.success('Sản phẩm đã được cập nhật thành công')
          await fetchProducts()
        }
      } else {
        const response = await apiClient.post<Product>('/products', {
          name: formData.name,
          price: formData.price,
          amount: 0,
          unit: formData.unit,
          barcode: formData.barcode,
          categoryId: formData.categoryId,
          supplierId: formData.supplierId,
        })
        if (response) {
          setIsDialogOpen(false)
          toast.success('Sản phẩm đã được tạo thành công')
          await fetchProducts()
        }
      }
    } catch (error: any) {
      if (
        error?.message?.includes('barcode') ||
        error?.message?.includes('unique') ||
        error?.message?.includes('duplicate')
      ) {
        toast.error('Mã vạch đã tồn tại trong hệ thống')
      } else {
        toast.error('Mã vạch đã tồn tại trong hệ thống')
      }
      console.error('Error saving product:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-900">Quản lý Sản Phẩm</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex max-w-md flex-1 gap-2">
              <Input
                placeholder="Tìm kiếm theo tên hoặc mã vạch..."
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
              Thêm sản phẩm
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-blue-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead className="text-blue-900">ID</TableHead>
                    <TableHead className="text-blue-900">Mã vạch</TableHead>
                    <TableHead className="text-blue-900">Tên sản phẩm</TableHead>
                    <TableHead className="text-blue-900">Danh mục</TableHead>
                    <TableHead className="text-blue-900">Nhà cung cấp</TableHead>
                    <TableHead className="text-blue-900">Đơn vị</TableHead>
                    <TableHead className="text-blue-900">Giá bán</TableHead>
                    <TableHead className="text-blue-900">Số lượng</TableHead>
                    <TableHead className="text-right text-blue-900">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8 text-center text-gray-500">
                        Không tìm thấy sản phẩm
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-blue-50">
                        <TableCell className="font-medium">{`SP${product.id.toString().padStart(3, '0')}`}</TableCell>
                        <TableCell className="font-mono text-blue-600">{product.barcode}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {product.category?.name ?? 'Chưa phân loại'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {product.supplier?.name ?? 'Chưa có nhà cung cấp'}
                        </TableCell>
                        <TableCell>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                            {unitLabels[product.unit]}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-blue-700">
                          {product.price.toLocaleString('vi-VN')}đ
                        </TableCell>
                        <TableCell>{product.amount}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id, product.name)}
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
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-blue-200">
          <DialogHeader>
            <DialogTitle className=" text-blue-900">
              {editingProduct ? 'Sửa thông tin sản phẩm' : 'Thêm sản phẩm mới'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editingProduct ? 'Cập nhật thông tin sản phẩm.' : 'Tạo sản phẩm mới trong hệ thống.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Tên sản phẩm *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-blue-200"
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode" className="text-sm font-medium">
                Mã vạch *
              </Label>
              <Input
                id="barcode"
                type="number"
                value={formData.barcode || ''}
                onChange={(e) =>
                  setFormData({ ...formData, barcode: parseInt(e.target.value) || 0 })
                }
                className="border-blue-200"
                placeholder="Nhập mã vạch"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Danh mục *
                </Label>
                <Select
                  value={formData.categoryId != null ? formData.categoryId.toString() : ''}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: parseInt(value) })
                  }
                >
                  <SelectTrigger className="border-blue-200">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-sm font-medium">
                  Nhà cung cấp *
                </Label>
                <Select
                  value={formData.supplierId != null ? formData.supplierId.toString() : ''}
                  onValueChange={(value) =>
                    setFormData({ ...formData, supplierId: parseInt(value) })
                  }
                >
                  <SelectTrigger className="border-blue-200">
                    <SelectValue placeholder="Chọn nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        <span className="block max-w-[200px] truncate" title={supplier.name}>
                          {supplier.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Giá bán (VNĐ) *
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className="border-blue-200"
                placeholder="Nhập giá bán"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-sm font-medium">
                Đơn vị tính *
              </Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value as ProductUnit })}
              >
                <SelectTrigger className="border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProductUnit.BOTTLE}>Chai</SelectItem>
                  <SelectItem value={ProductUnit.CAN}>Lon</SelectItem>
                  <SelectItem value={ProductUnit.PACKAGE}>Gói</SelectItem>
                  <SelectItem value={ProductUnit.BOX}>Hộp</SelectItem>
                  <SelectItem value={ProductUnit.PIECE}>Cái</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-blue-200"
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm "{deleteConfirm.name}"? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm({ open: false, id: 0, name: '' })}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
