import React from 'react';
import { Customer } from '../../types';

interface CustomerFormModalProps {
  currentCustomer: Partial<Customer>;
  setCurrentCustomer: (customer: Partial<Customer>) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEdit: boolean;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ 
  currentCustomer, 
  setCurrentCustomer, 
  onSave, 
  onCancel, 
  isEdit 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4">{isEdit ? 'Sửa Khách Hàng' : 'Thêm Khách Hàng Mới'}</h3>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Họ và Tên *</label>
            <input 
              type="text" 
              required
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 border p-2"
              value={currentCustomer.name || ''}
              onChange={e => setCurrentCustomer({...currentCustomer, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Số Điện Thoại *</label>
              <input 
                type="tel" 
                required
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 border p-2"
                value={currentCustomer.phone || ''}
                onChange={e => setCurrentCustomer({...currentCustomer, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input 
                type="email" 
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 border p-2"
                value={currentCustomer.email || ''}
                onChange={e => setCurrentCustomer({...currentCustomer, email: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Địa Chỉ</label>
            <input 
              type="text" 
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 border p-2"
              value={currentCustomer.address || ''}
              onChange={e => setCurrentCustomer({...currentCustomer, address: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;