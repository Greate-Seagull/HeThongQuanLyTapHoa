'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Award, Star, Receipt, Eye, ShoppingCart } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'

// Mock Invoice data - sẽ thay bằng API call
interface Invoice {
  id: number
  customerId: number
  employeeId: number
  createdAt: Date
  total: number
  pointsUsed: number
  employee: { id: number; name: string }
  details: InvoiceDetail[]
  subtotal: number
  totalDiscount: number
  pointsDiscount: number
}

interface InvoiceDetail {
  id: number
  productId: number
  quantity: number
  price: number
  discount: number
  subtotal: number
  product: { id: number; name: string }
  promotion?: { id: number; name: string }
}

// Mock invoices - synced with ProductManagement
const mockInvoices: Invoice[] = [
  {
    id: 1,
    customerId: 1,
    employeeId: 3,
    createdAt: new Date('2024-12-01'),
    total: 36500,
    pointsUsed: 50,
    subtotal: 41500,
    totalDiscount: 5000,
    pointsDiscount: 5000,
    employee: { id: 3, name: 'Lê Văn Bán' },
    details: [
      {
        id: 1,
        productId: 1,
        quantity: 2,
        price: 10000,
        discount: 0,
        subtotal: 20000,
        product: { id: 1, name: 'Coca Cola 330ml' },
      },
      {
        id: 2,
        productId: 3,
        quantity: 1,
        price: 15000,
        discount: 1500,
        subtotal: 13500,
        product: { id: 3, name: 'Bánh Oreo' },
        promotion: { id: 1, name: 'Giảm 10%' },
      },
      {
        id: 3,
        productId: 4,
        quantity: 2,
        price: 4000,
        discount: 0,
        subtotal: 8000,
        product: { id: 4, name: 'Mì Hảo Hảo' },
      },
    ],
  },
  {
    id: 2,
    customerId: 1,
    employeeId: 3,
    createdAt: new Date('2024-11-28'),
    total: 42000,
    pointsUsed: 0,
    subtotal: 44000,
    totalDiscount: 2000,
    pointsDiscount: 0,
    employee: { id: 3, name: 'Lê Văn Bán' },
    details: [
      {
        id: 4,
        productId: 2,
        quantity: 2,
        price: 9500,
        discount: 0,
        subtotal: 19000,
        product: { id: 2, name: 'Pepsi 330ml' },
      },
      {
        id: 5,
        productId: 5,
        quantity: 1,
        price: 28000,
        discount: 3000,
        subtotal: 25000,
        product: { id: 5, name: 'Sữa TH True Milk' },
        promotion: { id: 2, name: 'Giảm 3k' },
      },
    ],
  },
  {
    id: 3,
    customerId: 1,
    employeeId: 3,
    createdAt: new Date('2024-11-20'),
    total: 24000,
    pointsUsed: 100,
    subtotal: 34000,
    totalDiscount: 10000,
    pointsDiscount: 10000,
    employee: { id: 3, name: 'Lê Văn Bán' },
    details: [
      {
        id: 6,
        productId: 4,
        quantity: 5,
        price: 4000,
        discount: 0,
        subtotal: 20000,
        product: { id: 4, name: 'Mì Hảo Hảo' },
      },
      {
        id: 7,
        productId: 1,
        quantity: 1,
        price: 10000,
        discount: 6000,
        subtotal: 4000,
        product: { id: 1, name: 'Coca Cola 330ml' },
        promotion: { id: 3, name: 'Flash Sale -6k' },
      },
      {
        id: 8,
        productId: 3,
        quantity: 1,
        price: 15000,
        discount: 5000,
        subtotal: 10000,
        product: { id: 3, name: 'Bánh Oreo' },
        promotion: { id: 4, name: 'Combo giảm 5k' },
      },
    ],
  },
]

export default function CustomerDashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState('points')
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)

  useEffect(() => {
    // Check authentication after mount
    if (!user) {
      router.push('/auth/login')
    } else if (user.role !== 'customer') {
      router.push('/auth/login')
    } else {
      setIsLoading(false)
    }
  }, [user, router])

  const menuItems = [
    { id: 'points', label: 'Điểm tích lũy', icon: <Award className="h-4 w-4" /> },
    { id: 'invoices', label: 'Hóa đơn mua hàng', icon: <Receipt className="h-4 w-4" /> },
  ]

  // Lọc hóa đơn của khách hàng hiện tại
  const customerInvoices = mockInvoices.filter(inv => inv.customerId === (user?.customerId || 1))
  
  // Tính tổng điểm tích lũy và đã sử dụng
  const totalPointsEarned = 2500
  const totalPointsUsed = customerInvoices.reduce((sum, inv) => sum + inv.pointsUsed, 0)
  const currentPoints = totalPointsEarned - totalPointsUsed

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
                  💡 Tích lũy thêm điểm để nhận được nhiều ưu đãi hấp dẫn!
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeMenu === 'invoices' && (
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Hóa Đơn Mua Hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {customerInvoices.length === 0 ? (
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
                      <TableHead className="text-blue-900">Nhân viên</TableHead>
                      <TableHead className="text-blue-900">Số mặt hàng</TableHead>
                      <TableHead className="text-blue-900">Tổng tiền</TableHead>
                      <TableHead className="text-blue-900">Điểm dùng</TableHead>
                      <TableHead className="text-blue-900 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-blue-50">
                        <TableCell>HD{invoice.id.toString().padStart(3, '0')}</TableCell>
                        <TableCell>{invoice.createdAt.toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{invoice.employee.name}</TableCell>
                        <TableCell>{invoice.details.length} mặt hàng</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          {invoice.total.toLocaleString('vi-VN')}đ
                        </TableCell>
                        <TableCell>
                          {invoice.pointsUsed > 0 ? (
                            <span className="text-orange-600">{invoice.pointsUsed} điểm</span>
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
        <DialogContent className="border-blue-200 max-w-[95vw] lg:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Chi tiết hóa đơn</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {viewingInvoice && `Mã hóa đơn: HD${viewingInvoice.id.toString().padStart(3, '0')}`}
            </DialogDescription>
          </DialogHeader>

          {viewingInvoice && (
            <div className="space-y-4">
              {/* Thông tin hóa đơn */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Nhân viên bán</p>
                  <p className="font-semibold">{viewingInvoice.employee.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày mua</p>
                  <p className="font-semibold">{viewingInvoice.createdAt.toLocaleDateString('vi-VN')}</p>
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
                    {viewingInvoice.details.map((detail) => (
                      <TableRow key={detail.id} className="hover:bg-blue-50">
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
                  <span>{viewingInvoice.subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm giá khuyến mãi:</span>
                  <span className="text-red-600">
                    -{(viewingInvoice.totalDiscount - viewingInvoice.pointsDiscount).toLocaleString('vi-VN')}đ
                  </span>
                </div>
                {viewingInvoice.pointsUsed > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm giá từ điểm ({viewingInvoice.pointsUsed} điểm):</span>
                    <span className="text-red-600">-{viewingInvoice.pointsDiscount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-gray-600">Tổng giảm giá:</span>
                  <span className="text-red-600 font-semibold">
                    -{viewingInvoice.totalDiscount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Tổng thanh toán:</span>
                  <span className="font-semibold text-green-600">
                    {viewingInvoice.total.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          )}

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
