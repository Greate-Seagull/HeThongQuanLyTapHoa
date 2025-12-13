'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, TrendingUp, Package, DollarSign, FileDown, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import {
  getInventoryReport,
  getGoodsReceiptReport,
  getSalesReport,
  getCustomerReport,
  getStocktakingReport,
  getRevenueProfitReport,
  exportInventoryToExcel,
  exportGoodsReceiptToExcel,
  exportSalesToExcel,
  exportCustomerToExcel,
  exportStocktakingToExcel,
  exportRevenueProfitToExcel,
  type InventoryReportData,
  type GoodsReceiptReportData,
  type SalesReportData,
  type CustomerReportData,
  type StocktakingReportData,
  type RevenueProfitReportData,
} from '@/services/report.service';

// Colors for charts
const CHART_COLORS = {
  primary: '#3b82f6',    // blue-500
  success: '#10b981',    // green-500
  warning: '#f59e0b',    // amber-500
  danger: '#ef4444',     // red-500
  purple: '#8b5cf6',     // purple-500
  teal: '#14b8a6',       // teal-500
  pink: '#ec4899',       // pink-500
  indigo: '#6366f1',     // indigo-500
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

type ReportType =
  | 'inventory'
  | 'goods-receipt'
  | 'sales'
  | 'customer'
  | 'stocktaking'
  | 'revenue-profit';

type ReportData =
  | InventoryReportData
  | GoodsReceiptReportData
  | SalesReportData
  | CustomerReportData
  | StocktakingReportData
  | RevenueProfitReportData
  | null;

export function Reports() {
  const [reportType, setReportType] = useState<ReportType>('inventory');
  const [reportData, setReportData] = useState<ReportData>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Reset report data when report type changes
  const handleReportTypeChange = (value: ReportType) => {
    setReportType(value);
    setReportData(null); // Force user to view report again
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      let data: ReportData = null;

      switch (reportType) {
        case 'inventory':
          data = await getInventoryReport(10);
          break;
        case 'goods-receipt':
          data = await getGoodsReceiptReport({ startDate, endDate });
          break;
        case 'sales':
          data = await getSalesReport({ startDate, endDate });
          break;
        case 'customer':
          data = await getCustomerReport('totalSpent');
          break;
        case 'stocktaking':
          data = await getStocktakingReport({ startDate, endDate });
          break;
        case 'revenue-profit':
          data = await getRevenueProfitReport({
            startDate,
            endDate,
            groupBy: 'time',
          });
          break;
      }

      setReportData(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Lỗi khi tải báo cáo. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!reportData) {
      toast.error('Vui lòng xem báo cáo trước khi xuất file Excel!');
      return;
    }

    try {
      switch (reportType) {
        case 'inventory':
          await exportInventoryToExcel(reportData as InventoryReportData);
          break;
        case 'goods-receipt':
          await exportGoodsReceiptToExcel(reportData as GoodsReceiptReportData);
          break;
        case 'sales':
          await exportSalesToExcel(reportData as SalesReportData);
          break;
        case 'customer':
          await exportCustomerToExcel(reportData as CustomerReportData);
          break;
        case 'stocktaking':
          await exportStocktakingToExcel(reportData as StocktakingReportData);
          break;
        case 'revenue-profit':
          await exportRevenueProfitToExcel(reportData as RevenueProfitReportData);
          break;
      }
      toast.success('Đã xuất file Excel thành công!');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Lỗi khi xuất file. Vui lòng thử lại.');
    }
  };

  const renderSummaryCards = () => {
    if (!reportData) return null;

    if (reportType === 'inventory' && 'summary' in reportData) {
      const data = reportData as InventoryReportData;
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng SP</p>
                  <p className="text-2xl font-bold text-blue-900">{data.summary?.totalProducts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sắp hết</p>
                  <p className="text-2xl font-bold text-orange-900">{data.summary?.lowStockProducts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Package className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hết hàng</p>
                  <p className="text-2xl font-bold text-red-900">{data.summary?.outOfStockProducts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giá trị kho</p>
                  <p className="text-2xl font-bold text-green-900">{(data.summary?.totalValue || 0).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (reportType === 'goods-receipt' && 'summary' in reportData) {
      const data = reportData as GoodsReceiptReportData;
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng phiếu</p>
                  <p className="text-2xl font-bold text-blue-900">{data.summary?.totalGoodReceipts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng số lượng</p>
                  <p className="text-2xl font-bold text-green-900">{data.summary?.totalQuantity || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng tiền</p>
                  <p className="text-2xl font-bold text-purple-900">{(data.summary?.totalAmount || 0).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">TB/phiếu</p>
                  <p className="text-2xl font-bold text-orange-900">{(data.summary?.averageAmount || 0).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (reportType === 'sales' && 'summary' in reportData) {
      const data = reportData as SalesReportData;
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng HĐ</p>
                  <p className="text-2xl font-bold text-blue-900">{data.summary?.totalInvoices || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Doanh thu</p>
                  <p className="text-2xl font-bold text-green-900">{(data.summary?.totalRevenue || 0).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng SL</p>
                  <p className="text-2xl font-bold text-purple-900">{data.summary?.totalQuantity || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">TB/HĐ</p>
                  <p className="text-2xl font-bold text-orange-900">{(data.summary?.averageInvoiceValue || 0).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (reportType === 'customer' && 'summary' in reportData) {
      const data = reportData as CustomerReportData;
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng KH</p>
                  <p className="text-2xl font-bold text-blue-900">{data.summary?.totalCustomers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                  <p className="text-2xl font-bold text-green-900">{(data.summary?.totalSpent || 0).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng điểm</p>
                  <p className="text-2xl font-bold text-purple-900">{data.summary?.totalPoints || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">TB/KH</p>
                  <p className="text-2xl font-bold text-orange-900">{(data.summary?.averageSpent || 0).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (reportType === 'stocktaking' && 'summary' in reportData) {
      const data = reportData as StocktakingReportData;
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng phiếu kiểm</p>
                  <p className="text-2xl font-bold text-orange-900">{data.summary?.totalStocktakings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng SP đã kiểm</p>
                  <p className="text-2xl font-bold text-blue-900">{data.summary?.totalProductsChecked || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng chênh lệch</p>
                  <p className="text-2xl font-bold text-red-900">{data.summary?.totalDiscrepancies || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">SL chênh lệch</p>
                  <p className="text-2xl font-bold text-purple-900">{data.summary?.totalDiscrepancyAmount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (reportType === 'revenue-profit' && 'totalRevenue' in reportData) {
      const data = reportData as RevenueProfitReportData;
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Doanh thu</p>
                  <p className="text-2xl font-bold text-blue-900">{(data.totalRevenue || 0).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Chi phí</p>
                  <p className="text-2xl font-bold text-red-900">{(data.totalCost || 0).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lợi nhuận</p>
                  <p className="text-2xl font-bold text-green-900">{(data.totalProfit || 0).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tỷ suất LN</p>
                  <p className="text-2xl font-bold text-purple-900">{data.profitMargin || '0.00'}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  const renderCharts = () => {
    if (!reportData) return null;

    // Báo cáo tồn kho - Bar chart số lượng theo sản phẩm
    if (reportType === 'inventory' && 'products' in reportData) {
      const data = reportData as InventoryReportData;
      console.log('Inventory chart data:', data);
      
      if (!data.products || data.products.length === 0) {
        return <p className="text-gray-500 text-center p-4">Không có dữ liệu sản phẩm</p>;
      }

      const chartData = data.products.slice(0, 10).map((p: any) => ({
        name: p.name?.length > 15 ? p.name.substring(0, 15) + '...' : (p.name || 'N/A'),
        quantity: p.amount || 0,
        value: (p.price || 0) * (p.amount || 0),
      }));

      console.log('Inventory chartData:', chartData);

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-900 text-lg">Số lượng tồn kho</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={120} 
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="quantity" fill={CHART_COLORS.primary} name="Số lượng" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900 text-lg">Giá trị tồn kho</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={120}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')}đ`} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="value" fill={CHART_COLORS.success} name="Giá trị (VNĐ)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Báo cáo nhập hàng - Line chart xu hướng nhập hàng
    if (reportType === 'goods-receipt' && 'goodReceipts' in reportData) {
      const data = reportData as GoodsReceiptReportData;
      console.log('Goods receipt chart data:', data);
      
      if (!data.goodReceipts || data.goodReceipts.length === 0) {
        return <p className="text-gray-500 text-center p-4">Không có dữ liệu nhập hàng</p>;
      }

      // Backend trả theo id desc, cần reverse để thời gian đi từ trái sang phải
      const chartData = data.goodReceipts.slice(0, 15).reverse().map((gr: any) => {
        // Backend trả: totalQuantity, totalAmount, createdAt, employee, details[]
        return {
          date: new Date(gr.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          amount: gr.totalAmount || 0,
          quantity: gr.totalQuantity || 0,
          employee: gr.employee || 'N/A',
        };
      });

      console.log('Goods receipt chartData:', chartData);

      return (
        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900 text-lg">Xu hướng nhập hàng</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => Number(value).toLocaleString('vi-VN')} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="amount" stroke={CHART_COLORS.success} strokeWidth={2} name="Tổng tiền (VNĐ)" />
                  <Line yAxisId="right" type="monotone" dataKey="quantity" stroke={CHART_COLORS.primary} strokeWidth={2} name="Số lượng" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Báo cáo bán hàng - Bar + Line chart
    if (reportType === 'sales' && 'sales' in reportData) {
      const data = reportData as SalesReportData;
      console.log('Sales chart data:', data);
      
      if (!data.sales || data.sales.length === 0) {
        return <p className="text-gray-500 text-center p-4">Không có dữ liệu bán hàng</p>;
      }

      // Sort by createdAt ascending (oldest to newest) for left to right display
      const sortedSales = [...data.sales]
        .filter((s: any) => s.createdAt) // Filter out items without createdAt
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateA - dateB; // ascending order: old -> new
        });

      console.log('Original sales:', data.sales);
      console.log('Sorted sales:', sortedSales);

      let chartData: any[] = [];
      
      if (sortedSales.length > 15) {
        // Group by date if too many invoices
        const groupedByDate: { [key: string]: { revenue: number; quantity: number; count: number; timestamp: number } } = {};
        
        sortedSales.forEach((s: any) => {
          const dateObj = new Date(s.createdAt);
          const dateKey = dateObj.toLocaleDateString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit',
            year: '2-digit'
          });
          
          if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = { 
              revenue: 0, 
              quantity: 0, 
              count: 0,
              timestamp: dateObj.getTime()
            };
          }
          groupedByDate[dateKey].revenue += s.total || 0;
          groupedByDate[dateKey].quantity += s.totalQuantity || 0;
          groupedByDate[dateKey].count += 1;
        });
        
        // Sort by timestamp and create chart data
        chartData = Object.entries(groupedByDate)
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)
          .map(([date, val]) => ({
            date: `${date}\n(${val.count} HĐ)`,
            revenue: val.revenue,
            quantity: val.quantity,
          }));
      } else {
        // Display individual invoices with date only (no invoice number)
        chartData = sortedSales.map((s: any) => {
          const dateObj = new Date(s.createdAt);
          const dateStr = dateObj.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
          });
          const timeStr = dateObj.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          
          return {
            date: `${dateStr}\n${timeStr}`,
            revenue: s.total || 0,
            quantity: s.totalQuantity || 0,
            invoiceId: s.id,
          };
        });
      }

      console.log('Final chartData (sorted old->new):', chartData);

      return (
        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card className="border-orange-200">
            <CardHeader className="bg-orange-50">
              <CardTitle className="text-orange-900 text-lg">Doanh thu & Số lượng bán theo thời gian</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    interval={0}
                    tick={{ fontSize: 9 }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    tick={{ fontSize: 10 }} 
                    label={{ value: 'VNĐ', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fontSize: 10 }} 
                    label={{ value: 'SL', angle: 90, position: 'insideRight', style: { fontSize: 12 } }} 
                  />
                  <Tooltip 
                    formatter={(value: any) => Number(value).toLocaleString('vi-VN')}
                    labelFormatter={(label) => `Thời gian: ${label}`}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke={CHART_COLORS.warning} strokeWidth={2} name="Doanh thu (VNĐ)" dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="quantity" stroke={CHART_COLORS.primary} strokeWidth={2} name="Số lượng bán" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Báo cáo khách hàng - Top 5 khách hàng
    if (reportType === 'customer' && 'customers' in reportData) {
      const data = reportData as CustomerReportData;
      console.log('Customer chart data:', data);
      
      if (!data.customers || data.customers.length === 0) {
        return <p className="text-gray-500 text-center p-4">Không có dữ liệu khách hàng</p>;
      }

      // Backend trả: currentPoints, totalSpent, name, totalPurchases
      const topCustomers = data.customers
        .slice(0, 5)
        .map((c: any) => ({
          name: c.name?.length > 20 ? c.name.substring(0, 20) + '...' : (c.name || 'N/A'),
          spent: c.totalSpent || 0,
          points: c.currentPoints || 0, // Backend trả currentPoints thay vì loyaltyPoints
          purchases: c.totalPurchases || 0,
        }));

      console.log('Top 5 customers:', topCustomers);

      return (
        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-900 text-lg">Top 5 khách hàng chi tiêu nhiều nhất</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topCustomers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')}đ`} />
                  <Legend />
                  <Bar dataKey="spent" fill={CHART_COLORS.primary} name="Tổng chi tiêu (VNĐ)" />
                  <Bar dataKey="points" fill={CHART_COLORS.warning} name="Điểm tích lũy" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Báo cáo kiểm kê - Bar chart chênh lệch
    if (reportType === 'stocktaking' && 'stocktakings' in reportData) {
      const data = reportData as StocktakingReportData;
      console.log('Stocktaking chart data:', data);
      
      if (!data.stocktakings || data.stocktakings.length === 0) {
        return <p className="text-gray-500 text-center p-4">Không có dữ liệu kiểm kê</p>;
      }

      const chartData: any[] = [];
      
      // Backend trả: stocktakings[].details[] với systemQuantity, actualQuantity, discrepancy
      data.stocktakings.forEach((st: any) => {
        if (st.details && Array.isArray(st.details)) {
          st.details.forEach((detail: any) => {
            chartData.push({
              product: detail.productName?.substring(0, 15) || 'N/A',
              discrepancy: detail.discrepancy || 0,
              expected: detail.systemQuantity || 0,  // Backend trả systemQuantity
              actual: detail.actualQuantity || 0,
              location: detail.location || 'N/A',
            });
          });
        }
      });

      const limitedData = chartData.slice(0, 10);
      console.log('Stocktaking chartData:', limitedData);

      if (limitedData.length === 0) {
        return <p className="text-gray-500 text-center p-4">Không có chi tiết kiểm kê</p>;
      }

      return (
        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card className="border-orange-200">
            <CardHeader className="bg-orange-50">
              <CardTitle className="text-orange-900 text-lg">Chênh lệch kiểm kê</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={limitedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="expected" fill={CHART_COLORS.primary} name="Dự kiến" />
                  <Bar dataKey="actual" fill={CHART_COLORS.success} name="Thực tế" />
                  <Bar dataKey="discrepancy" fill={CHART_COLORS.danger} name="Chênh lệch" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Báo cáo doanh thu & lợi nhuận - Line chart
    if (reportType === 'revenue-profit') {
      const rpData = reportData as RevenueProfitReportData;
      console.log('Revenue-profit chart data:', rpData);
      
      // Nếu groupBy === 'time', backend KHÔNG trả data array
      // Chỉ có totalRevenue, totalCost, totalProfit, profitMargin
      if (rpData.groupBy === 'time') {
        return (
          <div className="grid grid-cols-1 gap-6 mb-6">
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-900 text-lg">Tổng quan Doanh thu & Lợi nhuận</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Tổng doanh thu</p>
                    <p className="text-2xl font-bold text-blue-600">{rpData.totalRevenue.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Tổng chi phí</p>
                    <p className="text-2xl font-bold text-red-600">{rpData.totalCost.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Lợi nhuận</p>
                    <p className="text-2xl font-bold text-green-600">{rpData.totalProfit.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">Tỷ suất lợi nhuận</p>
                  <p className="text-3xl font-bold text-purple-600">{rpData.profitMargin}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      // Nếu groupBy === 'product' hoặc 'category', backend trả data array
      if (!rpData.data || rpData.data.length === 0) {
        return <p className="text-gray-500 text-center p-4">Không có dữ liệu theo {rpData.groupBy}</p>;
      }

      const chartData = (rpData.data || []).slice(0, 10).map((item: any) => ({
        name: item.productName || item.category || 'N/A',
        revenue: item.revenue || 0,
        quantity: item.quantity || 0,
      }));

      console.log('Revenue-profit chartData:', chartData);

      return (
        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900 text-lg">
                Doanh thu theo {rpData.groupBy === 'product' ? 'Sản phẩm' : 'Danh mục'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill={CHART_COLORS.primary} name="Doanh thu (VNĐ)" />
                  <Bar dataKey="quantity" fill={CHART_COLORS.success} name="Số lượng bán" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-900">Hệ Thống Báo Cáo</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Report Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="reportType" className="text-blue-900 mb-2 block">
                Loại báo cáo
              </Label>
              <Select value={reportType} onValueChange={handleReportTypeChange}>
                <SelectTrigger className="border-blue-200">
                  <SelectValue placeholder="Chọn loại báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Báo cáo tồn kho</SelectItem>
                  <SelectItem value="goods-receipt">Báo cáo nhập hàng</SelectItem>
                  <SelectItem value="sales">Báo cáo bán hàng</SelectItem>
                  <SelectItem value="customer">Báo cáo khách hàng</SelectItem>
                  <SelectItem value="stocktaking">Báo cáo kiểm kê</SelectItem>
                  <SelectItem value="revenue-profit">Báo cáo doanh thu & lợi nhuận</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range (only for time-based reports) */}
            {['goods-receipt', 'sales', 'stocktaking', 'revenue-profit'].includes(reportType) && (
              <>
                <div>
                  <Label htmlFor="startDate" className="text-blue-900 mb-2 block">
                    Từ ngày
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-blue-200"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-blue-900 mb-2 block">
                    Đến ngày
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-blue-200"
                  />
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <Button onClick={fetchReport} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              <BarChart3 className="mr-2 h-4 w-4" />
              {loading ? 'Đang tải...' : 'Xem báo cáo'}
            </Button>
            <Button onClick={handleExport} disabled={!reportData || loading} className="bg-green-600 hover:bg-green-700">
              <FileDown className="mr-2 h-4 w-4" />
              Xuất Excel
            </Button>
          </div>

          {/* Summary Cards */}
          {renderSummaryCards()}

          {/* Charts */}
          {renderCharts()}

          {/* Data Preview */}
          {reportData && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-blue-900 font-semibold mb-2">Dữ liệu báo cáo</h3>
              <p className="text-sm text-gray-600">
                Báo cáo đã được tải thành công. Click &quot;Xuất Excel&quot; để tải file chi tiết.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
