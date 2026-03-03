import { Order, Customer } from '../types';
import { sendTelegramMessage } from './telegramService';
import * as XLSX from 'xlsx';

/**
 * Create Excel file from orders and customers data with formatting
 */
export const createBackupData = (orders: Order[], customers: Customer[]) => {
  const wb = XLSX.utils.book_new();

  // Define styles
  const headerStyle = {
    fill: { fgColor: { rgb: "4472C4" } },
    font: { bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true }
  };

  const dateStyle = {
    numFmt: 'yyyy-mm-dd'
  };

  const currencyStyle = {
    numFmt: '#,##0'
  };

  // ===== SHEET 1: SUMMARY =====
  const summaryData = [
    {
      'Thông Tin': 'Thống Kê Tổng Quan',
      'Giá Trị': ''
    },
    {
      'Thông Tin': 'Ngày Backup',
      'Giá Trị': new Date().toLocaleString('vi-VN')
    },
    {
      'Thông Tin': 'Tổng Đơn Hàng',
      'Giá Trị': orders.length
    },
    {
      'Thông Tin': 'Tổng Khách Hàng',
      'Giá Trị': customers.length
    },
    {
      'Thông Tin': 'Đơn Chờ Xử Lý',
      'Giá Trị': orders.filter(o => o.status === 'Chờ xử lý').length
    },
    {
      'Thông Tin': 'Đơn Đang SX',
      'Giá Trị': orders.filter(o => o.status === 'Đang SX').length
    },
    {
      'Thông Tin': 'Đơn Hoàn Thành',
      'Giá Trị': orders.filter(o => o.status === 'Hoàn thành').length
    },
    {
      'Thông Tin': 'Đơn Đã Hủy',
      'Giá Trị': orders.filter(o => o.status === 'Đã hủy').length
    },
    {
      'Thông Tin': 'Tổng Doanh Thu',
      'Giá Trị': orders.reduce((sum, o) => sum + o.totalAmount, 0)
    },
    {
      'Thông Tin': 'Tổng Tiền Cọc',
      'Giá Trị': orders.reduce((sum, o) => sum + (o.depositAmount || 0), 0)
    },
    {
      'Thông Tin': 'Công Nợ Phải Thu',
      'Giá Trị': orders.reduce((sum, o) => sum + o.totalAmount, 0) - orders.reduce((sum, o) => sum + (o.depositAmount || 0), 0)
    }
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, '📊 Tóm Tắt');

  // ===== SHEET 2: ORDERS =====
  const ordersData = orders.map(order => {
    const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
    const deliveryRate = totalQty > 0 ? Math.round(((order.actualDeliveryQuantity || 0) / totalQty) * 100) : 0;
    
    return {
      'Mã Đơn': order.id,
      'Khách Hàng ID': order.customerId,
      'Sản Phẩm': order.items.map(i => i.productName).join('; '),
      'Tổng Số Lượng': totalQty,
      'Đã Giao': order.actualDeliveryQuantity || 0,
      'Tiến Độ %': deliveryRate,
      'Đơn Giá': order.items.map(i => i.unitPrice).join('; '),
      'Tổng Tiền': order.totalAmount,
      'Tiền Cọc': order.depositAmount || 0,
      'Công Nợ': order.totalAmount - (order.depositAmount || 0),
      'Trạng Thái': order.status,
      'Hạn Giao': order.deadline,
      'Ngày Tạo': order.createdAt,
      'Ghi Chú': order.notes || '',
      'Lý Do': order.statusReason || ''
    };
  });

  const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
  ordersSheet['!cols'] = [
    { wch: 12 }, // Mã Đơn
    { wch: 15 }, // Khách Hàng ID
    { wch: 30 }, // Sản Phẩm
    { wch: 12 }, // Tổng Số Lượng
    { wch: 10 }, // Đã Giao
    { wch: 10 }, // Tiến Độ %
    { wch: 25 }, // Đơn Giá
    { wch: 15 }, // Tổng Tiền
    { wch: 12 }, // Tiền Cọc
    { wch: 12 }, // Công Nợ
    { wch: 12 }, // Trạng Thái
    { wch: 12 }, // Hạn Giao
    { wch: 12 }, // Ngày Tạo
    { wch: 25 }, // Ghi Chú
    { wch: 20 }  // Lý Do
  ];

  // Format header row
  if (ordersSheet['!ref']) {
    const range = XLSX.utils.decode_range(ordersSheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!ordersSheet[address]) continue;
      ordersSheet[address].s = headerStyle;
    }
  }

  XLSX.utils.book_append_sheet(wb, ordersSheet, '📋 Đơn Hàng');

  // ===== SHEET 3: CUSTOMERS =====
  const customersData = customers.map(customer => ({
    'ID': customer.id,
    'Tên Khách Hàng': customer.name,
    'Số Điện Thoại': customer.phone || '',
    'Email': customer.email || '',
    'Địa Chỉ': customer.address || '',
    'Thành Phố': customer.city || '',
    'Loại Khách': customer.type || '',
    'Ngày Tạo': customer.createdAt || '',
    'Ghi Chú': customer.notes || '',
    'Số Đơn Đặt': orders.filter(o => o.customerId === customer.id).length,
    'Tổng Chi': orders.filter(o => o.customerId === customer.id).reduce((sum, o) => sum + o.totalAmount, 0)
  }));

  const customersSheet = XLSX.utils.json_to_sheet(customersData);
  customersSheet['!cols'] = [
    { wch: 15 }, // ID
    { wch: 25 }, // Tên
    { wch: 15 }, // SDT
    { wch: 25 }, // Email
    { wch: 30 }, // Địa Chỉ
    { wch: 15 }, // Thành Phố
    { wch: 15 }, // Loại
    { wch: 12 }, // Ngày Tạo
    { wch: 25 }, // Ghi Chú
    { wch: 12 }, // Số Đơn
    { wch: 15 }  // Tổng Chi
  ];

  // Format header row
  if (customersSheet['!ref']) {
    const range = XLSX.utils.decode_range(customersSheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!customersSheet[address]) continue;
      customersSheet[address].s = headerStyle;
    }
  }

  XLSX.utils.book_append_sheet(wb, customersSheet, '👥 Khách Hàng');

  return wb;
};

