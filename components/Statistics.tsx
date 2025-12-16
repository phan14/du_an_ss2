
import React, { useState, useMemo } from 'react';
import { Customer, Order } from '../types';
import { exportCustomerStatsToExcel } from '../services/excelService';

interface StatisticsProps {
  customers: Customer[];
  orders: Order[];
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

const Statistics: React.FC<StatisticsProps> = ({ customers, orders }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Aggregation Logic
  const timelineData = useMemo(() => {
    if (!selectedCustomerId) return {};

    const stats: TimelineStats = {};
    const customerOrders = orders.filter(o => o.customerId === selectedCustomerId);

    customerOrders.forEach(order => {
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

    return stats;
  }, [orders, selectedCustomerId]);

  // Convert to sorted array for display
  const sortedTimeline = Object.entries(timelineData).sort((a, b) => {
    const [m1, y1] = a[0].split('/').map(Number);
    const [m2, y2] = b[0].split('/').map(Number);
    if (y1 !== y2) return y2 - y1;
    return m2 - m1;
  });

  const formatNumber = (num: number) => num.toLocaleString('vi-VN');

  const handleExport = () => {
    if (!selectedCustomer) return;
    const fileName = `ThongKe_${selectedCustomer.name.replace(/\s+/g, '_')}.xlsx`;
    exportCustomerStatsToExcel(selectedCustomer.name, timelineData, fileName);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Thống Kê Chi Tiết</h2>
        <p className="text-slate-500 text-sm">Phân tích số lượng sản phẩm đặt hàng theo tháng</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Chọn Khách Hàng</label>
            <select
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
                <option value="">-- Vui lòng chọn khách hàng --</option>
                {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                ))}
            </select>
        </div>

        {selectedCustomerId && (
            <button
                onClick={handleExport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 self-end"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Xuất Báo Cáo Excel
            </button>
        )}
      </div>

      {!selectedCustomerId ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg">Vui lòng chọn khách hàng để xem thống kê.</p>
          </div>
      ) : sortedTimeline.length === 0 ? (
           <div className="bg-white rounded-xl shadow-sm p-12 text-center text-slate-500">
               <p>Khách hàng này chưa có đơn hàng nào.</p>
           </div>
      ) : (
          <div className="space-y-8">
              {sortedTimeline.map(([timeKey, products]) => {
                  const totalMonthQty = Object.values(products).reduce((sum, p) => sum + p.quantity, 0);
                  const totalMonthRev = Object.values(products).reduce((sum, p) => sum + p.revenue, 0);

                  return (
                      <div key={timeKey} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                              <div className="flex items-center gap-3">
                                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                  </div>
                                  <span className="font-bold text-slate-800 text-lg">Tháng {timeKey}</span>
                              </div>
                              <div className="text-sm flex gap-4">
                                  <div className="bg-blue-50 px-3 py-1 rounded border border-blue-100">
                                      <span className="text-slate-500 mr-1">Tổng SL:</span>
                                      <span className="font-bold text-slate-800">{formatNumber(totalMonthQty)}</span>
                                  </div>
                                  <div className="bg-emerald-50 px-3 py-1 rounded border border-emerald-100">
                                      <span className="text-slate-500 mr-1">Doanh thu:</span>
                                      <span className="font-bold text-emerald-600">{formatNumber(totalMonthRev)} đ</span>
                                  </div>
                              </div>
                          </div>

                          <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left">
                                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                      <tr>
                                          <th className="px-6 py-3">Tên Sản Phẩm</th>
                                          <th className="px-6 py-3 text-center">Số Đơn Hàng</th>
                                          <th className="px-6 py-3 text-right">Tổng Số Lượng</th>
                                          <th className="px-6 py-3 text-right">Tổng Giá Trị</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                      {Object.entries(products).map(([name, stat], idx) => (
                                          <tr key={idx} className="hover:bg-slate-50">
                                              <td className="px-6 py-3 font-medium text-slate-700">{name}</td>
                                              <td className="px-6 py-3 text-center text-slate-500">{stat.orderCount}</td>
                                              <td className="px-6 py-3 text-right font-bold text-blue-600">{formatNumber(stat.quantity)}</td>
                                              <td className="px-6 py-3 text-right text-slate-600">{formatNumber(stat.revenue)}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  );
              })}
          </div>
      )}
    </div>
  );
};

export default Statistics;
