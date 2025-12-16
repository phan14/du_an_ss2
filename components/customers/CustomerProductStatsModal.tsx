import React, { useMemo } from 'react';
import { Customer, Order } from '../../types';

interface CustomerProductStatsModalProps {
  customer: Customer;
  orders: Order[]; // These should be filtered for this customer already
  onClose: () => void;
}

interface ProductStat {
  quantity: number;
  revenue: number;
  orderCount: number;
}

interface MonthlyStats {
  [productName: string]: ProductStat;
}

interface TimelineStats {
  [timeKey: string]: MonthlyStats;
}

const CustomerProductStatsModal: React.FC<CustomerProductStatsModalProps> = ({ customer, orders, onClose }) => {
  
  // Aggregation Logic
  const timelineData = useMemo(() => {
    const stats: TimelineStats = {};

    orders.forEach(order => {
      if (order.status === 'Đã hủy') return; // Skip cancelled orders

      const date = new Date(order.createdAt);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const timeKey = `${month}/${year}`;

      if (!stats[timeKey]) {
        stats[timeKey] = {};
      }

      order.items.forEach(item => {
        const pName = item.productName.trim();
        
        if (!stats[timeKey][pName]) {
          stats[timeKey][pName] = { quantity: 0, revenue: 0, orderCount: 0 };
        }

        stats[timeKey][pName].quantity += item.quantity;
        stats[timeKey][pName].revenue += (item.quantity * item.unitPrice);
        stats[timeKey][pName].orderCount += 1;
      });
    });

    // Sort keys descending (newest month first)
    return Object.entries(stats)
      .sort((a, b) => {
        const [m1, y1] = a[0].split('/').map(Number);
        const [m2, y2] = b[0].split('/').map(Number);
        if (y1 !== y2) return y2 - y1;
        return m2 - m1;
      }) as Array<[string, MonthlyStats]>;
  }, [orders]);

  const formatNumber = (num: number) => num.toLocaleString('vi-VN');

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Thống Kê Sản Phẩm</h3>
            <p className="text-slate-500 text-sm">Khách hàng: <span className="font-semibold text-blue-600">{customer.name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {timelineData.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>Khách hàng này chưa có đơn hàng nào.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {timelineData.map(([timeKey, products]) => {
                // Calculate month totals
                const productValues = Object.values(products) as ProductStat[];
                const totalMonthQty = productValues.reduce((sum, p) => sum + (p?.quantity || 0), 0);
                const totalMonthRev = productValues.reduce((sum, p) => sum + (p?.revenue || 0), 0);

                return (
                  <div key={timeKey} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-bold text-indigo-900 text-lg">Tháng {timeKey}</span>
                      </div>
                      <div className="text-right text-sm">
                        <span className="text-slate-500 mr-4">Tổng SL: <span className="font-bold text-slate-800">{formatNumber(totalMonthQty)}</span></span>
                        <span className="text-slate-500">Doanh thu: <span className="font-bold text-emerald-600">{formatNumber(totalMonthRev)} đ</span></span>
                      </div>
                    </div>
                    
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3">Tên Sản Phẩm</th>
                          <th className="px-6 py-3 text-center">Số Lần Đặt</th>
                          <th className="px-6 py-3 text-right">Tổng Số Lượng</th>
                          <th className="px-6 py-3 text-right">Tổng Giá Trị</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(products).map(([name, stat], idx) => {
                          const s = stat as ProductStat;
                          return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-6 py-3 font-medium text-slate-700">{name}</td>
                            <td className="px-6 py-3 text-center text-slate-500">{s.orderCount}</td>
                            <td className="px-6 py-3 text-right font-bold text-blue-600">{formatNumber(Number(s.quantity || 0))}</td>
                            <td className="px-6 py-3 text-right text-slate-600">{formatNumber(Number(s.revenue || 0))}</td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProductStatsModal;
