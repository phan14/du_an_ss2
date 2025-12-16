
import React from 'react';
import { Order, Customer, OrderStatus } from '../../types';

interface RecentOrdersTableProps {
  orders: Order[];
  customers: Customer[];
  onViewAll?: () => void;
}

const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({ orders, customers, onViewAll }) => {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700';
      case OrderStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Đơn Hàng Gần Đây</h3>
        <button 
          onClick={onViewAll}
          className="text-sm text-blue-600 font-medium hover:underline cursor-pointer"
        >
          Xem tất cả
        </button>
      </div>
      
      {/* DESKTOP TABLE */}
      <div className="overflow-x-auto flex-1 hidden md:block">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">Mã Đơn</th>
              <th className="px-6 py-4">Khách Hàng</th>
              <th className="px-6 py-4">Tổng Tiền</th>
              <th className="px-6 py-4">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map(order => {
              const customer = customers.find(c => c.id === order.customerId);
              return (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">#{order.id}</td>
                  <td className="px-6 py-4 text-slate-600">{customer?.name || 'N/A'}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{order.totalAmount.toLocaleString('vi-VN')} đ</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Chưa có đơn hàng nào.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST VIEW */}
      <div className="md:hidden flex-1 overflow-y-auto">
        {orders.length === 0 ? (
           <div className="p-6 text-center text-slate-400 text-sm">Chưa có đơn hàng nào.</div>
        ) : orders.map(order => {
            const customer = customers.find(c => c.id === order.customerId);
            return (
              <div key={order.id} className="p-4 border-b border-slate-50 flex justify-between items-center last:border-0">
                 <div>
                    <div className="font-bold text-slate-700 text-sm">#{order.id}</div>
                    <div className="text-xs text-slate-500">{customer?.name}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-sm font-bold text-slate-800">{order.totalAmount.toLocaleString('vi-VN')} đ</div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                 </div>
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default RecentOrdersTable;
