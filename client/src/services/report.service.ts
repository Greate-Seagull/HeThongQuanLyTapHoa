import { apiClient } from './api-client';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Helper function to calculate column width based on content
function calculateColumnWidth(value: string, headerWidth: number = 10): number {
  if (!value) return headerWidth;
  
  // Vietnamese characters take more space
  const viLength = (value.match(/[ăâđêôơưàáảãạầấẩẫậằắẳẵặèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵĂÂĐÊÔƠƯÀÁẢÃẠẦẤẨẪẬẰẮẲẴẶÈÉẺẼẸỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌỒỐỔỖỘỜỚỞỠỢÙÚỦŨỤỪỨỬỮỰỲÝỶỸỴ]/g) || []).length;
  const enLength = value.length - viLength;
  
  // Vietnamese chars: 1.5x, English: 1x, add 2 for padding
  const calculatedWidth = (viLength * 1.5 + enLength) * 1.2 + 2;
  return Math.max(calculatedWidth, headerWidth);
}

// Helper to auto-size columns based on data
function autoSizeColumns(worksheet: ExcelJS.Worksheet, headerRow: number, columnCount: number) {
  const maxWidths: number[] = new Array(columnCount).fill(10); // Min width 10
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber >= headerRow) {
      row.eachCell((cell, colNumber) => {
        if (colNumber <= columnCount) {
          const cellValue = cell.value?.toString() || '';
          const width = calculateColumnWidth(cellValue);
          maxWidths[colNumber - 1] = Math.max(maxWidths[colNumber - 1], width);
        }
      });
    }
  });
  
  // Apply widths
  maxWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = Math.min(width, 50); // Max 50 to avoid ultra-wide columns
  });
}

// Helper to configure page setup for PDF export
function configurePageSetup(worksheet: ExcelJS.Worksheet) {
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'landscape', // Ngang để vừa nhiều cột hơn
    fitToPage: true,
    fitToWidth: 1, // Vừa chiều rộng trong 1 trang
    fitToHeight: 0, // Không giới hạn chiều cao, để tự động xuống trang
    margins: {
      left: 0.25,
      right: 0.25,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3
    },
    printArea: undefined, // Tự động xác định vùng in
    horizontalCentered: true, // Căn giữa theo chiều ngang
  };

  // Cấu hình in ấn
  worksheet.properties.defaultRowHeight = 15;
}

// Report types
export interface InventoryReportData {
  summary: {
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalValue: number;
  };
  products: any[];
}

export interface GoodsReceiptReportData {
  summary: {
    totalGoodReceipts: number;
    totalAmount: number;
    totalQuantity: number;
    averageAmount: number;
  };
  goodReceipts: any[];
}

export interface SalesReportData {
  summary: {
    totalInvoices: number;
    totalRevenue: number;
    totalQuantity: number;
    averageInvoiceValue: number;
    totalPointsUsed: number;
  };
  sales: any[];
}

export interface CustomerReportData {
  summary: {
    totalCustomers: number;
    totalPoints: number;
    totalSpent: number;
    totalPointsUsed: number;
    averageSpent: number;
  };
  customers: any[];
}

export interface StocktakingReportData {
  summary: {
    totalStocktakings: number;
    totalProductsChecked: number;
    totalDiscrepancies: number;
    totalDiscrepancyAmount: number;
  };
  stocktakings: any[];
}

export interface RevenueProfitReportData {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: string;
  groupBy: string;
  data?: any[];
  totalInvoices?: number;
  totalGoodReceipts?: number;
  averageInvoiceValue?: number;
}

// API calls
export const getInventoryReport = async (
  lowStockThreshold?: number
): Promise<InventoryReportData> => {
  try {
    const params = new URLSearchParams();
    if (lowStockThreshold !== undefined) {
      params.append('lowStockThreshold', lowStockThreshold.toString());
    }
    
    const response: any = await apiClient.get(`/reports/inventory?${params.toString()}`);
    console.log('Inventory report FULL response:', response);
    console.log('Inventory report response.data:', response.data);
    console.log('Inventory report response type:', typeof response);
    
    // Return response directly (not response.data)
    return response;
  } catch (error) {
    console.error('Error in getInventoryReport:', error);
    throw error;
  }
};

