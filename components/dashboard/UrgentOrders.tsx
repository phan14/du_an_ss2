import React from 'react';
import { Order, Customer } from '../../types';

interface UrgentOrdersProps {
  orders: Order[];
  customers: Customer[];
  onNavigate: (id: string) => void;
}

const UrgentOrders: React.FC<UrgentOrdersProps> = ({ orders, customers, onNavigate }) => {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth()+1}`;
  };

  const getDaysLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        Cần Xử Lý Gấp
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {orders.length === 0 ? (
          <div className="text-center text-slate-400 py-8 text-sm">Tuyệt vời! Không có đơn hàng quá hạn.</div>
        ) : (
          orders.map(order => {
            const customer = customers.find(c => c.id === order.customerId);
            const days = getDaysLeft(order.deadline);
            
            return (
              <div key={order.id} className="p-3 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100 transition-colors cursor-pointer" onClick={() => onNavigate(order.id)}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-700 text-sm">#{order.id}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${days < 0 ? 'bg-red-200 text-red-700' : 'bg-orange-200 text-orange-700'}`}>
                    {days < 0 ? `Trễ ${Math.abs(days)} ngày` : `${days} ngày nữa`}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-800 truncate mb-1">{customer?.name}</div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Hạn: {formatDate(order.deadline)}</span>
                  <span>{order.totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UrgentOrders;