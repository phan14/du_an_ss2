
import React from 'react';
import { Order, Customer } from '../../types';

interface OrderDetailModalProps {
  order: Order | null;
  customer: Customer | undefined;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, customer, onClose }) => {
  if (!order) return null;

  const formatNumber = (num: number) => num.toLocaleString('vi-VN');
  
  const formatDate = (isoDate: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalDelivered = order.deliveryHistory?.reduce((sum, rec) => sum + rec.quantity, 0) || 0;
  
  const deposit = order.depositAmount || 0;
  const paidInDeliveries = order.deliveryHistory?.reduce((sum, rec) => sum + (rec.paymentReceived || 0), 0) || 0;
  const totalPaid = deposit + paidInDeliveries;
  const remaining = order.totalAmount - totalPaid;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
       <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in overflow-hidden">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
             <div>
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                   Đơn Hàng #{order.id}
                   <span className={`text-sm px-3 py-1 rounded-full border ${
                      order.status === 'Hoàn thành' ? 'bg-green-100 text-green-700 border-green-200' :
                      order.status === 'Đã hủy' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-blue-100 text-blue-700 border-blue-200'
                   }`}>
                      {order.status}
                   </span>
                </h3>
                <p className="text-slate-500 text-sm mt-1">Ngày tạo: {formatDate(order.createdAt)}</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
             
             {/* 1. General Info Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Info */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                   <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Thông Tin Khách Hàng</h4>
                   <div className="space-y-2">
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                         <span className="text-slate-500">Họ tên:</span>
                         <span className="font-semibold text-slate-800">{customer?.name || 'Khách vãng lai'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                         <span className="text-slate-500">Điện thoại:</span>
                         <span className="font-medium text-slate-800">{customer?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                         <span className="text-slate-500">Email:</span>
                         <span className="text-slate-800">{customer?.email || 'N/A'}</span>
                      </div>
                      <div className="pt-1">
                         <span className="text-slate-500 block text-sm mb-1">Địa chỉ:</span>
                         <span className="text-slate-800 font-medium block">{customer?.address || 'N/A'}</span>
                      </div>
                   </div>
                </div>

                {/* Order Meta */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                   <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Thông Tin Sản Xuất</h4>
                   <div className="space-y-2">
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                         <span className="text-slate-500">Hạn giao hàng:</span>
                         <span className="font-bold text-red-600">{formatDate(order.deadline)}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                         <span className="text-slate-500">Tổng số lượng:</span>
                         <span className="font-semibold text-slate-800">{formatNumber(totalQuantity)} cái</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                         <span className="text-slate-500">Đã giao:</span>
                         <span className={`font-bold ${totalDelivered >= totalQuantity ? 'text-green-600' : 'text-blue-600'}`}>
                            {formatNumber(totalDelivered)} cái
                         </span>
                      </div>
                       <div className="pt-1">
                         <span className="text-slate-500 block text-sm mb-1">Tiến độ:</span>
                         <div className="w-full bg-slate-100 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, (totalDelivered/totalQuantity)*100)}%` }}></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* 2. Product List */}
             <div>
                <h4 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-blue-500 pl-3">Chi Tiết Sản Phẩm</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600 font-medium uppercase text-xs">
                         <tr>
                            <th className="px-4 py-3">STT</th>
                            <th className="px-4 py-3">Ảnh</th>
                            <th className="px-4 py-3">Mã Sản Phẩm</th>
                            <th className="px-4 py-3">Tên Sản Phẩm</th>
                            <th className="px-4 py-3">Size</th>
                            <th className="px-4 py-3">Màu Sắc</th>
                            <th className="px-4 py-3 text-right">Số Lượng</th>
                            <th className="px-4 py-3 text-right">Đơn Giá</th>
                            <th className="px-4 py-3 text-right">Thành Tiền</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {order.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                               <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                               <td className="px-4 py-3">
                                  {item.imageUrl ? (
                                     <img src={item.imageUrl} alt="Product" className="w-10 h-10 object-cover rounded border border-slate-200" />
                                  ) : (
                                     <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-400">No img</div>
                                  )}
                               </td>
                               <td className="px-4 py-3 font-bold text-blue-600 text-xs">{item.productId || '-'}</td>
                               <td className="px-4 py-3 font-medium text-slate-800">{item.productName}</td>
                               <td className="px-4 py-3 text-slate-600">{item.size}</td>
                               <td className="px-4 py-3 text-slate-600">{item.color || '-'}</td>
                               <td className="px-4 py-3 text-right font-medium">{formatNumber(item.quantity)}</td>
                               <td className="px-4 py-3 text-right text-slate-500">{formatNumber(item.unitPrice)}</td>
                               <td className="px-4 py-3 text-right font-bold text-slate-800">{formatNumber(item.quantity * item.unitPrice)}</td>
                            </tr>
                         ))}
                      </tbody>
                      <tfoot className="bg-slate-50">
                         <tr>
                            <td colSpan={6} className="px-4 py-3 text-right font-bold text-slate-700 uppercase">Tổng cộng:</td>
                            <td className="px-4 py-3 text-right font-bold text-blue-700 text-lg">{formatNumber(order.totalAmount)} đ</td>
                         </tr>
                      </tfoot>
                   </table>
                </div>
             </div>

             {/* 3. Financials & Delivery History */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Financial Breakdown */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tài Chính
                    </h4>
                    <div className="space-y-3 text-sm">
                       <div className="flex justify-between items-center">
                          <span className="text-slate-600">Tổng giá trị đơn hàng:</span>
                          <span className="font-bold text-slate-800 text-base">{formatNumber(order.totalAmount)} đ</span>
                       </div>
                       <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100">
                          <span>Đã đặt cọc:</span>
                          <span className="font-bold">+ {formatNumber(deposit)} đ</span>
                       </div>
                       <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100">
                          <span>Thanh toán qua các đợt giao:</span>
                          <span className="font-bold">+ {formatNumber(paidInDeliveries)} đ</span>
                       </div>
                       <div className="border-t border-slate-300 my-2"></div>
                       <div className="flex justify-between items-center">
                          <span className="text-slate-800 font-bold uppercase">Còn lại phải thu:</span>
                          <span className={`font-bold text-xl ${remaining > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                             {formatNumber(remaining)} đ
                          </span>
                       </div>
                    </div>
                </div>

                {/* Delivery History Log */}
                <div>
                   <h4 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-indigo-500 pl-3">Lịch Sử Giao Hàng</h4>
                   <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                      {(!order.deliveryHistory || order.deliveryHistory.length === 0) ? (
                         <div className="p-4 text-center text-slate-400 italic text-sm">Chưa có đợt giao hàng nào.</div>
                      ) : (
                         <table className="w-full text-sm">
                            <thead className="bg-slate-100 text-slate-600 font-medium text-xs sticky top-0">
                               <tr>
                                  <th className="px-3 py-2 text-left">Ngày</th>
                                  <th className="px-3 py-2 text-center">SL</th>
                                  <th className="px-3 py-2 text-right">Thanh toán</th>
                                  <th className="px-3 py-2 text-left">Ghi chú</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                               {order.deliveryHistory.map((rec) => (
                                  <tr key={rec.id}>
                                     <td className="px-3 py-2 text-slate-600">{formatDate(rec.date)}</td>
                                     <td className="px-3 py-2 text-center font-bold text-blue-600">{formatNumber(rec.quantity)}</td>
                                     <td className="px-3 py-2 text-right text-emerald-600 font-medium">
                                        {rec.paymentReceived ? formatNumber(rec.paymentReceived) : '-'}
                                     </td>
                                     <td className="px-3 py-2 text-slate-500 italic truncate max-w-[150px]">{rec.notes}</td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      )}
                   </div>
                </div>
             </div>

             {/* 4. Notes & Analysis */}
             <div className="space-y-4">
                {order.notes && (
                   <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-sm">
                      <span className="font-bold text-amber-800 block mb-1">Ghi chú đơn hàng:</span>
                      <p className="text-amber-900">{order.notes}</p>
                   </div>
                )}
                {order.statusReason && (
                   <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm">
                      <span className="font-bold text-red-800 block mb-1">Lý do trạng thái ({order.status}):</span>
                      <p className="text-red-900">{order.statusReason}</p>
                   </div>
                )}
                {order.aiAnalysis && (
                   <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-sm">
                      <span className="font-bold text-indigo-800 block mb-1">Phân tích AI:</span>
                      <p className="text-indigo-900 whitespace-pre-line">{order.aiAnalysis}</p>
                   </div>
                )}
             </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
             <button 
               onClick={onClose}
               className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium transition-colors"
             >
                Đóng
             </button>
          </div>
       </div>
    </div>
  );
};

export default OrderDetailModal;