export const getGoodsReceiptReport = async (params: {
  startDate?: string;
  endDate?: string;
  supplierId?: number;
}): Promise<GoodsReceiptReportData> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.supplierId) queryParams.append('supplierId', params.supplierId.toString());
    
    const response: any = await apiClient.get(`/reports/goods-receipt?${queryParams.toString()}`);
    console.log('Goods receipt report response:', response);
    
    return response;
  } catch (error) {
    console.error('Error in getGoodsReceiptReport:', error);
    throw error;
  }
};

export const getSalesReport = async (params: {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
  userId?: number;
}): Promise<SalesReportData> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.employeeId) queryParams.append('employeeId', params.employeeId.toString());
    if (params.userId) queryParams.append('userId', params.userId.toString());
    
    const response: any = await apiClient.get(`/reports/sales?${queryParams.toString()}`);
    console.log('Sales report response:', response);
    
    return response;
  } catch (error) {
    console.error('Error in getSalesReport:', error);
    throw error;
  }
};

export const getCustomerReport = async (
  orderBy?: 'point' | 'totalSpent'
): Promise<CustomerReportData> => {
  try {
    const params = new URLSearchParams();
    if (orderBy) params.append('orderBy', orderBy);
    
    const response: any = await apiClient.get(`/reports/customer?${params.toString()}`);
    console.log('Customer report response:', response);
    
    return response;
  } catch (error) {
    console.error('Error in getCustomerReport:', error);
    throw error;
  }
};

export const getStocktakingReport = async (params: {
  startDate?: string;
  endDate?: string;
  hasDiscrepancy?: boolean;
}): Promise<StocktakingReportData> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.hasDiscrepancy !== undefined) {
      queryParams.append('hasDiscrepancy', params.hasDiscrepancy.toString());
    }
    
    const response: any = await apiClient.get(`/reports/stocktaking?${queryParams.toString()}`);
    console.log('Stocktaking report response:', response);
    
    return response;
  } catch (error) {
    console.error('Error in getStocktakingReport:', error);
    throw error;
  }
};

export const getRevenueProfitReport = async (params: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'product' | 'category' | 'time';
}): Promise<RevenueProfitReportData> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.groupBy) queryParams.append('groupBy', params.groupBy);
    
    const response: any = await apiClient.get(`/reports/revenue-profit?${queryParams.toString()}`);
    console.log('Revenue/Profit report response:', response);
    
    return response;
  } catch (error) {
    console.error('Error in getRevenueProfitReport:', error);
    throw error;
  }
};

// Excel export functions
export const exportInventoryToExcel = async (data: InventoryReportData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Báo Cáo Tồn Kho');

  // Title
  worksheet.mergeCells('A1:J1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'BÁO CÁO TỒN KHO';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF0066CC' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Export date
  worksheet.mergeCells('A2:J2');
  const dateCell = worksheet.getCell('A2');
  dateCell.value = `Ngày xuất: ${new Date().toLocaleString('vi-VN')}`;
  dateCell.font = { italic: true };
  dateCell.alignment = { horizontal: 'center' };

  worksheet.addRow([]);

  // Summary section with borders and formatting
  worksheet.mergeCells('A4:B4');
  const summaryTitle = worksheet.getCell('A4');
  summaryTitle.value = 'TỔNG KẾT:';
  summaryTitle.font = { bold: true, size: 12 };
  summaryTitle.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  const summaryRows = [
    ['Tổng số sản phẩm:', data.summary.totalProducts],
    ['Sản phẩm sắp hết:', data.summary.lowStockProducts],
    ['Sản phẩm hết hàng:', data.summary.outOfStockProducts],
    ['Tổng giá trị kho:', data.summary.totalValue.toLocaleString('vi-VN') + 'đ']
  ];

  summaryRows.forEach(rowData => {
    const row = worksheet.addRow(rowData);
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (colNumber === 1) {
        cell.font = { bold: true };
        cell.alignment = { wrapText: true, vertical: 'middle' };
      }
      if (colNumber === 2) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }
    });
  });

  // DON'T set widths here - will be set at the end
  worksheet.addRow([]);

  // Headers
  const headerRow = worksheet.addRow([
    'Mã SP',
    'Tên sản phẩm',
    'Mã vạch',
    'Số lượng',
    'Đơn vị',
    'Giá',
    'Trạng thái',
    'Nhà cung cấp',
    'Loại SP',
    'Vị trí'
  ]);

  // Style header - only color cells that have data
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  headerRow.height = 20;

  // Add data with borders
  const startRow = headerRow.number;
  data.products.forEach((product: any) => {
    // Backend trả: locations[] với shelf, rack, slot
    // supplier là string "N/A" hoặc tên NCC
    const locations = product.locations && product.locations.length > 0
      ? product.locations.map((l: any) => l.fullLocation || `${l.shelf}-${l.rack}-${l.slot}`).join(', ')
      : 'Chưa xếp kho';

    const row = worksheet.addRow([
      product.id,
      product.name,
      product.barcode,
      product.amount,
      product.unit,
      product.price.toLocaleString('vi-VN'),
      product.status,
      product.supplier || 'N/A',  // Backend trả string
      product.category || 'N/A',  // Backend trả string
      locations
    ]);
    
    // Align numbers to center/right
    row.getCell(4).alignment = { horizontal: 'center' };
    row.getCell(6).alignment = { horizontal: 'right' };
  });

  // Add borders to all data cells
  const endRow = worksheet.lastRow?.number || startRow;
  for (let i = startRow; i <= endRow; i++) {
    for (let j = 1; j <= 10; j++) {
      const cell = worksheet.getRow(i).getCell(j);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
  }

  // Auto-size all columns
  autoSizeColumns(worksheet, 4, 10); // Summary starts at row 4, 10 columns total

  // Configure page setup for PDF export
  configurePageSetup(worksheet);

  // Export
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, `bao-cao-ton-kho-${new Date().getTime()}.xlsx`);
};

