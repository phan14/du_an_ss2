
import { supabase } from './supabaseClient';
import { Customer, Order, OrderStatus, GluingRecord } from '../types';

// --- SUPABASE STORAGE IMPLEMENTATION ---

// 1. CUSTOMERS
export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase.from('customers').select('*');
  if (error) {
    console.error('Error fetching customers:', error.message, error.details || '');
    return [];
  }
  // Map snake_case (DB) to camelCase (App)
  return data.map((c: any) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    address: c.address,
    notes: c.notes,
    createdAt: c.created_at
  }));
};

export const saveCustomer = async (customer: Customer): Promise<void> => {
  const dbCustomer = {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    notes: customer.notes,
    created_at: customer.createdAt
  };

  const { error } = await supabase
    .from('customers')
    .upsert(dbCustomer, { onConflict: 'id' });

  if (error) {
    console.error("Error saving customer:", error.message);
    throw error;
  }
};

export const saveCustomersBulk = async (newCustomers: Customer[]): Promise<void> => {
  if (newCustomers.length === 0) return;
  const dbCustomers = newCustomers.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    address: c.address,
    notes: c.notes,
    created_at: c.createdAt
  }));

  const { error } = await supabase.from('customers').upsert(dbCustomers, { onConflict: 'id' });
  if (error) {
    console.error("Error saving customers bulk:", error.message);
    throw error;
  }
};

export const deleteCustomer = async (id: string): Promise<void> => {
  // Database has 'ON DELETE CASCADE', so deleting customer will automatically delete their orders.
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) {
    console.error("Error deleting customer:", error.message);
    throw error;
  }
};

// 2. ORDERS
export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching orders:', error.message, error.details || '');
    return [];
  }
  
  // Map DB columns to App types
  return data.map((o: any) => ({
    id: o.id,
    customerId: o.customer_id,
    items: o.items || [], // JSONB auto-parsed
    totalAmount: o.total_amount || 0,
    depositAmount: o.deposit_amount || 0,
    status: o.status as OrderStatus,
    deadline: o.deadline,
    createdAt: o.created_at,
    notes: o.notes,
    aiAnalysis: o.ai_analysis,
    actualDeliveryQuantity: o.actual_delivery_quantity || 0,
    deliveryHistory: o.delivery_history || [], // JSONB auto-parsed
    statusReason: o.status_reason
  }));
};

export const saveOrder = async (order: Order): Promise<void> => {
  const dbOrder = {
    id: order.id,
    customer_id: order.customerId,
    items: order.items, // Supabase handles JSONB
    total_amount: order.totalAmount,
    deposit_amount: order.depositAmount,
    status: order.status,
    deadline: order.deadline,
    created_at: order.createdAt,
    notes: order.notes,
    ai_analysis: order.aiAnalysis,
    actual_delivery_quantity: order.actualDeliveryQuantity,
    delivery_history: order.deliveryHistory || [],
    status_reason: order.statusReason
  };

  const { error } = await supabase
    .from('orders')
    .upsert(dbOrder, { onConflict: 'id' });

  if (error) {
    console.error("Error saving order:", error.message);
    throw error;
  }
};

export const saveOrdersBulk = async (newOrders: Order[]): Promise<void> => {
  if (newOrders.length === 0) return;
  const dbOrders = newOrders.map(order => ({
    id: order.id,
    customer_id: order.customerId,
    items: order.items,
    total_amount: order.totalAmount,
    deposit_amount: order.depositAmount,
    status: order.status,
    deadline: order.deadline,
    created_at: order.createdAt,
    notes: order.notes,
    ai_analysis: order.aiAnalysis,
    actual_delivery_quantity: order.actualDeliveryQuantity,
    delivery_history: order.deliveryHistory || [],
    status_reason: order.statusReason
  }));

  const { error } = await supabase.from('orders').upsert(dbOrders, { onConflict: 'id' });
  if (error) {
    console.error("Error saving orders bulk:", error.message);
    throw error;
  }
};

export const deleteOrder = async (id: string): Promise<void> => {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) {
    console.error("Error deleting order:", error.message);
    throw error;
  }
};

// 3. GLUING RECORDS
export const getGluingRecords = async (): Promise<GluingRecord[]> => {
  const { data, error } = await supabase.from('gluing_records').select('*').order('date', { ascending: false });
  if (error) {
    console.error('Error fetching gluing records:', error.message);
    return [];
  }
  
  return data.map((r: any) => ({
    id: r.id,
    orderId: r.order_id,
    productName: r.product_name,
    gluingType: r.gluing_type,
    quantity: r.quantity || 0,
    failQuantity: r.fail_quantity || 0,
    date: r.date,
    workerName: r.worker_name,
    notes: r.notes
  }));
};

export const saveGluingRecord = async (record: GluingRecord): Promise<void> => {
  const dbRecord = {
    id: record.id,
    order_id: record.orderId,
    product_name: record.productName,
    gluing_type: record.gluingType,
    quantity: record.quantity,
    fail_quantity: record.failQuantity,
    date: record.date,
    worker_name: record.workerName,
    notes: record.notes
  };

  const { error } = await supabase.from('gluing_records').upsert(dbRecord, { onConflict: 'id' });
  if (error) {
    console.error("Error saving gluing record:", error.message);
    throw error;
  }
};

export const deleteGluingRecord = async (id: string): Promise<void> => {
  const { error } = await supabase.from('gluing_records').delete().eq('id', id);
  if (error) {
    console.error("Error deleting gluing record:", error.message);
    throw error;
  }
};
