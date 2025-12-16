import * as XLSX from 'xlsx';

const LAST_BACKUP_KEY = 'arden_last_backup_timestamp';

// List of all localStorage keys we want to backup
const DATA_KEYS = {
  customers: 'arden_customers',
  orders: 'arden_orders',
  users: 'arden_users',
  telegramConfig: 'arden_telegram_config'
};

export const isBackupDue = (): boolean => {
  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
  if (!lastBackup) return true; // Never backed up

  const timestamp = parseInt(lastBackup);
  if (isNaN(timestamp)) return true; // Corrupted timestamp

  const lastDate = new Date(timestamp);
  const now = new Date();
  
  // Difference in days
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

  return diffDays >= 7; // Due if >= 7 days
};

export const getLastBackupDate = (): string => {
  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
  if (!lastBackup) return 'Chưa sao lưu lần nào';
  const timestamp = parseInt(lastBackup);
  if (isNaN(timestamp)) return 'Không xác định';
  
  return new Date(timestamp).toLocaleString('vi-VN');
};

export const createBackupFile = (): void => {
  const workbook = XLSX.utils.book_new();

  // 1. Meta Sheet
  const metaData = [{
    version: '1.0',
    exportDate: new Date().toISOString(),
    appName: 'Arden Factory Manager'
  }];
  const metaSheet = XLSX.utils.json_to_sheet(metaData);
  XLSX.utils.book_append_sheet(workbook, metaSheet, 'Meta');

  // 2. Customers Sheet
  const customersStr = localStorage.getItem(DATA_KEYS.customers);
  if (customersStr) {
    const customers = JSON.parse(customersStr);
    const sheet = XLSX.utils.json_to_sheet(customers);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Customers');
  }

  // 3. Orders Sheet (Handle complex objects)
  const ordersStr = localStorage.getItem(DATA_KEYS.orders);
  if (ordersStr) {
    const orders = JSON.parse(ordersStr);
    // Flatten complex fields (items, deliveryHistory) to JSON strings to ensure integrity on restore
    const rows = orders.map((o: any) => ({
      ...o,
      items: JSON.stringify(o.items),
      deliveryHistory: JSON.stringify(o.deliveryHistory || []),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Orders');
  }

  // 4. Users Sheet
  const usersStr = localStorage.getItem(DATA_KEYS.users);
  if (usersStr) {
    const users = JSON.parse(usersStr);
    const sheet = XLSX.utils.json_to_sheet(users);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Users');
  }

  // 5. Config Sheet
  const configStr = localStorage.getItem(DATA_KEYS.telegramConfig);
  if (configStr) {
    const config = JSON.parse(configStr);
    const sheet = XLSX.utils.json_to_sheet([config]);
    XLSX.utils.book_append_sheet(workbook, sheet, 'TelegramConfig');
  }

  // Trigger Download
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Arden_Backup_${dateStr}.xlsx`);

  // Update timestamp
  localStorage.setItem(LAST_BACKUP_KEY, Date.now().toString());
};

export const restoreFromBackup = async (file: File): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        // Use 'array' type for consistency with modern Excel files
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Basic Validation
        if (!workbook.SheetNames.includes('Meta') && !workbook.SheetNames.includes('Orders')) {
             resolve({ success: false, message: 'File không hợp lệ: Không tìm thấy sheet dữ liệu.' });
             return;
        }

        // Restore Customers
        if (workbook.SheetNames.includes('Customers')) {
            const sheet = workbook.Sheets['Customers'];
            const customers = XLSX.utils.sheet_to_json(sheet);
            localStorage.setItem(DATA_KEYS.customers, JSON.stringify(customers));
        }

        // Restore Orders
        if (workbook.SheetNames.includes('Orders')) {
            const sheet = workbook.Sheets['Orders'];
            const rawOrders = XLSX.utils.sheet_to_json(sheet);
            // Parse JSON strings back to objects
            const orders = rawOrders.map((o: any) => ({
                ...o,
                items: safeJsonParse(o.items),
                deliveryHistory: safeJsonParse(o.deliveryHistory),
                // Ensure number fields are numbers
                totalAmount: Number(o.totalAmount || 0),
                depositAmount: Number(o.depositAmount || 0),
                actualDeliveryQuantity: Number(o.actualDeliveryQuantity || 0)
            }));
            localStorage.setItem(DATA_KEYS.orders, JSON.stringify(orders));
        }

        // Restore Users
        if (workbook.SheetNames.includes('Users')) {
            const sheet = workbook.Sheets['Users'];
            const users = XLSX.utils.sheet_to_json(sheet);
            localStorage.setItem(DATA_KEYS.users, JSON.stringify(users));
        }

        // Restore Config
        if (workbook.SheetNames.includes('TelegramConfig')) {
            const sheet = workbook.Sheets['TelegramConfig'];
            const configData = XLSX.utils.sheet_to_json(sheet);
            if (configData.length > 0) {
                localStorage.setItem(DATA_KEYS.telegramConfig, JSON.stringify(configData[0]));
            }
        }

        resolve({ success: true, message: 'Khôi phục dữ liệu từ Excel thành công!' });
      } catch (err) {
        console.error(err);
        resolve({ success: false, message: 'Lỗi khi đọc file Excel: ' + (err as any).message });
      }
    };
    
    // Read as ArrayBuffer for better .xlsx compatibility
    reader.readAsArrayBuffer(file);
  });
};

const safeJsonParse = (str: any) => {
    try {
        if (typeof str !== 'string') return str;
        return JSON.parse(str);
    } catch {
        return [];
    }
};