export const exportGoodsReceiptToExcel = async (data: GoodsReceiptReportData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Báo Cáo Nhập Hàng');

  // Title
  worksheet.mergeCells('A1:E1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'BÁO CÁO NHẬP HÀNG';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF70AD47' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:E2');
  const dateCell = worksheet.getCell('A2');
  dateCell.value = `Ngày xuất: ${new Date().toLocaleString('vi-VN')}`;
  dateCell.font = { italic: true };
  dateCell.alignment = { horizontal: 'center' };

  worksheet.addRow([]);

  // Summary section with borders
  worksheet.mergeCells('A4:B4');
  const summaryTitle = worksheet.getCell('A4');
  summaryTitle.value = 'TỔNG KẾT:';
  summaryTitle.font = { bold: true, size: 12 };
  summaryTitle.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  const summaryRows = [
    ['Tổng số phiếu:', data.summary.totalGoodReceipts],
    ['Tổng số lượng:', data.summary.totalQuantity],
    ['Tổng tiền:', data.summary.totalAmount.toLocaleString('vi-VN') + 'đ'],
    ['Trung bình/phiếu:', data.summary.averageAmount.toLocaleString('vi-VN') + 'đ']
  ];

  summaryRows.forEach(rowData => {
    const row = worksheet.addRow(rowData);
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (colNumber === 1) {
        cell.font = { bold: true };
        cell.alignment = { wrapText: true, vertical: 'middle' };
      }
      if (colNumber === 2) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }
    });
  });

  worksheet.addRow([]);

  const headerRow = worksheet.addRow(['Mã phiếu', 'Ngày nhập', 'Nhân viên', 'Sản phẩm', 'NCC', 'SL', 'Giá nhập', 'Thành tiền']);
  
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 20;

  const startRow = headerRow.number;
  
  // Sort by ID ascending before adding to Excel
  const sortedReceipts = [...data.goodReceipts].sort((a: any, b: any) => a.id - b.id);
  
  sortedReceipts.forEach((gr: any) => {
    // Backend trả: details[] với productName, supplier, quantity, price, totalPrice
    if (gr.details && gr.details.length > 0) {
      gr.details.forEach((detail: any, index: number) => {
        const row = worksheet.addRow([
          index === 0 ? gr.id : '',  // Chỉ hiện mã phiếu ở dòng đầu
          index === 0 ? new Date(gr.createdAt).toLocaleString('vi-VN') : '',
          index === 0 ? gr.employee : '',
          detail.productName || 'N/A',
          detail.supplier || 'N/A',
          detail.quantity || 0,
          (detail.price || 0).toLocaleString('vi-VN') + 'đ',
          (detail.totalPrice || 0).toLocaleString('vi-VN') + 'đ'
        ]);
        row.getCell(6).alignment = { horizontal: 'center' };
        row.getCell(7).alignment = { horizontal: 'right' };
        row.getCell(8).alignment = { horizontal: 'right' };
      });
    } else {
      // Nếu không có chi tiết, hiển thị tổng hợp
      const row = worksheet.addRow([
        gr.id,
        new Date(gr.createdAt).toLocaleString('vi-VN'),
        gr.employee,
        `${gr.details?.length || 0} sản phẩm`,
        '',
        gr.totalQuantity,
        '',
        gr.totalAmount.toLocaleString('vi-VN') + 'đ'
      ]);
      row.getCell(6).alignment = { horizontal: 'center' };
      row.getCell(8).alignment = { horizontal: 'right' };
    }
  });

  const endRow = worksheet.lastRow?.number || startRow;
  for (let i = startRow; i <= endRow; i++) {
    for (let j = 1; j <= 8; j++) {
      const cell = worksheet.getRow(i).getCell(j);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
  }

  // Auto-size columns
  autoSizeColumns(worksheet, 4, 8);

  // Configure page setup for PDF export
  configurePageSetup(worksheet);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, `bao-cao-nhap-hang-${new Date().getTime()}.xlsx`);
};

