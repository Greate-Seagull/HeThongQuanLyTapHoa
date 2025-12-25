'use client'

import { useState, useEffect, useRef } from 'react'
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
  ShoppingCart,
  Receipt,
  Check,
  ChevronsUpDown,
  Printer,
  Tag,
  User,
  Loader2,
  Loader,
} from 'lucide-react'
import html2canvas from 'html2canvas'
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
import { getInvoices, getInvoiceById, createInvoice } from '@/services/invoice.service'
import { apiClient } from '@/services/api-client'
import { getPromotionsForProduct } from '@/services/promotion.service'

// Enums và Types cho Invoice Management
import { PromotionType, Promotion } from '@/types'

interface Customer {
  id: number
  name: string
  phone: string
  loyaltyPoints: number
}

interface InvoiceDetail {
  id: number
  productId: number
  product: Product
  quantity: number
  promotionId: number | null
  promotion: Promotion | null
}

interface Invoice {
  id: number
  employeeId: number
  employee: Employee
  customerId: number | null
  customer: Customer | null
  pointsUsed: number
  pointsDiscount: number
  subtotal: number
  totalDiscount: number
  total: number
  createdAt: Date
  details: InvoiceDetail[]
}

interface InvoiceManagementProps {
  currentUser?: { id: number; position: string }
}

