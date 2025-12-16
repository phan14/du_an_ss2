import React, { useState } from 'react';
import { Customer, Order, User } from '../types';
import { saveCustomer, deleteCustomer } from '../services/storageService';
import { exportOrdersToExcel } from '../services/excelService';
import CustomerFormModal from './customers/CustomerFormModal';
import CustomerList from './customers/CustomerList';
import CustomerProductStatsModal from './customers/CustomerProductStatsModal';

interface CustomersProps {
  customers: Customer[];
  orders: Order[];
  refreshData: () => void;
  currentUser: User;
}

const Customers: React.FC<CustomersProps> = ({ customers, orders, refreshData, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [statsCustomer, setStatsCustomer] = useState<Customer | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer.name || !currentCustomer.phone) return;

    setIsSaving(true);
    try {
        const newCustomer: Customer = {
          id: currentCustomer.id || crypto.randomUUID(),
          name: currentCustomer.name,
          phone: currentCustomer.phone,
          email: currentCustomer.email || '',
          address: currentCustomer.address || '',
          notes: currentCustomer.notes || '',
          createdAt: currentCustomer.createdAt || new Date().toISOString(),
        };

        await saveCustomer(newCustomer);
        await refreshData(); // Wait for data reload
        setIsEditing(false);
        setCurrentCustomer({});
    } catch (err) {
        alert('Lỗi khi lưu khách hàng');
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      await deleteCustomer(id);
      refreshData();
    }
  };

  const handleExportOrders = (customer: Customer) => {
    const customerOrders = orders.filter(o => o.customerId === customer.id);
    if (customerOrders.length === 0) {
      alert(`Khách hàng ${customer.name} chưa có đơn hàng nào.`);
      return;
    }
    const fileName = `DonHang_${customer.name.replace(/\s+/g, '_')}.xlsx`;
    exportOrdersToExcel(customerOrders, customers, fileName);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Danh Sách Khách Hàng</h2>
        <button 
          onClick={() => { setCurrentCustomer({}); setIsEditing(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Thêm Khách Hàng
        </button>
      </div>

      {isEditing && (
        <div className="relative">
           {isSaving && (
               <div className="absolute inset-0 z-[60] bg-white/50 flex items-center justify-center rounded-xl">
                   <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
               </div>
           )}
            <CustomerFormModal 
            currentCustomer={currentCustomer}
            setCurrentCustomer={setCurrentCustomer}
            onSave={handleSubmit}
            onCancel={() => setIsEditing(false)}
            isEdit={!!currentCustomer.id}
            />
        </div>
      )}

      {statsCustomer && (
        <CustomerProductStatsModal 
            customer={statsCustomer}
            orders={orders.filter(o => o.customerId === statsCustomer.id)}
            onClose={() => setStatsCustomer(null)}
        />
      )}

      <CustomerList 
        customers={customers}
        onEdit={(customer) => { setCurrentCustomer(customer); setIsEditing(true); }}
        onDelete={handleDelete}
        onExport={handleExportOrders}
        onViewStats={setStatsCustomer}
        isAdmin={currentUser.role === 'ADMIN'}
      />
    </div>
  );
};

export default Customers;