export const exportSalesToExcel = async (data: SalesReportData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Báo Cáo Bán Hàng');

  worksheet.mergeCells('A1:J1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'BÁO CÁO BÁN HÀNG CHI TIẾT';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFC000' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:J2');
  const dateCell = worksheet.getCell('A2');
  dateCell.value = `Ngày xuất: ${new Date().toLocaleString('vi-VN')}`;
  dateCell.font = { italic: true };
  dateCell.alignment = { horizontal: 'center' };

  worksheet.addRow([]);

  // Summary with borders
  worksheet.mergeCells('A4:B4');
  const summaryTitle = worksheet.getCell('A4');
  summaryTitle.value = 'TỔNG KẾT:';
  summaryTitle.font = { bold: true, size: 12 };
  summaryTitle.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  const summaryRows = [
    ['Tổng hóa đơn:', data.summary.totalInvoices],
    ['Tổng doanh thu:', data.summary.totalRevenue.toLocaleString('vi-VN') + 'đ'],
    ['Tổng số lượng:', data.summary.totalQuantity],
    ['Trung bình/HĐ:', data.summary.averageInvoiceValue.toLocaleString('vi-VN') + 'đ'],
    ['Tổng điểm dùng:', data.summary.totalPointsUsed]
  ];

  summaryRows.forEach(rowData => {
    const row = worksheet.addRow(rowData);
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (colNumber === 1) {
        cell.font = { bold: true };
        cell.alignment = { wrapText: true, vertical: 'middle' };
      }
      if (colNumber === 2) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }
    });
  });

  worksheet.addRow([]);

  // Header với nhiều cột hơn để hiển thị chi tiết
  const headerRow = worksheet.addRow([
    'Mã HĐ', 
    'Ngày tạo', 
    'Nhân viên', 
    'Khách hàng', 
    'Sản phẩm',
    'SL',
    'Đơn giá',
    'Khuyến mãi',
    'Thành tiền',
    'Tổng HĐ'
  ]);
  
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFC000' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  headerRow.height = 25;

  const startRow = headerRow.number;
  
  // Sort by ID ascending before adding to Excel
  const sortedSales = [...data.sales].sort((a: any, b: any) => a.id - b.id);
  
  sortedSales.forEach((sale: any) => {
    const createdAt = sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) : '-';

    // Nếu có chi tiết sản phẩm, hiển thị từng dòng
    if (sale.details && sale.details.length > 0) {
      sale.details.forEach((detail: any, index: number) => {
        // Tính toán giá sau khuyến mãi
        let finalPrice = detail.productPrice || 0;
        let discountAmount = 0;
        
        if (detail.promotionValue && detail.promotionType) {
          if (detail.promotionType === 'PERCENTAGE') {
            // Giảm theo %
            discountAmount = Math.round((finalPrice * detail.promotionValue) / 100);
            finalPrice = finalPrice - discountAmount;
          } else if (detail.promotionType === 'FIXED_AMOUNT') {
            // Giảm số tiền cố định
            discountAmount = detail.promotionValue;
            finalPrice = Math.max(0, finalPrice - detail.promotionValue);
          } else if (detail.promotionType === 'BUY_X_GET_Y') {
            // Mua X tặng Y - giá không đổi nhưng có khuyến mãi
            // Giữ nguyên giá gốc
          }
        }
        
        const totalPrice = finalPrice * (detail.quantity || 0);
        
        const row = worksheet.addRow([
          index === 0 ? sale.id : '', // Chỉ hiện mã HĐ ở dòng đầu
          index === 0 ? createdAt : '',
          index === 0 ? sale.employee : '',
          index === 0 ? sale.customer : '',
          detail.productName || 'N/A',
          detail.quantity || 0,
          finalPrice.toLocaleString('vi-VN') + 'đ',
          detail.promotion || '-',
          totalPrice.toLocaleString('vi-VN') + 'đ',
          index === 0 ? sale.total.toLocaleString('vi-VN') + 'đ' : '' // Chỉ hiện tổng HĐ ở dòng đầu
        ]);
        
        // Alignment
        row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
        row.getCell(4).alignment = { horizontal: 'left', vertical: 'middle' };
        row.getCell(5).alignment = { horizontal: 'left', vertical: 'middle' };
        row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
        row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
        row.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };
        
        // Highlight tổng hóa đơn
        if (index === 0) {
          row.getCell(10).font = { bold: true };
        }
      });
      
      // Thêm dòng thông tin điểm sử dụng (nếu có)
      if (sale.usedPoint && sale.usedPoint > 0) {
        const pointRow = worksheet.addRow([
          '', '', '', '', 
          '→ Điểm tích lũy sử dụng',
          '',
          '',
          '',
          `- ${sale.usedPoint.toLocaleString('vi-VN')}đ`,
          ''
        ]);
        pointRow.getCell(5).font = { italic: true, color: { argb: 'FF0066CC' } };
        pointRow.getCell(9).font = { italic: true, color: { argb: 'FF0066CC' } };
        pointRow.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
      }
      
      // Thêm dòng trống giữa các hóa đơn để dễ đọc
      worksheet.addRow([]);
    } else {
      // Fallback: nếu không có details, hiển thị dạng tổng hợp như cũ
      const row = worksheet.addRow([
        sale.id,
        createdAt,
        sale.employee,
        sale.customer,
        `${sale.totalQuantity} sản phẩm`,
        sale.totalQuantity,
        '',
        sale.usedPoint > 0 ? `Dùng ${sale.usedPoint} điểm` : '-',
        '',
        sale.total.toLocaleString('vi-VN') + 'đ'
      ]);
      row.height = 20;
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
      row.getCell(4).alignment = { horizontal: 'left', vertical: 'middle' };
      row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };
      row.getCell(10).font = { bold: true };
    }
  });

  const endRow = worksheet.lastRow?.number || startRow;
  for (let i = startRow; i <= endRow; i++) {
    for (let j = 1; j <= 10; j++) {
      const cell = worksheet.getRow(i).getCell(j);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
  }

  // Auto-size columns based on content (10 cột)
  autoSizeColumns(worksheet, startRow, 10);

  // Configure page setup for PDF export
  configurePageSetup(worksheet);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, `bao-cao-ban-hang-${new Date().getTime()}.xlsx`);
};

