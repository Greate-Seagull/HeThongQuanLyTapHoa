'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ProfilePage } from '@/components/ProfilePage'
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
import { Button } from '@/components/ui/button'
import { Award, Star, Receipt, Eye, ShoppingCart, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'
import { CustomerProfileContent } from '@/components/CustomerProfileContent'
import { apiClient } from '@/services/api-client'

// API Response Types
interface Product {
  id: number
  name: string
  barcode: number
  unit: string
}

interface Promotion {
  id: number
  name: string
  description: string
  startedAt: string
  endedAt: string
  condition: string
  value: number
  promotionType: 'PERCENTAGE' | 'FIXED'
}

interface InvoiceDetail {
  invoiceId: number
  productId: number
  quantity: number
  promotionId: number | null
  product: Product
  promotion?: Promotion
}

interface Invoice {
  id: number
  employeeId: number
  userId: number
  usedPoint: number
  total: number
  createdAt: string
  invoiceDetails: InvoiceDetail[]
}

interface ApiResponse {
  status: string
  data: Invoice[]
}

export default function CustomerDashboardPage() {
  const { user, login } = useAuthStore() as any
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)
  const [activeMenu, setActiveMenu] = useState('points')
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customerProfile, setCustomerProfile] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      // Nếu đã có user và đúng role -> OK
      if (user?.role === 'customer') {
        setIsLoading(false)
        return
      }

      // Nếu có user nhưng sai role -> Login
      if (user && user.role !== 'customer') {
        router.push('/auth/login')
        return
      }

      // Nếu chưa có user (F5), kiểm tra token
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/auth/login')
        return
      }

      // Có token, thử lấy lại thông tin user
      try {
        const response = await apiClient.get<any>('/accounts/profile')
        // Khôi phục state user
        const userData = {
          username: response.phoneNumber,
          role: 'customer',
          customerId: response.user.id,
        }
        login(userData, token)
        setIsLoading(false)
      } catch (error) {
        console.error('Session restore failed:', error)
        localStorage.removeItem('accessToken')
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [user, router, login])

  // Luôn fetch profile và invoices khi user?.customerId thay đổi (kể cả khi vừa vào dashboard)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.customerId) return
      try {
        const response = await apiClient.get<any>('/accounts/profile')
        setCustomerProfile(response.user)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }
    const fetchInvoices = async () => {
      if (!user?.customerId) return
      setIsLoadingInvoices(true)
      try {
        const response = await apiClient.get<any>(`/invoices/mine`)
        const invoicesData = Array.isArray(response) ? response : response?.data || response
        setInvoices(invoicesData || [])
      } catch (error) {
        console.error('Failed to fetch invoices:', error)
        setInvoices([])
      } finally {
        setIsLoadingInvoices(false)
      }
    }
    if (user?.customerId) {
      fetchProfile()
      fetchInvoices()
    }
  }, [user?.customerId])

  const menuItems = [
    { id: 'points', label: 'Điểm tích lũy', icon: <Award className="h-4 w-4" /> },
    { id: 'invoices', label: 'Hóa đơn mua hàng', icon: <Receipt className="h-4 w-4" /> },
    { id: 'profile', label: 'Thông tin cá nhân', icon: <Star className="h-4 w-4" /> },
  ]

  // Tính toán điểm từ profile và invoices, luôn cập nhật khi invoices thay đổi
  const [currentPoints, setCurrentPoints] = useState(0)
  const [totalPointsUsed, setTotalPointsUsed] = useState(0)
  const [totalPointsEarned, setTotalPointsEarned] = useState(0)

  useEffect(() => {
    const points = customerProfile?.point || 0
    const used = invoices.reduce((sum, inv) => sum + (inv.usedPoint || 0), 0)
    setCurrentPoints(points)
    setTotalPointsUsed(used)
    setTotalPointsEarned(points + used)
  }, [customerProfile, invoices])

  // Tính toán chi tiết hóa đơn với giá gốc ước tính
  const calculateInvoiceDetails = (invoice: Invoice) => {
    const details = invoice.invoiceDetails.map((detail) => {
      // Lấy giá gốc từ product (backend đã trả về)
      const originalPrice = (detail.product as any).price || 0
      let discount = 0

      // Tính giảm giá từ khuyến mãi
      if (detail.promotion) {
        if (detail.promotion.promotionType === 'PERCENTAGE') {
          discount = Math.round((originalPrice * detail.promotion.value) / 100) * detail.quantity
        } else {
          // Giảm cố định
          discount = detail.promotion.value * detail.quantity
        }
      }

      const subtotal = originalPrice * detail.quantity - discount

      return {
        ...detail,
        price: originalPrice,
        discount,
        subtotal,
      }
    })

    const subtotalBeforeDiscount = details.reduce((sum, d) => sum + d.price * d.quantity, 0)
    const promotionDiscount = details.reduce((sum, d) => sum + d.discount, 0)
    const pointsDiscount = invoice.usedPoint * 100 // 1 điểm = 100đ
    const totalDiscount = promotionDiscount + pointsDiscount

    return {
      details,
      subtotal: subtotalBeforeDiscount,
      promotionDiscount,
      pointsDiscount,
      totalDiscount,
    }
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice)
    setShowInvoiceDialog(true)
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout menuItems={menuItems} activeMenu={activeMenu} onMenuChange={setActiveMenu}>
      {activeMenu === 'points' && (
        <div className="space-y-6">
          <Card className="mx-auto max-w-2xl border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Award className="h-6 w-6" />
                Điểm Tích Lũy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6 text-center">
                <div>
                  <div className="mb-2 text-lg text-gray-600">Điểm hiện tại của bạn</div>
                  <div className="flex items-center justify-center gap-2 text-5xl font-bold">
                    <Star className="h-10 w-10 fill-yellow-500 text-yellow-500" />
                    <span className="text-blue-900">
                      {currentPoints.toLocaleString('vi-VN')} điểm
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-6">
                  <div className="rounded-lg bg-blue-50 p-6">
                    <div className="mb-1 text-sm text-gray-600">Tổng điểm tích lũy</div>
                    <div className="text-3xl font-semibold text-blue-900">
                      {totalPointsEarned.toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-6">
                    <div className="mb-1 text-sm text-gray-600">Điểm đã sử dụng</div>
                    <div className="text-3xl font-semibold text-blue-900">
                      {totalPointsUsed.toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-yellow-50 p-4 pt-4 text-base text-gray-600">
                  💡 Tích lũy thêm điểm để nhận được nhiều ưu đãi hấp dẫn!
                  <br />
                  <span className="text-sm">(1 điểm = 1đ khi sử dụng)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeMenu === 'profile' && <CustomerProfileContent />}

      {activeMenu === 'invoices' && (
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Receipt className="h-5 w-5" />
              Hóa Đơn Mua Hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingInvoices ? (
              <div className="py-12 text-center">
                <Loader2 className="mx-auto mb-3 h-12 w-12 animate-spin text-blue-600" />
                <p className="text-gray-500">Đang tải hóa đơn...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <ShoppingCart className="mx-auto mb-3 h-12 w-12 opacity-20" />
                <p>Chưa có hóa đơn nào</p>
                <p className="text-sm">Hãy mua sắm để tích lũy điểm nhé!</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-blue-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="text-blue-900">Mã HĐ</TableHead>
                      <TableHead className="text-blue-900">Ngày mua</TableHead>
                      <TableHead className="text-blue-900">Số mặt hàng</TableHead>
                      <TableHead className="text-blue-900">Tổng tiền</TableHead>
                      <TableHead className="text-blue-900">Điểm dùng</TableHead>
                      <TableHead className="text-right text-blue-900">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-blue-50">
                        <TableCell>HD{invoice.id.toString().padStart(3, '0')}</TableCell>
                        <TableCell>
                          {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>{invoice.invoiceDetails.length} mặt hàng</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {invoice.total.toLocaleString('vi-VN')}đ
                        </TableCell>
                        <TableCell>
                          {invoice.usedPoint > 0 ? (
                            <span className="text-orange-600">{invoice.usedPoint} điểm</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
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

      {/* Invoice Detail Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-h-[90vh] w-full max-w-[98vw] overflow-y-auto border-blue-200 lg:max-w-[1200px]">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Chi tiết hóa đơn</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {viewingInvoice && `Mã hóa đơn: HD${viewingInvoice.id.toString().padStart(3, '0')}`}
            </DialogDescription>
          </DialogHeader>

          {viewingInvoice &&
            (() => {
              const calculated = calculateInvoiceDetails(viewingInvoice)
              return (
                <div className="space-y-4">
                  {/* Thông tin hóa đơn */}
                  <div className="grid grid-cols-2 gap-4 rounded-lg bg-blue-50 p-4">
                    <div>
                      <p className="text-sm text-gray-600">Ngày mua</p>
                      <p className="font-semibold">
                        {new Date(viewingInvoice.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Giờ mua</p>
                      <p className="font-semibold">
                        {new Date(viewingInvoice.createdAt).toLocaleTimeString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {/* Danh sách sản phẩm */}
                  <div className="overflow-hidden rounded-lg border border-blue-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-blue-50">
                          <TableHead className="text-blue-900">Sản phẩm</TableHead>
                          <TableHead className="text-blue-900">Đơn giá</TableHead>
                          <TableHead className="text-blue-900">SL</TableHead>
                          <TableHead className="text-blue-900">Khuyến mãi</TableHead>
                          <TableHead className="text-blue-900">Giảm giá</TableHead>
                          <TableHead className="text-blue-900">Thành tiền</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calculated.details.map((detail, index) => (
                          <TableRow
                            key={`${detail.invoiceId}-${detail.productId}-${index}`}
                            className="hover:bg-blue-50"
                          >
                            <TableCell>{detail.product.name}</TableCell>
                            <TableCell>{detail.price.toLocaleString('vi-VN')}đ</TableCell>
                            <TableCell>{detail.quantity}</TableCell>
                            <TableCell>
                              {detail.promotion ? (
                                <span className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-700">
                                  {detail.promotion.name}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-red-600">
                              {detail.discount > 0
                                ? `-${detail.discount.toLocaleString('vi-VN')}đ`
                                : '-'}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {detail.subtotal.toLocaleString('vi-VN')}đ
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Tổng kết */}
                  <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span>{calculated.subtotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    {calculated.promotionDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Giảm giá khuyến mãi:</span>
                        <span className="text-red-600">
                          -{calculated.promotionDiscount.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}
                    {viewingInvoice.usedPoint > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Giảm giá từ điểm ({viewingInvoice.usedPoint} điểm):
                        </span>
                        <span className="text-red-600">
                          -{calculated.pointsDiscount.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 text-sm">
                      <span className="text-gray-600">Tổng giảm giá:</span>
                      <span className="font-semibold text-red-600">
                        -{calculated.totalDiscount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Tổng thanh toán:</span>
                      <span className="text-lg font-semibold text-green-600">
                        {viewingInvoice.total.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              )
            })()}

          <DialogFooter>
            <Button
              onClick={() => setShowInvoiceDialog(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
