
export enum OrderStatus {
  PENDING = 'Chờ xử lý',
  IN_PROGRESS = 'Đang sản xuất',
  COMPLETED = 'Hoàn thành',
  CANCELLED = 'Đã hủy'
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  productId?: string; // Format: CUSTOMERNAME_PRODUCTNAME
  productName: string;
  quantity: number;
  size: string;
  color?: string; // Product color
  unitPrice: number;
  imageUrl?: string; // Product photo URL
}

export interface DeliveryRecord {
  id: string;
  date: string;
  quantity: number;
  paymentReceived?: number; // Amount paid in this specific delivery
  notes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  depositAmount?: number; // Advance deposit from customer
  status: OrderStatus;
  deadline: string;
  createdAt: string;
  notes?: string;
  aiAnalysis?: string;
  
  // Tracking fields
  actualDeliveryQuantity?: number; // Keeps the total sum for easy display
  deliveryHistory?: DeliveryRecord[]; // List of partial deliveries
  statusReason?: string;
}

export interface GluingRecord {
  id: string;
  orderId: string;      // Linked to an Order
  productName: string;  // Snapshot of product name
  gluingType: string;   // e.g. Keo giấy, Keo vải, Keo mùng
  quantity: number;     // Total processed
  failQuantity?: number; // Defect quantity
  date: string;
  workerName?: string;  // Who performed the task
  
  // Technical Params
  temperature?: string; // e.g. 150
  pressure?: string;    // e.g. 4kg
  time?: string;        // e.g. 15s
  
  notes?: string;
}

export interface Product {
  name: string;
  unitPrice: number;
  lastUpdated: string;
  imageUrl?: string;
}

export type ViewState = 'DASHBOARD' | 'CUSTOMERS' | 'ORDERS' | 'CREATE_ORDER' | 'GLUING' | 'STAFF' | 'SYSTEM' | 'STATISTICS' | 'PRODUCTS';

// --- AUTH TYPES ---
export type UserRole = 'ADMIN' | 'STAFF';

export interface User {
  username: string;
  name: string;
  role: UserRole;
  password?: string; // Optional for display, required for storage logic
}