export const exportCustomerToExcel = async (data: CustomerReportData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Báo Cáo Khách Hàng');

  worksheet.mergeCells('A1:G1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'BÁO CÁO KHÁCH HÀNG THÀNH VIÊN';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF5B9BD5' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:G2');
  const dateCell = worksheet.getCell('A2');
  dateCell.value = `Ngày xuất: ${new Date().toLocaleString('vi-VN')}`;
  dateCell.font = { italic: true };
  dateCell.alignment = { horizontal: 'center' };

  worksheet.addRow([]);
  
  // Summary with borders
  worksheet.mergeCells('A4:B4');
  const summaryTitle = worksheet.getCell('A4');
  summaryTitle.value = 'TỔNG KẾT:';
  summaryTitle.font = { bold: true, size: 12 };
  summaryTitle.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  const summaryRows = [
    ['Tổng khách hàng:', data.summary.totalCustomers],
    ['Tổng điểm hiện tại:', data.summary.totalPoints],
    ['Tổng chi tiêu:', data.summary.totalSpent.toLocaleString('vi-VN') + 'đ'],
    ['Tổng điểm đã dùng:', data.summary.totalPointsUsed],
    ['TB chi tiêu/KH:', data.summary.averageSpent.toLocaleString('vi-VN') + 'đ']
  ];

  summaryRows.forEach(rowData => {
    const row = worksheet.addRow(rowData);
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (colNumber === 1) {
        cell.font = { bold: true };
        cell.alignment = { wrapText: true, vertical: 'middle' };
      }
      if (colNumber === 2) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }
    });
  });

  worksheet.addRow([]);

  const headerRow = worksheet.addRow(['Mã KH', 'Tên KH', 'SĐT', 'Điểm hiện tại', 'Điểm đã dùng', 'Tổng chi tiêu', 'Số đơn']);
  
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF5B9BD5' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  headerRow.height = 20;

  const startRow = headerRow.number;
  
  // Sort by ID ascending before adding to Excel
  const sortedCustomers = [...data.customers].sort((a: any, b: any) => a.id - b.id);
  
  sortedCustomers.forEach((customer) => {
    const row = worksheet.addRow([
      customer.id,
      customer.name,
      customer.phoneNumber,
      customer.currentPoints,
      customer.totalPointsUsed,
      customer.totalSpent.toLocaleString('vi-VN') + 'đ',
      customer.totalPurchases
    ]);
    row.getCell(4).alignment = { horizontal: 'center' };
    row.getCell(5).alignment = { horizontal: 'center' };
    row.getCell(6).alignment = { horizontal: 'right' };
    row.getCell(7).alignment = { horizontal: 'center' };
  });

  const endRow = worksheet.lastRow?.number || startRow;
  for (let i = startRow; i <= endRow; i++) {
    for (let j = 1; j <= 7; j++) {
      worksheet.getRow(i).getCell(j).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
  }

  // Auto-size columns
  autoSizeColumns(worksheet, 4, 7);

  // Configure page setup for PDF export
  configurePageSetup(worksheet);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, `bao-cao-khach-hang-${new Date().getTime()}.xlsx`);
};