export function InvoiceManagement({ currentUser }: InvoiceManagementProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  const invoiceContentRef = useRef<HTMLDivElement>(null)

  // Form state
  const [productBarcode, setProductBarcode] = useState('')
  const [searchedProduct, setSearchedProduct] = useState<Product | null>(null)
  const [bestPromotion, setBestPromotion] = useState<Promotion | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [cart, setCart] = useState<InvoiceDetail[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0)
  const [pointsToUse, setPointsToUse] = useState<number>(0)
  const [openCustomerCombobox, setOpenCustomerCombobox] = useState(false)
  const [openProductCombobox, setOpenProductCombobox] = useState(false)

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  const filteredInvoices = invoices.filter((invoice) => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return true
    // Tìm theo mã hóa đơn (id hoặc mã HDxxx), tên nhân viên, tên khách hàng, số điện thoại khách hàng
    const idMatch = invoice.id.toString().includes(term)
    // Hỗ trợ tìm theo mã hóa đơn dạng HD001, HD002...
    const code = `hd${invoice.id.toString().padStart(3, '0')}`
    const codeMatch = code.includes(term)
    const employeeMatch = invoice.employee?.name?.toLowerCase().includes(term)
    const customerNameMatch = invoice.customer?.name?.toLowerCase().includes(term)
    const customerPhoneMatch = invoice.customer?.phone?.toLowerCase().includes(term)
    return idMatch || codeMatch || employeeMatch || customerNameMatch || customerPhoneMatch
  })

  // Tính giảm giá dựa trên promotion và giá sản phẩm
  const calculateDiscountAmount = (promotion: Promotion, price: number): number => {
    if (promotion.promotionType === PromotionType.PERCENTAGE) {
      return (price * promotion.value) / 100
    } else {
      return promotion.value
    }
  }

  const handleSearchProduct = async () => {
    if (!productBarcode) {
      toast.error('Vui lòng nhập mã hàng hóa hoặc tên sản phẩm')
      return
    }

    // Tìm theo barcode hoặc tên sản phẩm
    const product = products.find(
      (p) =>
        p.barcode.toString() === productBarcode ||
        (p.name && p.name.toLowerCase().includes(productBarcode.toLowerCase()))
    )

    if (!product) {
      toast.error('Không tìm thấy sản phẩm')
      setSearchedProduct(null)
      setBestPromotion(null)
      return
    }

    // Tìm khuyến mãi tốt nhất qua API
    setBestPromotion(null)
    setSearchedProduct(product)
    setQuantity(1)
    try {
      const promotions = await getPromotionsForProduct(product.id)
      const now = new Date()
      const validPromotions = promotions.filter(
        (p) => new Date(p.startedAt) <= now && new Date(p.endedAt) >= now
      )
      // Chọn khuyến mãi có giá trị giảm cao nhất
      const best = validPromotions.reduce((prev, curr) => {
        const prevDiscount =
          prev.promotionType === PromotionType.PERCENTAGE ? prev.value : prev.value
        const currDiscount =
          curr.promotionType === PromotionType.PERCENTAGE ? curr.value : curr.value
        return currDiscount > prevDiscount ? curr : prev
      }, validPromotions[0])
      setBestPromotion(best || null)
      if (best) {
        toast.success(`Tìm thấy: ${product.name}`, {
          description: `Khuyến mãi: ${best.name} - Giảm ${best.promotionType === PromotionType.PERCENTAGE ? best.value + '%' : best.value.toLocaleString('vi-VN') + 'đ'}`,
        })
      } else {
        toast.success(`Tìm thấy: ${product.name}`, {
          description: 'Không có khuyến mãi',
        })
      }
    } catch (err) {
      toast.success(`Tìm thấy: ${product.name}`, {
        description: 'Không thể kiểm tra khuyến mãi',
      })
    }
  }

  const handleAddToCart = async () => {
    if (!searchedProduct) {
      toast.error('Vui lòng tìm kiếm sản phẩm trước')
      return
    }
    if (quantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0')
      return
    }
    // Kiểm tra đã có trong giỏ chưa
    const existingItem = cart.find((item) => item.productId === searchedProduct.id)
    if (existingItem) {
      toast.error('Sản phẩm đã có trong giỏ hàng')
      return
    }
    // Tự động tìm khuyến mãi tốt nhất mỗi lần thêm qua API
    let promotion: Promotion | null = null
    try {
      const promotions = await getPromotionsForProduct(searchedProduct.id)
      const now = new Date()
      const validPromotions = promotions.filter(
        (p) => new Date(p.startedAt) <= now && new Date(p.endedAt) >= now
      )
      promotion = validPromotions.reduce((prev, curr) => {
        const prevDiscount =
          prev.promotionType === PromotionType.PERCENTAGE ? prev.value : prev.value
        const currDiscount =
          curr.promotionType === PromotionType.PERCENTAGE ? curr.value : curr.value
        return currDiscount > prevDiscount ? curr : prev
      }, validPromotions[0])
    } catch {}
    const newDetail: InvoiceDetail = {
      id: cart.length + 1,
      productId: searchedProduct.id,
      product: searchedProduct,
      quantity,
      promotionId: promotion?.id || null,
      promotion: promotion || null,
    }
    setCart([...cart, newDetail])
    // Reset form
    setSearchedProduct(null)
    setBestPromotion(null)
    setProductBarcode('')
    setQuantity(1)
    toast.success(`Đã thêm ${searchedProduct.name} vào giỏ hàng`)
  }

  const handleRemoveFromCart = (detailId: number) => {
    setCart(cart.filter((item) => item.id !== detailId))
    toast.info('Đã xóa khỏi giỏ hàng')
  }

  // Tính toán lại chỉ dựa vào product.price và promotion
  const calculateSubtotal = (): number => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }

  const calculateTotalDiscount = (): number => {
    return cart.reduce((sum, item) => {
      if (item.promotion) {
        return sum + calculateDiscountAmount(item.promotion, item.product.price) * item.quantity
      }
      return sum
    }, 0)
  }

  const calculatePointsDiscount = (): number => {
    return pointsToUse
  }

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal()
    const promotionDiscount = calculateTotalDiscount()
    const pointsDiscount = calculatePointsDiscount()
    return subtotal - promotionDiscount - pointsDiscount
  }

  // Fetch data từ API khi mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [productsData, customersData, invoicesData] = await Promise.all([
          apiClient.get('/products'),
          apiClient.get('/accounts'),
          getInvoices(),
        ])
        console.log(productsData)

        setProducts(Array.isArray(productsData?.products) ? productsData?.products : [])
        setCustomers(
          Array.isArray(customersData)
            ? customersData.map((c: any) => ({
                id: c.user?.id || c.id,
                name: c.user?.name || '',
                phone: c.phoneNumber || '',
                loyaltyPoints: c.user?.point || 0,
              }))
            : []
        )
        setInvoices(
          (invoicesData as any[]).map((inv) => ({
            id: inv.id,
            employeeId: inv.employeeId,
            employee: inv.employee,
            customerId: inv.userId ?? null,
            customer: inv.user
              ? {
                  id: inv.user.id,
                  name: inv.user.name,
                  phone: inv.user.phone ?? '',
                  loyaltyPoints: inv.user.loyaltyPoints ?? 0,
                }
              : null,
            pointsUsed: inv.pointsUsed ?? inv.usedPoint ?? 0,
            pointsDiscount: inv.pointsDiscount ?? 0,
            subtotal: inv.subtotal ?? 0,
            totalDiscount: inv.totalDiscount ?? 0,
            total: inv.total ?? 0,
            createdAt: new Date(inv.createdAt),
            details: Array.isArray(inv.invoiceDetails)
              ? inv.invoiceDetails.map((d: any) => ({
                  id: d.id ?? 0,
                  productId: d.productId,
                  product: d.product,
                  quantity: d.quantity,
                  price: d.price ?? 0,
                  promotionId: d.promotionId ?? null,
                  promotion: d.promotion ?? null,
                  discountAmount: d.discountAmount ?? 0,
                  finalPrice: d.finalPrice ?? 0,
                }))
              : [],
          }))
        )
      } catch (err: any) {
        toast.error('Lỗi tải dữ liệu hóa đơn')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleCancelCheckout = () => {
    setIsCreatingInvoice(false)
    setCart([])
    setSelectedCustomerId(0)
    setPointsToUse(0)
    setProductBarcode('')
    setSearchedProduct(null)
    setBestPromotion(null)
    setQuantity(1)
  }

  const handleConfirmPayment = async () => {
    if (!currentUser) {
      toast.error('Không tìm thấy thông tin nhân viên')
      return
    }
    // if (currentUser.position !== 'SALES') {
    //   toast.error('Chỉ nhân viên "Bán hàng" mới có quyền thanh toán')
    //   return
    // }
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống')
      return
    }
    // Validate điểm sử dụng
    if (selectedCustomer && pointsToUse > selectedCustomer.loyaltyPoints) {
      toast.error('Số điểm sử dụng vượt quá điểm tích lũy của khách hàng')
      return
    }
    setLoading(true)
    try {
      const invoiceData = {
        userId: selectedCustomerId || null,
        usedPoint: pointsToUse,
        items: cart.map((item) => ({
          // ← SỬA: Đổi thành "items"
          productId: item.productId,
          quantity: item.quantity,
          promotionId: item.promotionId,
        })),
      }
      await createInvoice(invoiceData)
      toast.success('Thanh toán thành công!')

      const invoicesData = await getInvoices()
      setInvoices(
        (invoicesData as any[]).map((inv) => ({
          id: inv.id,
          employeeId: inv.employeeId,
          employee: inv.employee,
          customerId: inv.userId ?? null,
          customer: inv.user
            ? {
                id: inv.user.id,
                name: inv.user.name,
                phone: inv.user.phone ?? '',
                loyaltyPoints: inv.user.loyaltyPoints ?? 0,
              }
            : null,
          pointsUsed: inv.pointsUsed ?? inv.usedPoint ?? 0,
          pointsDiscount: inv.pointsDiscount ?? 0,
          subtotal: inv.subtotal ?? 0,
          totalDiscount: inv.totalDiscount ?? 0,
          total: inv.total ?? 0,
          createdAt: new Date(inv.createdAt),
          details: Array.isArray(inv.invoiceDetails)
            ? inv.invoiceDetails.map((d: any) => ({
                id: d.id ?? 0,
                productId: d.productId,
                product: d.product,
                quantity: d.quantity,
                price: d.price ?? 0,
                promotionId: d.promotionId ?? null,
                promotion: d.promotion ?? null,
                discountAmount: d.discountAmount ?? 0,
                finalPrice: d.finalPrice ?? 0,
              }))
            : [],
        }))
      )
      setIsCreatingInvoice(false)
      setCart([])
      setSelectedCustomerId(0)
      setPointsToUse(0)
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tạo hóa đơn')
    } finally {
      setLoading(false)
    }
  }

  // Xem chi tiết hóa đơn từ API (không dùng price, discountAmount, finalPrice từ backend)
  const handleViewInvoice = async (invoiceId: number) => {
    setLoading(true)
    try {
      const detail = await getInvoiceById(invoiceId)
      setCurrentInvoice({
        id: detail.id,
        employeeId: detail.employeeId,
        employee: detail.employee ?? { id: 0, name: 'N/A', position: EmployeePosition.SALES },
        customerId: detail.userId ?? null,
        customer: detail.user
          ? {
              id: detail.user.id,
              name: detail.user.name,
              phone: '',
              loyaltyPoints: 0,
            }
          : null,
        pointsUsed: detail.usedPoint ?? 0,
        pointsDiscount: 0,
        subtotal: Array.isArray(detail.invoiceDetails)
          ? detail.invoiceDetails.reduce((sum, d) => {
              const price = d.product?.price || 0
              const qty = typeof d.quantity === 'number' ? d.quantity : 0
              return sum + price * qty
            }, 0)
          : 0,
        totalDiscount: Array.isArray(detail.invoiceDetails)
          ? detail.invoiceDetails.reduce((sum, d) => {
              if (d.promotion) {
                const discount = calculateDiscountAmount(d.promotion, d.product?.price || 0)
                const qty = typeof d.quantity === 'number' ? d.quantity : 0
                return sum + discount * qty
              }
              return sum
            }, 0)
          : 0,
        total: typeof detail.total === 'number' ? detail.total : 0,
        createdAt: new Date(detail.createdAt),
        details: Array.isArray(detail.invoiceDetails)
          ? detail.invoiceDetails.map((d: any) => ({
              id: d.id,
              productId: d.productId,
              product: d.product,
              quantity: d.quantity,
              promotionId: d.promotionId ?? null,
              promotion: d.promotion ?? null,
            }))
          : [],
      })
      setShowInvoiceDialog(true)
    } catch (err: any) {
      toast.error('Không thể tải chi tiết hóa đơn')
    } finally {
      setLoading(false)
    }
  }

  const handlePrintInvoice = async () => {
    if (!currentInvoice) return
    if (!invoiceContentRef.current) {
      toast.error('Không tìm thấy nội dung hóa đơn để in')
      return
    }
    try {
      const canvas = await html2canvas(invoiceContentRef.current, {
        backgroundColor: '#fff',
        scale: 2,
      })
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `HoaDon_HD${currentInvoice.id.toString().padStart(3, '0')}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Đã tải hình ảnh hóa đơn!', {
        description: `HD${currentInvoice.id.toString().padStart(3, '0')}`,
      })
    } catch (err) {
      toast.error('Lỗi khi tải hình ảnh hóa đơn')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-900">Quản Lý Hóa Đơn</CardTitle>
            {!isCreatingInvoice && (
              <Button
                onClick={() => setIsCreatingInvoice(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Thanh toán mới
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Checkout Screen */}
      { isCreatingInvoice && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Product Search & Cart */}
          <div className="space-y-6 lg:col-span-2">
            {/* Product Search */}
            <Card className="border-orange-200 bg-orange-50/30">
              <CardHeader className="bg-orange-100">
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Search className="h-5 w-5" />
                  Tìm kiếm hàng hóa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {/* Product Dropdown */}
                <div>
                  <Label htmlFor="product-select" className="mb-2 text-sm">
                    Chọn sản phẩm
                  </Label>
                  <Popover open={openProductCombobox} onOpenChange={setOpenProductCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openProductCombobox}
                        className="h-auto min-h-[40px] w-full justify-between border-orange-200"
                      >
                        {searchedProduct ? (
                          <div className="flex flex-col items-start text-left">
                            <span className="font-medium">{searchedProduct.name}</span>
                            <span className="text-xs text-gray-500">
                              Barcode: {searchedProduct.barcode} | Tồn: {searchedProduct.amount} |
                              Giá: {searchedProduct.price.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Chọn sản phẩm từ danh sách...</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0">
                      <Command>
                        <CommandInput placeholder="Tìm kiếm sản phẩm..." />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy sản phẩm</CommandEmpty>
                          <CommandGroup>
                            {products.map((product) => {
                              const isInCart = cart.some((item) => item.productId === product.id)
                              // Lấy khuyến mãi tốt nhất qua API (đồng bộ hóa với bestPromotion nếu đã chọn)
                              // Để tránh gọi API nhiều lần, chỉ hiển thị icon nếu bestPromotion trùng product
                              const promotion =
                                searchedProduct && searchedProduct.id === product.id
                                  ? bestPromotion
                                  : null
                              return (
                                <CommandItem
                                  key={product.id}
                                  value={`${product.name} ${product.barcode}`}
                                  onSelect={() => {
                                    if (isInCart) {
                                      toast.error('Sản phẩm đã có trong giỏ hàng')
                                      return
                                    }

                                    setSearchedProduct(product)
                                    setBestPromotion(promotion)
                                    setQuantity(1)
                                    setProductBarcode('')
                                    setOpenProductCombobox(false)

                                    if (promotion) {
                                      toast.success(`Đã chọn: ${product.name}`, {
                                        description: `Khuyến mãi: ${promotion.name}`,
                                      })
                                    } else {
                                      toast.success(`Đã chọn: ${product.name}`)
                                    }
                                  }}
                                  disabled={isInCart}
                                  className={isInCart ? 'cursor-not-allowed opacity-50' : ''}
                                >
                                  <div className="flex w-full items-center justify-between py-2">
                                    <div className="flex-1">
                                      <p className="font-medium">{product.name}</p>
                                      <p className="text-xs text-gray-500">
                                        Barcode: {product.barcode} | Tồn kho: {product.amount}
                                      </p>
                                    </div>
                                    <div className="ml-4 text-right">
                                      <p className="font-semibold text-orange-600">
                                        {product.price.toLocaleString('vi-VN')}đ
                                      </p>
                                      {promotion && (
                                        <p className="flex items-center gap-1 text-xs text-green-600">
                                          <Tag className="h-3 w-3" />
                                          KM
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Separator */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-orange-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-orange-50/30 px-2 text-gray-500">Hoặc</span>
                  </div>
                </div>

                {/* Barcode or Product Name Input */}
                <div>
                  <Label htmlFor="barcode-input" className="mb-2 text-sm">
                    Quét barcode hoặc nhập tên
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode-input"
                      placeholder="Nhập barcode hoặc tên sản phẩm..."
                      value={productBarcode}
                      onChange={(e) => setProductBarcode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearchProduct()
                        }
                      }}
                      className="border-orange-200"
                    />
                    <Button
                      onClick={handleSearchProduct}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
                {searchedProduct && (
                  <div className="space-y-3 rounded-lg border border-orange-200 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{searchedProduct.name}</h3>
                        <p className="text-sm text-gray-500">Barcode: {searchedProduct.barcode}</p>
                        <p className="text-sm text-gray-500">Tồn kho: {searchedProduct.amount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-orange-600">
                          {searchedProduct.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>

                    {/* Best Promotion */}
                    {bestPromotion && (
                      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                        <div className="mb-1 flex items-center gap-2 text-green-700">
                          <Tag className="h-4 w-4" />
                          <span className="font-semibold">{bestPromotion.name}</span>
                        </div>
                        <p className="text-sm text-green-600">
                          Giảm:{' '}
                          {bestPromotion.promotionType === PromotionType.PERCENTAGE
                            ? `${bestPromotion.value}%`
                            : `${bestPromotion.value.toLocaleString('vi-VN')}đ`}
                        </p>
                        <p className="text-sm text-green-600">
                          Giá sau giảm:{' '}
                          {(
                            searchedProduct.price -
                            calculateDiscountAmount(bestPromotion, searchedProduct.price)
                          ).toLocaleString('vi-VN')}
                          đ
                        </p>
                      </div>
                    )}

                    {/* Quantity & Add to Cart */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="quantity" className="text-sm">
                          Số lượng
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max={searchedProduct.amount}
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="border-orange-200"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={handleAddToCart}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Thêm vào giỏ
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shopping Cart */}
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <ShoppingCart className="h-5 w-5" />
                  Giỏ hàng ({cart.length} sản phẩm)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <ShoppingCart className="mx-auto mb-3 h-12 w-12 opacity-20" />
                    <p>Giỏ hàng trống</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-blue-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-blue-50">
                          <TableHead>Sản phẩm</TableHead>
                          <TableHead>SL</TableHead>
                          <TableHead>Đơn giá</TableHead>
                          <TableHead>Giảm giá</TableHead>
                          <TableHead>Thành tiền</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.product.name}</p>
                                {item.promotion && (
                                  <p className="flex items-center gap-1 text-xs text-green-600">
                                    <Tag className="h-3 w-3" />
                                    {item.promotion.name}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.product.price.toLocaleString('vi-VN')}đ</TableCell>
                            <TableCell className="text-green-600">
                              {item.promotion
                                ? `-${calculateDiscountAmount(item.promotion, item.product.price).toLocaleString('vi-VN')}đ`
                                : '-'}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {(
                                (item.product.price -
                                  (item.promotion
                                    ? calculateDiscountAmount(item.promotion, item.product.price)
                                    : 0)) *
                                item.quantity
                              ).toLocaleString('vi-VN')}
                              đ
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
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
          </div>

          {/* Right: Payment Summary */}
          <div className="space-y-6">
            {/* Customer Selection */}
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <User className="h-5 w-5" />
                  Khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                <Popover open={openCustomerCombobox} onOpenChange={setOpenCustomerCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCustomerCombobox}
                      className="w-full justify-between border-purple-200"
                    >
                      {selectedCustomer ? selectedCustomer.name : 'Khách lẻ'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Tìm kiếm khách hàng..." />
                      <CommandList>
                        <CommandEmpty>Không tìm thấy khách hàng</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="0"
                            onSelect={() => {
                              setSelectedCustomerId(0)
                              setPointsToUse(0)
                              setOpenCustomerCombobox(false)
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedCustomerId === 0 ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                            Khách lẻ
                          </CommandItem>
                          {customers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={customer.name}
                              onSelect={() => {
                                setSelectedCustomerId(customer.id)
                                setPointsToUse(0)
                                setOpenCustomerCombobox(false)
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedCustomerId === customer.id ? 'opacity-100' : 'opacity-0'
                                }`}
                              />
                              <div className="flex flex-col">
                                <span>{customer.name}</span>
                                <span className="text-xs text-gray-500">
                                  {customer.phone} - {customer.loyaltyPoints} điểm
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedCustomer && (
                  <div className="space-y-2 rounded-lg bg-purple-50 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Điểm tích lũy:</span>
                      <span className="font-semibold text-purple-700">
                        {selectedCustomer.loyaltyPoints} điểm
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="pointsToUse" className="text-sm">
                        Sử dụng điểm
                      </Label>
                      <Input
                        id="pointsToUse"
                        type="number"
                        min="0"
                        max={selectedCustomer.loyaltyPoints}
                        value={pointsToUse}
                        onChange={(e) =>
                          setPointsToUse(
                            Math.min(parseInt(e.target.value) || 0, selectedCustomer.loyaltyPoints)
                          )
                        }
                        className="border-purple-200"
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500">1 điểm = 1 VNĐ</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Receipt className="h-5 w-5" />
                  Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số sản phẩm:</span>
                    <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span>{calculateSubtotal().toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm giá KM:</span>
                    <span className="text-green-600">
                      -{calculateTotalDiscount().toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  {pointsToUse > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giảm điểm:</span>
                      <span className="text-purple-600">
                        -{calculatePointsDiscount().toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">
                      {calculateTotal().toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-3">
                  <Button
                    onClick={handleConfirmPayment}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60"
                    disabled={cart.length === 0 || loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <Loader className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
                      </span>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Xác nhận thanh toán
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelCheckout}
                    className="w-full border-gray-300"
                  >
                    Hủy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Invoice History */}
      {!isCreatingInvoice && (
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-900">Lịch Sử Hóa Đơn</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6 flex max-w-md gap-2">
              <Input
                placeholder="Tìm kiếm theo mã hóa đơn, nhân viên, khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-blue-200"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-500">
                <Loader2 className="mr-2 inline-block h-8 w-8 animate-spin" />
                Đang tải dữ liệu...
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Receipt className="mx-auto mb-3 h-12 w-12 opacity-20" />
                <p>Chưa có hóa đơn nào</p>
                <p className="text-sm">Nhấn "Thanh toán mới" để bắt đầu</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-blue-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="text-blue-900">Mã HD</TableHead>
                      <TableHead className="text-blue-900">Ngày</TableHead>
                      <TableHead className="text-blue-900">Nhân viên</TableHead>
                      <TableHead className="text-blue-900">Khách hàng</TableHead>
                      <TableHead className="text-blue-900">Số SP</TableHead>
                      <TableHead className="text-blue-900">Tổng tiền</TableHead>
                      <TableHead className="text-right text-blue-900">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-blue-50">
                        <TableCell className="font-medium">
                          HD{invoice.id.toString().padStart(3, '0')}
                        </TableCell>
                        <TableCell>{invoice.createdAt.toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{invoice.employee.name}</TableCell>
                        <TableCell>{invoice.customer?.name || 'Khách lẻ'}</TableCell>
                        <TableCell>
                          {Array.isArray(invoice.details) && invoice.details.length > 0
                            ? invoice.details.length
                            : Array.isArray((invoice as any).invoiceDetails)
                              ? (invoice as any).invoiceDetails.length
                              : 0}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {invoice.total.toLocaleString('vi-VN')}đ
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice.id)}
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Receipt className="h-4 w-4" />
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

      {/* Invoice Display Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent
          id="invoice-dialog-content"
          className="max-h-[90vh] max-w-2xl overflow-y-auto bg-white"
        >
          <DialogHeader>
            <DialogTitle>Hóa Đơn Bán Hàng</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Chi tiết hóa đơn bán hàng
            </DialogDescription>
          </DialogHeader>
          {currentInvoice && (
            <div
              ref={invoiceContentRef}
              className="mx-auto max-w-xl space-y-4 rounded-lg bg-white p-6 shadow"
            >
              {/* Invoice Header */}
              <div className="border-b pb-4 text-center">
                <h2 className="text-2xl font-bold">CỬA HÀNG ABC</h2>
                <p className="text-sm text-gray-600">123 Đường XYZ, Quận 1, TP.HCM</p>
                <p className="text-sm text-gray-600">Điện thoại: 0123456789</p>
              </div>

              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <span className="font-semibold">Mã hóa đơn:</span> HD
                    {currentInvoice.id.toString().padStart(3, '0')}
                  </p>
                  <p>
                    <span className="font-semibold">Ngày:</span>{' '}
                    {currentInvoice.createdAt.toLocaleString('vi-VN')}
                  </p>
                  <p>
                    <span className="font-semibold">Nhân viên:</span> {currentInvoice.employee.name}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold">Khách hàng:</span>{' '}
                    {currentInvoice.customer?.name || 'Khách lẻ'}
                  </p>
                  {currentInvoice.customer && (
                    <>
                      <p>
                        <span className="font-semibold">SĐT:</span> {currentInvoice.customer.phone}
                      </p>
                      <p>
                        <span className="font-semibold">Điểm sử dụng:</span>{' '}
                        {currentInvoice.pointsUsed}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Invoice Details */}
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-center">SL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentInvoice.details.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>{detail.product?.name || ''}</TableCell>
                        <TableCell className="text-center">{detail.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Invoice Summary */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between border-t pt-2 text-xl font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">
                    {currentInvoice.total.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-4 text-center text-sm text-gray-600">
                <p>Cảm ơn quý khách và hẹn gặp lại!</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
              Đóng
            </Button>
            <Button onClick={handlePrintInvoice} className="bg-blue-600 hover:bg-blue-700">
              <Printer className="mr-2 h-4 w-4" />
              In hóa đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
