
import React, { useState, useEffect } from 'react';
import { Customer, Order, OrderStatus, User } from '../../types';

interface OrderListProps {
  orders: Order[];
  customers: Customer[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: OrderStatus | 'ALL';
  setFilterStatus: (status: OrderStatus | 'ALL') => void;
  onZoomImage: (url: string) => void;
  onReportTelegram: (order: Order, daysLeft: number) => void;
  onOpenUpdateModal: (order: Order) => void;
  onGenerateEmail: (order: Order) => void;
  onDeleteOrder: (id: string) => void;
  onExportExcel: (filteredOrders: Order[]) => void;
  onViewDetail: (order: Order) => void;
  currentUser: User;
}

const ITEMS_PER_PAGE = 10;

const OrderList: React.FC<OrderListProps> = ({
  orders,
  customers,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  onZoomImage,
  onReportTelegram,
  onOpenUpdateModal,
  onGenerateEmail,
  onDeleteOrder,
  onExportExcel,
  onViewDetail,
  currentUser
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const formatNumber = (num: number) => num.toLocaleString('vi-VN');

  const getTotalQuantity = (orderItems: any[]) => {
    return orderItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getDaysRemaining = (deadlineStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadlineStr);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    const customer = customers.find(c => c.id === order.customerId);
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (currentPage <= 4) {
            pages.push(1, 2, 3, 4, 5, '...', totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
    }
    return pages;
  };

  const getStatusBadge = (status: OrderStatus) => {
    let classes = 'bg-slate-100 text-slate-700';
    if (status === OrderStatus.COMPLETED) classes = 'bg-green-100 text-green-700';
    if (status === OrderStatus.IN_PROGRESS) classes = 'bg-blue-100 text-blue-700';
    if (status === OrderStatus.CANCELLED) classes = 'bg-red-100 text-red-700';
    if (status === OrderStatus.PENDING) classes = 'bg-amber-100 text-amber-700';
    
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${classes}`}>
        {status}
      </span>
    );
  };

  return (
    <>
      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
              </div>
              <input 
                  type="text" 
                  placeholder="Tìm mã đơn / tên khách..."
                  className="pl-10 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-56">
              <select 
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'ALL')}
              >
                  <option value="ALL">Tất cả trạng thái</option>
                  {Object.values(OrderStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                  ))}
              </select>
            </div>
        </div>

        {/* Export Button */}
        <button
            onClick={() => onExportExcel(filteredOrders)}
            className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-2.5 rounded-lg font-medium transition-colors border border-emerald-200"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="md:inline">Xuất Excel</span>
        </button>
      </div>

      <div className="bg-transparent md:bg-white md:rounded-xl md:shadow-sm md:border md:border-slate-100 flex flex-col overflow-hidden">
        
        {/* === DESKTOP TABLE VIEW (Hidden on Mobile) === */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-semibold uppercase text-xs">
              <tr>
                <th className="px-4 py-4 w-20">Mã Đơn</th>
                <th className="px-4 py-4 w-28">Ngày Đặt</th>
                <th className="px-4 py-4">Ảnh / Sản Phẩm</th>
                <th className="px-4 py-4">Khách Hàng</th>
                <th className="px-4 py-4">Tài Chính</th>
                <th className="px-4 py-4">Tiến Độ / Trạng Thái</th>
                <th className="px-4 py-4">Hạn Giao / Cảnh Báo</th>
                <th className="px-4 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentOrders.length === 0 ? (
                <tr>
                   <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                     {orders.length === 0 ? "Chưa có đơn hàng nào." : "Không tìm thấy đơn hàng phù hợp."}
                   </td>
                </tr>
              ) : currentOrders.map(order => {
                const customer = customers.find(c => c.id === order.customerId);
                const totalQty = getTotalQuantity(order.items);
                const daysLeft = getDaysRemaining(order.deadline);
                const isUrgent = daysLeft < 3 && order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED;
                
                return (
                  <tr key={order.id} className={`transition-colors border-b border-slate-100 ${isUrgent ? 'bg-red-50 hover:bg-red-100' : 'bg-white hover:bg-slate-50'}`}>
                    <td className="px-4 py-4 align-top">
                      <span className="font-mono font-bold text-slate-800">#{order.id}</span>
                    </td>
                    <td className="px-4 py-4 align-top">
                       <div className="text-slate-600">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex gap-3">
                         {order.items[0]?.imageUrl ? (
                            <div 
                              className="w-12 h-12 rounded overflow-hidden border border-slate-200 flex-shrink-0 cursor-pointer group relative"
                              onClick={() => onZoomImage(order.items[0].imageUrl!)}
                            >
                              <img 
                                src={order.items[0].imageUrl} 
                                alt="Product" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                 </svg>
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-400 text-xs border border-slate-200 flex-shrink-0">
                              No Img
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 truncate">{order.items[0]?.productName}</div>
                            <div className="text-xs text-slate-500">
                               {order.items.length > 1 ? `+${order.items.length - 1} loại khác` : `Size: ${order.items[0]?.size}`}
                            </div>
                            <div className="text-xs text-blue-600 font-medium mt-1">
                               Giá: {formatNumber(order.items[0]?.unitPrice || 0)} đ
                            </div>
                          </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="font-medium text-slate-800">{customer?.name || 'Khách vãng lai'}</div>
                      <div className="text-xs text-slate-400">{customer?.phone}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                       <div className="text-blue-600 font-medium">{formatNumber(order.totalAmount)} đ</div>
                       {order.depositAmount ? (
                         <div className="text-xs text-emerald-600 font-medium mt-1">
                           Cọc: {formatNumber(order.depositAmount)}
                         </div>
                       ) : (
                         <div className="text-xs text-slate-400 mt-1 italic">Chưa cọc</div>
                       )}
                    </td>
                    <td className="px-4 py-4 align-top">
                       {getStatusBadge(order.status)}
                       <div className="text-xs text-slate-500 mb-1 mt-2">
                          Xong: <span className="font-semibold text-slate-800">{formatNumber(order.actualDeliveryQuantity || 0)}</span> / {formatNumber(totalQty)}
                       </div>
                       <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${Math.min(100, ((order.actualDeliveryQuantity || 0) / totalQty) * 100)}%` }}
                          ></div>
                       </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                       <div className="text-slate-700 font-medium">{formatDate(order.deadline)}</div>
                       {isUrgent && (
                         <div className="mt-2 flex flex-col items-start gap-1">
                            <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-white px-2 py-0.5 rounded border border-red-200 shadow-sm">
                              {daysLeft < 0 ? `Quá hạn ${Math.abs(daysLeft)} ngày` : `Gấp: Còn ${daysLeft} ngày`}
                            </span>
                         </div>
                       )}
                       <div className="mt-2 flex items-center gap-1">
                         <button 
                           onClick={() => onReportTelegram(order, daysLeft)}
                           className="text-xs bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-900 px-2 py-1 rounded border border-sky-200 flex items-center gap-1 font-medium transition-colors"
                           title="Gửi thông báo đến Telegram"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                             <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                           </svg>
                           Telegram
                         </button>
                       </div>
                       {order.statusReason && (
                          <div className="mt-1 text-xs text-slate-500 italic border-l-2 border-slate-300 pl-1 max-w-[150px]">
                            {order.statusReason}
                          </div>
                       )}
                    </td>
                    <td className="px-4 py-4 text-right align-top">
                      <div className="flex justify-end gap-1 flex-col sm:flex-row">
                        <button
                          onClick={() => onViewDetail(order)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200"
                          title="Xem chi tiết"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                             <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                             <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => onOpenUpdateModal(order)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100"
                          title="Cập nhật tiến độ"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => onGenerateEmail(order)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded border border-transparent hover:border-indigo-100"
                          title="Tạo Email AI"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                             <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                             <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                           </svg>
                        </button>
                        {currentUser.role === 'ADMIN' && (
                            <button 
                            onClick={() => onDeleteOrder(order.id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded border border-transparent hover:border-red-100"
                            title="Xóa"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* === MOBILE CARD VIEW (Shown only on Mobile) === */}
        <div className="md:hidden space-y-4">
          {currentOrders.length === 0 ? (
             <div className="text-center p-8 text-slate-400 bg-white rounded-xl border border-slate-100">
               {orders.length === 0 ? "Chưa có đơn hàng." : "Không tìm thấy đơn hàng."}
             </div>
          ) : currentOrders.map(order => {
             const customer = customers.find(c => c.id === order.customerId);
             const totalQty = getTotalQuantity(order.items);
             const daysLeft = getDaysRemaining(order.deadline);
             const isUrgent = daysLeft < 3 && order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED;

             return (
               <div key={order.id} className={`bg-white p-4 rounded-xl shadow-sm border ${isUrgent ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-100'}`}>
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-3 border-b border-slate-50 pb-2">
                     <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-lg">#{order.id}</span>
                          {isUrgent && (
                             <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${daysLeft < 0 ? 'bg-red-600' : 'bg-orange-500'}`}>
                               {daysLeft < 0 ? `Trễ ${Math.abs(daysLeft)}d` : `Còn ${daysLeft}d`}
                             </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{formatDate(order.createdAt)}</div>
                     </div>
                     {getStatusBadge(order.status)}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex gap-3 mb-3">
                     <div className="w-16 h-16 rounded overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100">
                        {order.items[0]?.imageUrl ? (
                           <img 
                              src={order.items[0].imageUrl} 
                              alt="Product" 
                              className="w-full h-full object-cover"
                              onClick={() => onZoomImage(order.items[0].imageUrl!)}
                           />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">No Img</div>
                        )}
                     </div>
                     <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-800 line-clamp-1">{order.items[0]?.productName}</div>
                        <div className="text-xs text-slate-500 mb-1">
                            {order.items.length > 1 ? `+${order.items.length - 1} SP khác` : `Size: ${order.items[0]?.size}`}
                        </div>
                        <div className="text-xs text-blue-600 font-medium mb-1">
                           Giá: {formatNumber(order.items[0]?.unitPrice || 0)} đ
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                           </svg>
                           {customer?.name || 'Khách vãng lai'}
                        </div>
                     </div>
                  </div>

                  {/* Finance & Progress */}
                  <div className="grid grid-cols-2 gap-3 mb-3 p-2 bg-slate-50 rounded-lg">
                     <div>
                        <div className="text-[10px] text-slate-500 uppercase">Tiến Độ</div>
                        <div className="text-sm font-medium text-slate-800">
                           {formatNumber(order.actualDeliveryQuantity || 0)} / {formatNumber(totalQty)}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase">Tổng Tiền</div>
                        <div className="text-sm font-bold text-blue-600">{formatNumber(order.totalAmount)}</div>
                     </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-50">
                     <button 
                        onClick={() => onViewDetail(order)}
                        className="flex flex-col items-center justify-center text-slate-600 py-1 hover:bg-slate-50 rounded"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-[10px]">Chi tiết</span>
                     </button>
                     <button 
                        onClick={() => onOpenUpdateModal(order)}
                        className="flex flex-col items-center justify-center text-blue-600 py-1 hover:bg-blue-50 rounded"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <span className="text-[10px]">Cập nhật</span>
                     </button>
                     <button 
                        onClick={() => onGenerateEmail(order)}
                        className="flex flex-col items-center justify-center text-indigo-600 py-1 hover:bg-indigo-50 rounded"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px]">Email</span>
                     </button>
                     {currentUser.role === 'ADMIN' && (
                         <button 
                            onClick={() => onDeleteOrder(order.id)}
                            className="flex flex-col items-center justify-center text-red-600 py-1 hover:bg-red-50 rounded"
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="text-[10px]">Xóa</span>
                         </button>
                     )}
                  </div>
               </div>
             );
          })}
        </div>

        {/* Pagination Footer (Shared) */}
        {filteredOrders.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-slate-200 bg-slate-50 gap-4 mt-auto">
                <span className="text-sm text-slate-500">
                    Hiển thị <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)}</span> / <span className="font-semibold">{filteredOrders.length}</span>
                </span>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        Trước
                    </button>
                    
                    <div className="flex gap-1">
                        {getPageNumbers().map((p, idx) => (
                            <button
                                key={idx}
                                onClick={() => typeof p === 'number' && setCurrentPage(p)}
                                disabled={p === '...'}
                                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                                    p === currentPage 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : p === '...' 
                                        ? 'text-slate-400 cursor-default' 
                                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        Sau
                    </button>
                </div>
            </div>
        )}
      </div>
    </>
  );
};

export default OrderList;