export const exportStocktakingToExcel = async (data: StocktakingReportData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Báo Cáo Kiểm Kê');

  worksheet.mergeCells('A1:E1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'BÁO CÁO KIỂM KÊ';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFED7D31' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:E2');
  const dateCell = worksheet.getCell('A2');
  dateCell.value = `Ngày xuất: ${new Date().toLocaleString('vi-VN')}`;
  dateCell.font = { italic: true };
  dateCell.alignment = { horizontal: 'center' };

  worksheet.addRow([]);
  
  // Summary with borders
  worksheet.mergeCells('A4:B4');
  const summaryTitle = worksheet.getCell('A4');
  summaryTitle.value = 'TỔNG KẾT:';
  summaryTitle.font = { bold: true, size: 12 };
  summaryTitle.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  const summaryRows = [
    ['Tổng phiếu kiểm kê:', data.summary.totalStocktakings],
    ['Tổng SP đã kiểm:', data.summary.totalProductsChecked],
    ['Tổng chênh lệch:', data.summary.totalDiscrepancies],
    ['Tổng SL chênh lệch:', data.summary.totalDiscrepancyAmount]
  ];

  summaryRows.forEach(rowData => {
    const row = worksheet.addRow(rowData);
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (colNumber === 1) {
        cell.font = { bold: true };
        cell.alignment = { wrapText: true, vertical: 'middle' };
      }
      if (colNumber === 2) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }
    });
  });

  worksheet.addRow([]);

  const headerRow = worksheet.addRow(['Mã phiếu', 'Ngày kiểm', 'Nhân viên', 'Sản phẩm', 'Vị trí', 'HT', 'TT', 'Chênh lệch']);
  
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFED7D31' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 20;

  const startRow = headerRow.number;
  
  // Sort by ID ascending before adding to Excel
  const sortedStocktakings = [...data.stocktakings].sort((a: any, b: any) => a.id - b.id);
  
  sortedStocktakings.forEach((st: any) => {
    // Backend trả: details[] với productName, location, systemQuantity, actualQuantity, discrepancy
    if (st.details && st.details.length > 0) {
      st.details.forEach((detail: any, index: number) => {
        const row = worksheet.addRow([
          index === 0 ? st.id : '',
          index === 0 ? new Date(st.createdAt).toLocaleString('vi-VN') : '',
          index === 0 ? st.employee : '',
          detail.productName || 'N/A',
          detail.location || 'N/A',
          detail.systemQuantity || 0,
          detail.actualQuantity || 0,
          detail.discrepancy || 0
        ]);
        row.getCell(6).alignment = { horizontal: 'center' };
        row.getCell(7).alignment = { horizontal: 'center' };
        row.getCell(8).alignment = { horizontal: 'center' };
        // Highlight discrepancy
        if (detail.discrepancy !== 0) {
          row.getCell(8).font = { bold: true, color: { argb: 'FFFF0000' } };
        }
      });
    } else {
      const row = worksheet.addRow([
        st.id,
        new Date(st.createdAt).toLocaleString('vi-VN'),
        st.employee,
        `${st.totalProducts || 0} sản phẩm`,
        '',
        '',
        '',
        st.totalDiscrepancy || 0
      ]);
      row.getCell(8).alignment = { horizontal: 'center' };
    }
  });

  const endRow = worksheet.lastRow?.number || startRow;
  for (let i = startRow; i <= endRow; i++) {
    for (let j = 1; j <= 8; j++) {
      worksheet.getRow(i).getCell(j).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
  }

  // Auto-size columns
  autoSizeColumns(worksheet, 4, 8);

  // Configure page setup for PDF export
  configurePageSetup(worksheet);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, `bao-cao-kiem-ke-${new Date().getTime()}.xlsx`);
};

