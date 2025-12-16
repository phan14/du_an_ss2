
import * as XLSX from 'xlsx';
import { Order, OrderStatus, OrderItem, Customer, GluingRecord } from '../types';

export const exportOrdersToExcel = (orders: Order[], customers: Customer[], fileName: string = 'danh_sach_don_hang.xlsx') => {
  // 1. Prepare data for Excel
  const data = orders.map(order => {
    const customer = customers.find(c => c.id === order.customerId);
    
    // Format items string
    const itemsString = order.items.map(i => `${i.productName} (${i.quantity})`).join(', ');

    return {
      'Mã Đơn': order.id,
      'Khách Hàng': customer?.name || 'Khách lẻ',
      'Số Điện Thoại': customer?.phone || '',
      'Sản Phẩm': itemsString,
      'Tổng SL': order.items.reduce((acc, i) => acc + i.quantity, 0),
      'Thực Giao': order.actualDeliveryQuantity || 0,
      'Tổng Tiền': order.totalAmount,
      'Đã Cọc': order.depositAmount || 0,
      'Còn Lại': order.totalAmount - (order.depositAmount || 0),
      'Ngày Đặt': formatDateForExcel(order.createdAt),
      'Hạn Giao': formatDateForExcel(order.deadline),
      'Trạng Thái': order.status,
      'Ghi Chú': order.notes || ''
    };
  });

  // 2. Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 3. Set column widths
  const wscols = [
    { wch: 10 }, // Mã Đơn
    { wch: 20 }, // Khách Hàng
    { wch: 12 }, // SĐT
    { wch: 40 }, // Sản Phẩm
    { wch: 8 },  // Tổng SL
    { wch: 10 }, // Thực Giao
    { wch: 15 }, // Tổng Tiền
    { wch: 15 }, // Đã Cọc
    { wch: 15 }, // Còn Lại
    { wch: 12 }, // Ngày Đặt
    { wch: 12 }, // Hạn Giao
    { wch: 15 }, // Trạng Thái
    { wch: 20 }  // Ghi Chú
  ];
  worksheet['!cols'] = wscols;

  // 4. Create workbook and download
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
  XLSX.writeFile(workbook, fileName);
};

export const exportGluingToExcel = (records: GluingRecord[], fileName: string = 'danh_sach_ui_keo.xlsx') => {
  // 1. Prepare data
  const data = records.map(rec => {
    const failQty = rec.failQuantity || 0;
    const passQty = rec.quantity - failQty;

    return {
      'Mã': rec.id,
      'Mã Đơn Hàng': rec.orderId,
      'Ngày Thực Hiện': formatDateForExcel(rec.date),
      'Sản Phẩm': rec.productName,
      'Loại Keo': rec.gluingType,
      'Người Làm': rec.workerName || '',
      'Tổng Số Lượng': rec.quantity,
      'Đạt (OK)': passQty,
      'Lỗi (NG)': failQty,
      'Ghi Chú': rec.notes || ''
    };
  });

  // 2. Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 3. Set column widths
  const wscols = [
    { wch: 15 }, // Mã
    { wch: 15 }, // Mã Đơn
    { wch: 12 }, // Ngày
    { wch: 30 }, // Sản Phẩm
    { wch: 20 }, // Loại Keo
    { wch: 20 }, // Người Làm
    { wch: 10 }, // Tổng SL
    { wch: 10 }, // Đạt
    { wch: 10 }, // Lỗi
    { wch: 30 }  // Ghi Chú
  ];
  worksheet['!cols'] = wscols;

  // 4. Create workbook and download
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'GluingRecords');
  XLSX.writeFile(workbook, fileName);
};