/**
 * Backup to Telegram - Send file via bot
 */
export const backupToTelegram = async (
  orders: Order[],
  customers: Customer[]
): Promise<{ success: boolean; message: string; error?: string }> => {
  try {
    const fileName = `Arden_Backup_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Create backup file
    const wb = createBackupData(orders, customers);
    const excelData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Create blob and convert to base64
    const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const reader = new FileReader();

    return new Promise((resolve) => {
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string;
          
          // Send message to Telegram
          const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
          const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;

          if (!chatId || !botToken) {
            resolve({
              success: false,
              message: 'Chưa cấu hình Telegram (Chat ID hoặc Bot Token)',
              error: 'Missing Telegram config'
            });
            return;
          }

          // Gửi file qua Telegram
          const formData = new FormData();
          formData.append('chat_id', chatId);
          formData.append('document', blob, fileName);
          formData.append('caption', `📦 <b>Backup Dữ Liệu</b>\n\n<b>Ngày:</b> ${new Date().toLocaleString('vi-VN')}\n<b>Đơn hàng:</b> ${orders.length}\n<b>Khách hàng:</b> ${customers.length}`);
          formData.append('parse_mode', 'HTML');

          const response = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            resolve({
              success: true,
              message: `✅ Backup thành công! Đã gửi ${orders.length} đơn hàng và ${customers.length} khách hàng lên Telegram.\nFile: ${fileName}`
            });
          } else {
            const error = await response.json();
            resolve({
              success: false,
              message: `❌ Gửi file thất bại: ${error.description || 'Unknown error'}`,
              error: error.description
            });
          }
        } catch (error: any) {
          resolve({
            success: false,
            message: `❌ Lỗi: ${error.message}`,
            error: error.message
          });
        }
      };

      reader.readAsArrayBuffer(blob);
    });
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Lỗi tạo backup: ${error.message}`,
      error: error.message
    };
  }
};

/**
 * Send backup notification to Telegram with detailed stats
 */
export const sendBackupNotification = async (orders: Order[], customers: Customer[]) => {
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalDeposit = orders.reduce((sum, o) => sum + (o.depositAmount || 0), 0);
  const outstanding = totalRevenue - totalDeposit;
  const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);
  const deliveredItems = orders.reduce((sum, o) => sum + (o.actualDeliveryQuantity || 0), 0);

  const message = `
📊 <b>BACKUP DỮ LIỆU ĐỊNH KỲ</b>

<b>⏰ Thời gian:</b> ${new Date().toLocaleString('vi-VN')}

<b>📈 THỐNG KÊ TỔNG QUAN</b>
• Tổng đơn hàng: <b>${orders.length}</b>
• Tổng khách hàng: <b>${customers.length}</b>

<b>💼 PHÂN BỐ TRẠNG THÁI ĐƠN HÀNG</b>
• ⏳ Chờ xử lý: ${orders.filter(o => o.status === 'Chờ xử lý').length}
• ⚙️ Đang SX: ${orders.filter(o => o.status === 'Đang SX').length}
• ✅ Hoàn thành: ${orders.filter(o => o.status === 'Hoàn thành').length}
• ❌ Đã hủy: ${orders.filter(o => o.status === 'Đã hủy').length}

<b>💰 THÔNG TIN TÀI CHÍNH</b>
• Doanh thu: <b>${totalRevenue.toLocaleString('vi-VN')} đ</b>
• Đã thu tiền cọc: <b>${totalDeposit.toLocaleString('vi-VN')} đ</b>
• Công nợ phải thu: <b>${outstanding.toLocaleString('vi-VN')} đ</b>

<b>📦 TIẾN ĐỘ SẢN XUẤT</b>
• Tổng sản phẩm: <b>${totalItems}</b>
• Đã giao: <b>${deliveredItems}</b>
• Tiến độ: <b>${totalItems > 0 ? Math.round((deliveredItems / totalItems) * 100) : 0}%</b>

<b>📁 File Backup:</b> Arden_Backup_${new Date().toISOString().split('T')[0]}.xlsx
  `;

  return await sendTelegramMessage(message);
};

/**
 * Send restoration success message to Telegram
 */
export const sendRestoreNotification = async (orders: Order[], customers: Customer[]) => {
  const message = `
✅ <b>KHÔI PHỤC DỮ LIỆU THÀNH CÔNG</b>

<b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}
<b>Đã khôi phục:</b> ${orders.length} đơn hàng, ${customers.length} khách hàng

Hệ thống đã được cập nhật dữ liệu từ file backup.
  `;

  return await sendTelegramMessage(message);
};
