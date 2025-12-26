'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ProfilePage } from '@/components/ProfilePage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
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
      if (!user?.customerId) return;
      try {
        const response = await apiClient.get<any>('/accounts/profile');
        setCustomerProfile(response.user);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    const fetchInvoices = async () => {
      if (!user?.customerId) return;
      setIsLoadingInvoices(true);
      try {
        const response = await apiClient.get<any>(`/invoices/mine`);
        const invoicesData = Array.isArray(response) ? response : response?.data || response;
        setInvoices(invoicesData || []);
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
        setInvoices([]);
      } finally {
        setIsLoadingInvoices(false);
      }
    };
    if (user?.customerId) {
      fetchProfile();
      fetchInvoices();
    }
  }, [user?.customerId]);

  const menuItems = [
    { id: 'points', label: 'Điểm tích lũy', icon: <Award className="h-4 w-4" /> },
    { id: 'invoices', label: 'Hóa đơn mua hàng', icon: <Receipt className="h-4 w-4" /> },
    { id: 'profile', label: 'Thông tin cá nhân', icon: <Star className="h-4 w-4" /> },
  ]


  // Tính toán điểm từ profile và invoices, luôn cập nhật khi invoices thay đổi
  const [currentPoints, setCurrentPoints] = useState(0);
  const [totalPointsUsed, setTotalPointsUsed] = useState(0);
  const [totalPointsEarned, setTotalPointsEarned] = useState(0);

  useEffect(() => {
    const points = customerProfile?.point || 0;
    const used = invoices.reduce((sum, inv) => sum + (inv.usedPoint || 0), 0);
    setCurrentPoints(points);
    setTotalPointsUsed(used);
    setTotalPointsEarned(points + used);
  }, [customerProfile, invoices]);

  // Tính toán chi tiết hóa đơn với giá gốc ước tính
  const calculateInvoiceDetails = (invoice: Invoice) => {
    const details = invoice.invoiceDetails.map(detail => {
      let originalPrice = 0
      let discount = 0
      let subtotal = 0

      if (detail.promotion) {
        if (detail.promotion.promotionType === 'PERCENTAGE') {
          // Ước tính giá gốc từ % giảm giá
          const avgPriceAfterDiscount = invoice.total / invoice.invoiceDetails.reduce((sum, d) => sum + d.quantity, 0)
          originalPrice = Math.round(avgPriceAfterDiscount / (1 - detail.promotion.value / 100))
          discount = Math.round(originalPrice * detail.promotion.value / 100) * detail.quantity
          subtotal = originalPrice * detail.quantity - discount
        } else {
          // Giảm cố định
          discount = detail.promotion.value * detail.quantity
          originalPrice = Math.round((invoice.total + totalPointsUsed * 100 + discount) / invoice.invoiceDetails.reduce((sum, d) => sum + d.quantity, 0))
          subtotal = originalPrice * detail.quantity - discount
        }
      } else {
        // Không có khuyến mãi
        originalPrice = Math.round((invoice.total + invoice.usedPoint * 100) / invoice.invoiceDetails.reduce((sum, d) => sum + d.quantity, 0))
        discount = 0
        subtotal = originalPrice * detail.quantity
      }

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout
      menuItems={menuItems}
      activeMenu={activeMenu}
      onMenuChange={setActiveMenu}
    >
      {activeMenu === 'points' && (
        <div className="space-y-6">
          <Card className="max-w-2xl mx-auto border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Award className="h-6 w-6" />
                Điểm Tích Lũy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div>
                  <div className="text-gray-600 mb-2 text-lg">Điểm hiện tại của bạn</div>
                  <div className="flex items-center justify-center gap-2 text-5xl font-bold">
                    <Star className="h-10 w-10 text-yellow-500 fill-yellow-500" />
                    <span className="text-blue-900">{currentPoints.toLocaleString('vi-VN')} điểm</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Tổng điểm tích lũy</div>
                    <div className="text-3xl font-semibold text-blue-900">{totalPointsEarned.toLocaleString('vi-VN')}</div>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Điểm đã sử dụng</div>
                    <div className="text-3xl font-semibold text-blue-900">{totalPointsUsed.toLocaleString('vi-VN')}</div>
                  </div>
                </div>

                <div className="text-base text-gray-600 pt-4 bg-yellow-50 p-4 rounded-lg">
                  💡 Tích lũy thêm điểm để nhận được nhiều ưu đãi hấp dẫn!<br />
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
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Hóa Đơn Mua Hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingInvoices ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin text-blue-600" />
                <p className="text-gray-500">Đang tải hóa đơn...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Chưa có hóa đơn nào</p>
                <p className="text-sm">Hãy mua sắm để tích lũy điểm nhé!</p>
              </div>
            ) : (
              <div className="border border-blue-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="text-blue-900">Mã HĐ</TableHead>
                      <TableHead className="text-blue-900">Ngày mua</TableHead>
                      <TableHead className="text-blue-900">Số mặt hàng</TableHead>
                      <TableHead className="text-blue-900">Tổng tiền</TableHead>
                      <TableHead className="text-blue-900">Điểm dùng</TableHead>
                      <TableHead className="text-blue-900 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-blue-50">
                        <TableCell>HD{invoice.id.toString().padStart(3, '0')}</TableCell>
                        <TableCell>{new Date(invoice.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{invoice.invoiceDetails.length} mặt hàng</TableCell>
                        <TableCell className="text-green-600 font-semibold">
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
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
        <DialogContent className="border-blue-200 w-full max-w-[98vw] lg:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Chi tiết hóa đơn</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {viewingInvoice && `Mã hóa đơn: HD${viewingInvoice.id.toString().padStart(3, '0')}`}
            </DialogDescription>
          </DialogHeader>

          {viewingInvoice && (() => {
            const calculated = calculateInvoiceDetails(viewingInvoice)
            return (
              <div className="space-y-4">
                {/* Thông tin hóa đơn */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Ngày mua</p>
                    <p className="font-semibold">{new Date(viewingInvoice.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Giờ mua</p>
                    <p className="font-semibold">{new Date(viewingInvoice.createdAt).toLocaleTimeString('vi-VN')}</p>
                  </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="border border-blue-200 rounded-lg overflow-hidden">
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
                        <TableRow key={`${detail.invoiceId}-${detail.productId}-${index}`} className="hover:bg-blue-50">
                          <TableCell>{detail.product.name}</TableCell>
                          <TableCell>{detail.price.toLocaleString('vi-VN')}đ</TableCell>
                          <TableCell>{detail.quantity}</TableCell>
                          <TableCell>
                            {detail.promotion ? (
                              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                                {detail.promotion.name}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-red-600">
                            {detail.discount > 0 ? `-${detail.discount.toLocaleString('vi-VN')}đ` : '-'}
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
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
                      <span className="text-gray-600">Giảm giá từ điểm ({viewingInvoice.usedPoint} điểm):</span>
                      <span className="text-red-600">-{calculated.pointsDiscount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-gray-600">Tổng giảm giá:</span>
                    <span className="text-red-600 font-semibold">
                      -{calculated.totalDiscount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Tổng thanh toán:</span>
                    <span className="font-semibold text-green-600 text-lg">
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