export const exportRevenueProfitToExcel = async (data: RevenueProfitReportData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Báo Cáo Doanh Thu - Lợi Nhuận');

  worksheet.mergeCells('A1:E1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'BÁO CÁO DOANH THU VÀ LỢI NHUẬN';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF00B050' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:E2');
  const dateCell = worksheet.getCell('A2');
  dateCell.value = `Ngày xuất: ${new Date().toLocaleString('vi-VN')}`;
  dateCell.font = { italic: true };
  dateCell.alignment = { horizontal: 'center' };

  worksheet.addRow([]);
  
  // Summary with borders
  worksheet.mergeCells('A4:B4');
  const summaryTitle = worksheet.getCell('A4');
  summaryTitle.value = 'TỔNG KẾT:';
  summaryTitle.font = { bold: true, size: 12 };
  summaryTitle.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  const summaryRows = [
    ['Tổng doanh thu:', data.totalRevenue.toLocaleString('vi-VN') + 'đ'],
    ['Tổng chi phí:', data.totalCost.toLocaleString('vi-VN') + 'đ'],
    ['Lợi nhuận:', data.totalProfit.toLocaleString('vi-VN') + 'đ'],
    ['Tỷ suất lợi nhuận:', data.profitMargin + '%']
  ];

  summaryRows.forEach(rowData => {
    const row = worksheet.addRow(rowData);
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (colNumber === 1) {
        cell.font = { bold: true };
        // NO wrapText for revenue-profit - single table only
      }
      if (colNumber === 2) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }
    });
  });

  worksheet.addRow([]);

  let headerRow;
  let startRow = 0;
  let numColumns = 0;
  
  if (data.groupBy === 'product' && data.data) {
    headerRow = worksheet.addRow(['Tên sản phẩm', 'Mã vạch', 'Loại SP', 'SL bán', 'Doanh thu']);
    numColumns = 5;
    
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF00B050' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    headerRow.height = 20;
    
    startRow = headerRow.number;
    data.data.forEach((item: any) => {
      const row = worksheet.addRow([
        item.productName,
        item.barcode,
        item.category,
        item.quantity,
        item.revenue.toLocaleString('vi-VN') + 'đ'
      ]);
      row.getCell(4).alignment = { horizontal: 'center' };
      row.getCell(5).alignment = { horizontal: 'right' };
    });
  } else if (data.groupBy === 'category' && data.data) {
    headerRow = worksheet.addRow(['Loại sản phẩm', 'SL bán', 'Doanh thu']);
    numColumns = 3;
    
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF00B050' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    headerRow.height = 20;
    
    startRow = headerRow.number;
    data.data.forEach((item: any) => {
      const row = worksheet.addRow([
        item.category,
        item.quantity,
        item.revenue.toLocaleString('vi-VN') + 'đ'
      ]);
      row.getCell(2).alignment = { horizontal: 'center' };
      row.getCell(3).alignment = { horizontal: 'right' };
    });
  }

  // Add borders to all data cells
  if (headerRow && numColumns > 0) {
    const endRow = worksheet.lastRow?.number || startRow;
    for (let i = startRow; i <= endRow; i++) {
      for (let j = 1; j <= numColumns; j++) {
        worksheet.getRow(i).getCell(j).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }

    // Auto-size columns
    autoSizeColumns(worksheet, 4, numColumns);
  }

  // Configure page setup for PDF export
  configurePageSetup(worksheet);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, `bao-cao-doanh-thu-loi-nhuan-${new Date().getTime()}.xlsx`);
};
