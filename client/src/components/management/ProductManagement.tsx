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

enum ProductUnit {
  CAN = 'CAN',
  BOTTLE = 'BOTTLE',
  PACKAGE = 'PACKAGE',
  BOX = 'BOX',
  PIECE = 'PIECE',
}

interface Product {
  id: number
  name: string
  price: number
  unit: ProductUnit
  barcode: number
}

interface ApiResponse {
  status: string
  data: {
    products: Product[]
  }
}

const unitLabels: Record<ProductUnit, string> = {
  [ProductUnit.CAN]: 'Lon',
  [ProductUnit.BOTTLE]: 'Chai',
  [ProductUnit.PACKAGE]: 'Gói',
  [ProductUnit.BOX]: 'Hộp',
  [ProductUnit.PIECE]: 'Cái',
}

const API_BASE_URL = 'https://your-api-url.com/api' // Thay đổi URL này

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number; name: string }>({
    open: false,
    id: 0,
    name: '',
  })
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    unit: ProductUnit.BOTTLE,
    barcode: 0,
  })

  // Fetch products from API
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get<Product[]>(`/products`)
      console.log(response)

      setProducts(response.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toString().includes(searchTerm)
  )

  const handleAdd = () => {
    setEditingProduct(null)
    setFormData({ name: '', price: 0, unit: ProductUnit.BOTTLE, barcode: 0 })
    setIsDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price,
      unit: product.unit,
      barcode: product.barcode,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number, name: string) => {
    setDeleteConfirm({ open: true, id, name })
  }

  const confirmDelete = async () => {
    try {
      await fetch(`${API_BASE_URL}/products/${deleteConfirm.id}`, {
        method: 'DELETE',
      })
      setProducts(products.filter((product) => product.id !== deleteConfirm.id))
      setDeleteConfirm({ open: false, id: 0, name: '' })
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên sản phẩm')
      return
    }
    if (formData.price <= 0) {
      alert('Giá phải lớn hơn 0')
      return
    }
    if (!formData.barcode || formData.barcode.toString().length < 8) {
      alert('Mã vạch phải hợp lệ (ít nhất 8 số)')
      return
    }

    try {
      if (editingProduct) {
        // Update existing product
        const response = await fetch(`${API_BASE_URL}/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            price: formData.price,
            unit: formData.unit,
            barcode: formData.barcode,
          }),
        })
        const result = await response.json()
        if (result.status === 'success') {
          setProducts(
            products.map((product) => (product.id === editingProduct.id ? result.data : product))
          )
        }
      } else {
        // Create new product
        const response = await apiClient.get<Product[]>(`/products`)
        setProducts(response)
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <CardTitle className="text-2xl text-white">Quản lý sản phẩm</CardTitle>
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
                <table className="w-full">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-blue-900">ID</th>
                      <th className="p-4 text-left font-semibold text-blue-900">Mã vạch</th>
                      <th className="p-4 text-left font-semibold text-blue-900">Tên sản phẩm</th>
                      <th className="p-4 text-left font-semibold text-blue-900">Đơn vị</th>
                      <th className="p-4 text-left font-semibold text-blue-900">Giá bán</th>
                      <th className="p-4 text-right font-semibold text-blue-900">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-t border-blue-100 hover:bg-blue-50">
                        <td className="p-4 font-medium">{product.id}</td>
                        <td className="p-4 font-mono text-blue-600">{product.barcode}</td>
                        <td className="p-4 font-medium">{product.name}</td>
                        <td className="p-4">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                            {unitLabels[product.unit]}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-blue-700">
                          {product.price.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="mr-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="border-blue-200">
            <DialogHeader>
              <DialogTitle className="text-xl text-blue-900">
                {editingProduct ? 'Sửa thông tin sản phẩm' : 'Thêm sản phẩm mới'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {editingProduct
                  ? 'Cập nhật thông tin sản phẩm.'
                  : 'Tạo sản phẩm mới trong hệ thống.'}
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
                  <Label htmlFor="price" className="text-sm font-medium">
                    Giá bán (VNĐ) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                    }
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
                    onValueChange={(value) =>
                      setFormData({ ...formData, unit: value as ProductUnit })
                    }
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
                <Save className="mr-2 h-4 w-4" />
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
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
    </div>
  )
}
