import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Trash2, Search, ShoppingCart, Receipt, Check, ChevronsUpDown, Printer, Tag, User, Coins } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { toast } from 'sonner';

enum EmployeePosition {
  SALES = 'SALES',
  INVENTORY = 'INVENTORY',
  RECEIVING = 'RECEIVING',
}

enum ProductStatus {
  GOOD = 'GOOD',
  EXPIRED = 'EXPIRED',
}

enum PromotionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

interface Employee {
  id: number;
  name: string;
  position: EmployeePosition;
}

interface Product {
  id: number;
  name: string;
  barcode: number;
  price: number;
  amount: number;
  status: ProductStatus;
}

interface Promotion {
  id: number;
  name: string;
  type: PromotionType;
  value: number;
  startDate: Date;
  endDate: Date;
  productId: number;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  loyaltyPoints: number;
}

interface InvoiceDetail {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
  promotionId: number | null;
  promotion: Promotion | null;
  discountAmount: number;
  finalPrice: number;
}

interface Invoice {
  id: number;
  employeeId: number;
  employee: Employee;
  customerId: number | null;
  customer: Customer | null;
  pointsUsed: number;
  pointsDiscount: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  createdAt: Date;
  details: InvoiceDetail[];
}

// Danh sách nhân viên bán hàng
const salesStaffList: Employee[] = [
  { id: 3, name: 'Lê Văn Bán', position: EmployeePosition.SALES },
  { id: 6, name: 'Nguyễn Thị Hoa', position: EmployeePosition.SALES },
];

// Mock products với số lượng tồn kho
const mockProducts: Product[] = [
  { id: 1, name: 'Coca Cola 330ml', barcode: 8934673123456, price: 10000, amount: 150, status: ProductStatus.GOOD },
  { id: 2, name: 'Pepsi 330ml', barcode: 8934673123457, price: 9500, amount: 200, status: ProductStatus.GOOD },
  { id: 3, name: 'Bánh Oreo', barcode: 8934673123458, price: 15000, amount: 80, status: ProductStatus.GOOD },
  { id: 4, name: 'Mì Hảo Hảo', barcode: 8934673123459, price: 4000, amount: 300, status: ProductStatus.GOOD },
  { id: 5, name: 'Sữa TH True Milk', barcode: 8934673123460, price: 28000, amount: 50, status: ProductStatus.GOOD },
  { id: 6, name: 'Nước suối Lavie', barcode: 8934673123461, price: 5000, amount: 100, status: ProductStatus.GOOD },
  { id: 7, name: 'Snack Oishi', barcode: 8934673123462, price: 7000, amount: 120, status: ProductStatus.GOOD },
  { id: 8, name: 'Kem Wall\'s', barcode: 8934673123463, price: 12000, amount: 60, status: ProductStatus.GOOD },
];

// Mock promotions
const mockPromotions: Promotion[] = [
  { id: 1, name: 'Giảm 10% Coca', type: PromotionType.PERCENTAGE, value: 10, startDate: new Date('2025-11-01'), endDate: new Date('2025-12-31'), productId: 1 },
  { id: 2, name: 'Giảm 5000đ Oreo', type: PromotionType.FIXED, value: 5000, startDate: new Date('2025-11-01'), endDate: new Date('2025-12-31'), productId: 3 },
  { id: 3, name: 'Giảm 15% Sữa TH', type: PromotionType.PERCENTAGE, value: 15, startDate: new Date('2025-11-01'), endDate: new Date('2025-12-31'), productId: 5 },
  { id: 4, name: 'Giảm 2000đ Snack', type: PromotionType.FIXED, value: 2000, startDate: new Date('2025-11-01'), endDate: new Date('2025-12-31'), productId: 7 },
];

// Mock customers
const mockCustomers: Customer[] = [
  { id: 1, name: 'Nguyễn Văn A', phone: '0901234567', loyaltyPoints: 5000 },
  { id: 2, name: 'Trần Thị B', phone: '0912345678', loyaltyPoints: 3000 },
  { id: 3, name: 'Lê Văn C', phone: '0923456789', loyaltyPoints: 10000 },
  { id: 4, name: 'Phạm Thị D', phone: '0934567890', loyaltyPoints: 2500 },
];

interface InvoiceManagementProps {
  currentUser?: { id: number; position: string };
}