export const exportCustomerStatsToExcel = (
  customerName: string, 
  stats: { [timeKey: string]: { [productName: string]: { quantity: number; revenue: number; orderCount: number } } },
  fileName: string
) => {
  const flattenedData: any[] = [];

  Object.entries(stats).forEach(([timeKey, products]) => {
    Object.entries(products).forEach(([productName, stat]) => {
      flattenedData.push({
        'Tháng/Năm': timeKey,
        'Khách Hàng': customerName,
        'Tên Sản Phẩm': productName,
        'Số Đơn Hàng': stat.orderCount,
        'Tổng Số Lượng': stat.quantity,
        'Tổng Doanh Thu': stat.revenue
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(flattenedData);
  const wscols = [
    { wch: 12 }, // Tháng/Năm
    { wch: 20 }, // Khách Hàng
    { wch: 30 }, // Tên Sản Phẩm
    { wch: 12 }, // Số Đơn Hàng
    { wch: 15 }, // Tổng Số Lượng
    { wch: 18 }  // Tổng Doanh Thu
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ThongKe');
  XLSX.writeFile(workbook, fileName);
};

export const importOrdersFromExcel = async (file: File, customers: Customer[]): Promise<{ newOrders: Order[], newCustomers: Customer[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Smart Sheet Detection
        let sheetName = workbook.SheetNames[0];
        if (workbook.SheetNames.includes('Orders')) {
            sheetName = 'Orders';
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newOrders: Order[] = [];
        const newCustomers: Customer[] = [];
        const existingCustomerMap = new Map(customers.map(c => [c.name.toLowerCase().trim(), c]));

        jsonData.forEach((row: any) => {
            // Flexible Column Mapping
            // Check for various ways user might name columns
            const nameVal = row['Khách Hàng'] || row['Tên khách hàng'] || row['Họ tên'] || row['Tên KH'];
            const phoneVal = row['Số Điện Thoại'] || row['SĐT'] || row['Điện thoại'] || row['Phone'];
            const idVal = row['Mã Đơn'] || row['Mã đơn hàng'] || row['ID'];
            
            // Basic validation
            if (!idVal && !nameVal) return;

            // Handle Customer
            const customerName = nameVal ? String(nameVal).trim() : 'Khách Vãng Lai';
            let customerId = '';
            
            if (existingCustomerMap.has(customerName.toLowerCase())) {
                customerId = existingCustomerMap.get(customerName.toLowerCase())!.id;
            } else {
                // Check if we already created this new customer in this batch
                const inBatch = newCustomers.find(c => c.name.toLowerCase() === customerName.toLowerCase());
                if (inBatch) {
                    customerId = inBatch.id;
                } else {
                    const newCust: Customer = {
                        id: generateSafeId('cust'),
                        name: customerName,
                        phone: phoneVal ? String(phoneVal) : '',
                        email: '',
                        address: '',
                        createdAt: new Date().toISOString()
                    };
                    newCustomers.push(newCust);
                    customerId = newCust.id;
                }
            }

            // Handle Items
            const productVal = row['Sản Phẩm'] || row['Tên hàng'] || row['Hàng hóa'];
            const qtyVal = row['Tổng SL'] || row['Số lượng'] || row['SL'];
            const amountVal = row['Tổng Tiền'] || row['Thành tiền'] || row['Doanh thu'];
            const depositVal = row['Đã Cọc'] || row['Cọc'] || row['Tiền cọc'];
            const deliveredVal = row['Thực Giao'] || row['Đã giao'];
            const statusVal = row['Trạng Thái'] || row['Tình trạng'];
            const noteVal = row['Ghi Chú'] || row['Note'];
            const createdVal = row['Ngày Đặt'] || row['Ngày tạo'];
            const deadlineVal = row['Hạn Giao'] || row['Deadline'];

            const productStr = productVal ? String(productVal) : 'Sản phẩm nhập excel';
            const quantity = qtyVal ? parseInt(qtyVal) : 1;
            const totalAmount = amountVal ? parseInt(amountVal) : 0;
            const depositAmount = depositVal ? parseInt(depositVal) : 0;
            const unitPrice = quantity > 0 ? Math.floor(totalAmount / quantity) : 0;

            const item: OrderItem = {
                productName: productStr,
                quantity: quantity,
                size: 'M',
                unitPrice: unitPrice,
                imageUrl: ''
            };

            // Handle Dates
            const createdAt = parseExcelDate(createdVal) || new Date().toISOString();
            const deadline = parseExcelDate(deadlineVal) || new Date(Date.now() + 14 * 86400000).toISOString();

            const order: Order = {
                id: idVal ? String(idVal) : generateSafeId('ord').toUpperCase(),
                customerId: customerId,
                items: [item],
                totalAmount: totalAmount,
                depositAmount: depositAmount,
                status: parseStatus(statusVal),
                deadline: deadline.split('T')[0], // YYYY-MM-DD
                createdAt: createdAt,
                notes: noteVal,
                actualDeliveryQuantity: deliveredVal ? parseInt(deliveredVal) : 0
            };
            
            newOrders.push(order);
        });

        resolve({ newOrders, newCustomers });
      } catch (error) {
        console.error("Excel Read Error:", error);
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// --- Helpers ---

const generateSafeId = (prefix: string) => {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
};

const parseStatus = (status: any): OrderStatus => {
    if (!status) return OrderStatus.PENDING;
    const s = String(status).toLowerCase();
    if (s.includes('hoàn thành') || s.includes('xong')) return OrderStatus.COMPLETED;
    if (s.includes('hủy')) return OrderStatus.CANCELLED;
    if (s.includes('sản xuất') || s.includes('đang làm')) return OrderStatus.IN_PROGRESS;
    return OrderStatus.PENDING;
};

const parseExcelDate = (dateVal: any): string | null => {
    if (!dateVal) return null;
    try {
        if (typeof dateVal === 'number') {
            // Excel serial date
            const date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
            return date.toISOString();
        }
        if (typeof dateVal === 'string') {
            // Try DD/MM/YYYY
            const parts = dateVal.split('/');
            if (parts.length === 3) {
                return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
            }
            return new Date(dateVal).toISOString();
        }
    } catch (e) {
        return null;
    }
    return null;
};

const formatDateForExcel = (isoDate: string) => {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
};