export function InvoiceManagement({ currentUser }: InvoiceManagementProps) {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  // Form state
  const [productBarcode, setProductBarcode] = useState('');
  const [searchedProduct, setSearchedProduct] = useState<Product | null>(null);
  const [bestPromotion, setBestPromotion] = useState<Promotion | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<InvoiceDetail[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
  const [pointsToUse, setPointsToUse] = useState<number>(0);
  const [openCustomerCombobox, setOpenCustomerCombobox] = useState(false);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const filteredInvoices = invoices.filter(invoice =>
    invoice.id.toString().includes(searchTerm) ||
    invoice.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tìm khuyến mãi tốt nhất cho sản phẩm
  const findBestPromotion = (productId: number): Promotion | null => {
    const today = new Date();
    const applicablePromotions = mockPromotions.filter(p => 
      p.productId === productId &&
      p.startDate <= today &&
      p.endDate >= today
    );

    if (applicablePromotions.length === 0) return null;

    // So sánh và tìm khuyến mãi tốt nhất
    let bestPromo = applicablePromotions[0];
    let maxDiscount = calculateDiscountAmount(applicablePromotions[0], products.find(p => p.id === productId)?.price || 0);

    applicablePromotions.forEach(promo => {
      const discount = calculateDiscountAmount(promo, products.find(p => p.id === productId)?.price || 0);
      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestPromo = promo;
      }
    });

    return bestPromo;
  };

  const calculateDiscountAmount = (promotion: Promotion, price: number): number => {
    if (promotion.type === PromotionType.PERCENTAGE) {
      return (price * promotion.value) / 100;
    } else {
      return promotion.value;
    }
  };

  const handleSearchProduct = () => {
    if (!productBarcode) {
      toast.error('Vui lòng nhập mã hàng hóa hoặc tên sản phẩm');
      return;
    }

    // Tìm theo barcode hoặc tên sản phẩm
    const product = products.find(p => 
      p.barcode.toString() === productBarcode || 
      p.name.toLowerCase().includes(productBarcode.toLowerCase())
    );
    
    if (!product) {
      toast.error('Không tìm thấy sản phẩm');
      setSearchedProduct(null);
      setBestPromotion(null);
      return;
    }

    // Tìm khuyến mãi tốt nhất
    const promotion = findBestPromotion(product.id);
    
    setSearchedProduct(product);
    setBestPromotion(promotion);
    setQuantity(1);

    if (promotion) {
      const discount = calculateDiscountAmount(promotion, product.price);
      toast.success(`Tìm thấy: ${product.name}`, {
        description: `Khuyến mãi: ${promotion.name} - Giảm ${promotion.type === PromotionType.PERCENTAGE ? promotion.value + '%' : promotion.value.toLocaleString('vi-VN') + 'đ'}`,
      });
    } else {
      toast.success(`Tìm thấy: ${product.name}`, {
        description: 'Không có khuyến mãi',
      });
    }
  };

  const handleAddToCart = () => {
    if (!searchedProduct) {
      toast.error('Vui lòng tìm kiếm sản phẩm trước');
      return;
    }

    if (quantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    // Kiểm tra đã có trong giỏ chưa
    const existingItem = cart.find(item => item.productId === searchedProduct.id);
    if (existingItem) {
      toast.error('Sản phẩm đã có trong giỏ hàng');
      return;
    }

    const discountAmount = bestPromotion 
      ? calculateDiscountAmount(bestPromotion, searchedProduct.price)
      : 0;
    const finalPrice = (searchedProduct.price - discountAmount) * quantity;

    const newDetail: InvoiceDetail = {
      id: cart.length + 1,
      productId: searchedProduct.id,
      product: searchedProduct,
      quantity,
      price: searchedProduct.price,
      promotionId: bestPromotion?.id || null,
      promotion: bestPromotion,
      discountAmount,
      finalPrice,
    };

    setCart([...cart, newDetail]);
    
    // Reset form
    setSearchedProduct(null);
    setBestPromotion(null);
    setProductBarcode('');
    setQuantity(1);

    toast.success(`Đã thêm ${searchedProduct.name} vào giỏ hàng`);
  };

  const handleRemoveFromCart = (detailId: number) => {
    setCart(cart.filter(item => item.id !== detailId));
    toast.info('Đã xóa khỏi giỏ hàng');
  };

  const calculateSubtotal = (): number => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotalDiscount = (): number => {
    return cart.reduce((sum, item) => sum + (item.discountAmount * item.quantity), 0);
  };

  const calculatePointsDiscount = (): number => {
    // 1 điểm = 1 VNĐ
    return pointsToUse;
  };

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal();
    const promotionDiscount = calculateTotalDiscount();
    const pointsDiscount = calculatePointsDiscount();
    return subtotal - promotionDiscount - pointsDiscount;
  };

  const handleStartCheckout = () => {
    setIsCreatingInvoice(true);
    setCart([]);
    setSelectedCustomerId(0);
    setPointsToUse(0);
    setProductBarcode('');
    setSearchedProduct(null);
    setBestPromotion(null);
    setQuantity(1);
  };

  const handleCancelCheckout = () => {
    setIsCreatingInvoice(false);
    setCart([]);
    setSelectedCustomerId(0);
    setPointsToUse(0);
    setProductBarcode('');
    setSearchedProduct(null);
    setBestPromotion(null);
    setQuantity(1);
  };

  const handleConfirmPayment = () => {
    // Kiểm tra mã nhân viên
    if (!currentUser) {
      toast.error('Không tìm thấy thông tin nhân viên');
      return;
    }

    const employee = salesStaffList.find(e => e.id === currentUser.id);
    if (!employee) {
      toast.error('Nhân viên không có quyền thanh toán hoặc không tồn tại');
      return;
    }

    // Kiểm tra mã khách hàng (nếu có)
    let customer: Customer | null = null;
    if (selectedCustomerId > 0) {
      customer = customers.find(c => c.id === selectedCustomerId) || null;
      if (!customer) {
        toast.error('Mã khách hàng không tồn tại');
        return;
      }

      // Kiểm tra điểm tích lũy
      if (pointsToUse > customer.loyaltyPoints) {
        toast.error(`Khách hàng chỉ có ${customer.loyaltyPoints} điểm`);
        return;
      }
    } else {
      if (pointsToUse > 0) {
        toast.error('Vui lòng chọn khách hàng để sử dụng điểm tích lũy');
        return;
      }
    }

    // Kiểm tra giỏ hàng
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    // Kiểm tra từng hàng hóa
    for (const item of cart) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        toast.error(`Mã hàng hóa không tồn tại`);
        return;
      }

      // Kiểm tra số lượng <= tồn kho
      if (item.quantity > product.amount) {
        toast.error(`${product.name} chỉ còn ${product.amount} sản phẩm trong kho`);
        return;
      }

      // Kiểm tra mã khuyến mãi (nếu có)
      if (item.promotionId) {
        const promotion = mockPromotions.find(p => p.id === item.promotionId);
        if (!promotion) {
          toast.error(`Mã khuyến mãi không hợp lệ cho ${product.name}`);
          return;
        }

        // Kiểm tra khuyến mãi có khớp với sản phẩm không
        if (promotion.productId !== product.id) {
          toast.error(`Khuyến mãi không áp dụng cho ${product.name}`);
          return;
        }

        // Kiểm tra thời hạn khuyến mãi
        const today = new Date();
        if (today < promotion.startDate || today > promotion.endDate) {
          toast.error(`Khuyến mãi cho ${product.name} đã hết hạn`);
          return;
        }
      }
    }

    // Tính toán hóa đơn
    const subtotal = calculateSubtotal();
    const totalDiscount = calculateTotalDiscount();
    const pointsDiscount = calculatePointsDiscount();
    const total = calculateTotal();

    // Tạo hóa đơn
    const newId = Math.max(...invoices.map(i => i.id), 0) + 1;
    const newInvoice: Invoice = {
      id: newId,
      employeeId: employee.id,
      employee,
      customerId: customer?.id || null,
      customer,
      pointsUsed: pointsToUse,
      pointsDiscount,
      subtotal,
      totalDiscount: totalDiscount + pointsDiscount,
      total,
      createdAt: new Date(),
      details: cart,
    };

    // Cập nhật số lượng hàng hóa
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.productId === product.id);
      if (cartItem) {
        return {
          ...product,
          amount: product.amount - cartItem.quantity,
        };
      }
      return product;
    });
    setProducts(updatedProducts);

    // Cập nhật điểm tích lũy khách hàng
    if (customer) {
      const updatedCustomers = customers.map(c => {
        if (c.id === customer.id) {
          // Trừ điểm đã sử dụng, thêm điểm mới (1% tổng tiền)
          const newPoints = Math.floor(total * 0.01);
          return {
            ...c,
            loyaltyPoints: c.loyaltyPoints - pointsToUse + newPoints,
          };
        }
        return c;
      });
      setCustomers(updatedCustomers);
    }

    // Lưu hóa đơn
    setInvoices([newInvoice, ...invoices]);

    // Reset form
    setIsCreatingInvoice(false);
    setCart([]);
    setSelectedCustomerId(0);
    setPointsToUse(0);

    // Hiển thị/in hóa đơn
    setCurrentInvoice(newInvoice);
    setShowInvoiceDialog(true);

    toast.success('Thanh toán thành công!', {
      description: `Hóa đơn HD${newId.toString().padStart(3, '0')} - Tổng tiền: ${total.toLocaleString('vi-VN')}đ`,
    });
  };

  const handlePrintInvoice = () => {
    if (!currentInvoice) return;
    
    // Mock print functionality
    console.log('Printing invoice:', currentInvoice);
    toast.success('Đang in hóa đơn...', {
      description: `HD${currentInvoice.id.toString().padStart(3, '0')}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-blue-900">Quản Lý Hóa Đơn</CardTitle>
            {!isCreatingInvoice && (
              <Button onClick={handleStartCheckout} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Thanh toán mới
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Checkout Screen */}
      {isCreatingInvoice && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Product Search & Cart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Search */}
            <Card className="border-orange-200 bg-orange-50/30">
              <CardHeader className="bg-orange-100">
                <CardTitle className="text-orange-900 flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Tìm kiếm hàng hóa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Barcode or Product Name Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập barcode hoặc tên sản phẩm..."
                    value={productBarcode}
                    onChange={(e) => setProductBarcode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchProduct();
                      }
                    }}
                    className="border-orange-200"
                  />
                  <Button onClick={handleSearchProduct} className="bg-orange-600 hover:bg-orange-700">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {/* Product Info */}
                {searchedProduct && (
                  <div className="bg-white p-4 rounded-lg border border-orange-200 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{searchedProduct.name}</h3>
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
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-700 mb-1">
                          <Tag className="h-4 w-4" />
                          <span className="font-semibold">{bestPromotion.name}</span>
                        </div>
                        <p className="text-sm text-green-600">
                          Giảm: {bestPromotion.type === PromotionType.PERCENTAGE 
                            ? `${bestPromotion.value}%` 
                            : `${bestPromotion.value.toLocaleString('vi-VN')}đ`}
                        </p>
                        <p className="text-sm text-green-600">
                          Giá sau giảm: {(searchedProduct.price - calculateDiscountAmount(bestPromotion, searchedProduct.price)).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    )}

                    {/* Quantity & Add to Cart */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="quantity" className="text-sm">Số lượng</Label>
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
                        <Button onClick={handleAddToCart} className="bg-orange-600 hover:bg-orange-700">
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
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Giỏ hàng ({cart.length} sản phẩm)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Giỏ hàng trống</p>
                  </div>
                ) : (
                  <div className="border border-blue-200 rounded-lg overflow-hidden">
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
                                  <p className="text-xs text-green-600 flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    {item.promotion.name}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.price.toLocaleString('vi-VN')}đ</TableCell>
                            <TableCell className="text-green-600">
                              {item.discountAmount > 0 ? `-${item.discountAmount.toLocaleString('vi-VN')}đ` : '-'}
                            </TableCell>
                            <TableCell className="font-semibold">{item.finalPrice.toLocaleString('vi-VN')}đ</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                <CardTitle className="text-purple-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
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
                              setSelectedCustomerId(0);
                              setPointsToUse(0);
                              setOpenCustomerCombobox(false);
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
                                setSelectedCustomerId(customer.id);
                                setPointsToUse(0);
                                setOpenCustomerCombobox(false);
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
                  <div className="bg-purple-50 p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Điểm tích lũy:</span>
                      <span className="font-semibold text-purple-700">
                        {selectedCustomer.loyaltyPoints} điểm
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="pointsToUse" className="text-sm">Sử dụng điểm</Label>
                      <Input
                        id="pointsToUse"
                        type="number"
                        min="0"
                        max={selectedCustomer.loyaltyPoints}
                        value={pointsToUse}
                        onChange={(e) => setPointsToUse(Math.min(parseInt(e.target.value) || 0, selectedCustomer.loyaltyPoints))}
                        className="border-purple-200"
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
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span>{calculateSubtotal().toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm giá KM:</span>
                    <span className="text-green-600">-{calculateTotalDiscount().toLocaleString('vi-VN')}đ</span>
                  </div>
                  {pointsToUse > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giảm điểm:</span>
                      <span className="text-purple-600">-{calculatePointsDiscount().toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">{calculateTotal().toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3">
                  <Button 
                    onClick={handleConfirmPayment}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={cart.length === 0}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Xác nhận thanh toán
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
            <div className="flex gap-2 mb-6 max-w-md">
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

            {invoices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Receipt className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Chưa có hóa đơn nào</p>
                <p className="text-sm">Nhấn "Thanh toán mới" để bắt đầu</p>
              </div>
            ) : (
              <div className="border border-blue-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="text-blue-900">Mã HD</TableHead>
                      <TableHead className="text-blue-900">Ngày</TableHead>
                      <TableHead className="text-blue-900">Nhân viên</TableHead>
                      <TableHead className="text-blue-900">Khách hàng</TableHead>
                      <TableHead className="text-blue-900">Số SP</TableHead>
                      <TableHead className="text-blue-900">Tổng tiền</TableHead>
                      <TableHead className="text-blue-900 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-blue-50">
                        <TableCell className="font-medium">HD{invoice.id.toString().padStart(3, '0')}</TableCell>
                        <TableCell>{invoice.createdAt.toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{invoice.employee.name}</TableCell>
                        <TableCell>{invoice.customer?.name || 'Khách lẻ'}</TableCell>
                        <TableCell>{invoice.details.length}</TableCell>
                        <TableCell className="font-semibold">{invoice.total.toLocaleString('vi-VN')}đ</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCurrentInvoice(invoice);
                              setShowInvoiceDialog(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Hóa Đơn Bán Hàng</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Chi tiết hóa đơn bán hàng
            </DialogDescription>
          </DialogHeader>
          {currentInvoice && (
            <div className="space-y-4">
              {/* Invoice Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold">CỬA HÀNG ABC</h2>
                <p className="text-sm text-gray-600">123 Đường XYZ, Quận 1, TP.HCM</p>
                <p className="text-sm text-gray-600">Điện thoại: 0123456789</p>
              </div>

              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-semibold">Mã hóa đơn:</span> HD{currentInvoice.id.toString().padStart(3, '0')}</p>
                  <p><span className="font-semibold">Ngày:</span> {currentInvoice.createdAt.toLocaleString('vi-VN')}</p>
                  <p><span className="font-semibold">Nhân viên:</span> {currentInvoice.employee.name}</p>
                </div>
                <div>
                  <p><span className="font-semibold">Khách hàng:</span> {currentInvoice.customer?.name || 'Khách lẻ'}</p>
                  {currentInvoice.customer && (
                    <>
                      <p><span className="font-semibold">SĐT:</span> {currentInvoice.customer.phone}</p>
                      <p><span className="font-semibold">Điểm sử dụng:</span> {currentInvoice.pointsUsed}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Invoice Details */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-center">SL</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Giảm</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentInvoice.details.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p>{detail.product.name}</p>
                            {detail.promotion && (
                              <p className="text-xs text-green-600">{detail.promotion.name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{detail.quantity}</TableCell>
                        <TableCell className="text-right">{detail.price.toLocaleString('vi-VN')}đ</TableCell>
                        <TableCell className="text-right text-green-600">
                          {detail.discountAmount > 0 ? `-${detail.discountAmount.toLocaleString('vi-VN')}đ` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{detail.finalPrice.toLocaleString('vi-VN')}đ</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Invoice Summary */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{currentInvoice.subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Tổng giảm giá:</span>
                  <span>-{currentInvoice.totalDiscount.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{currentInvoice.total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-600 border-t pt-4">
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
  );
}
