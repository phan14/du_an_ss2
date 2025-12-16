import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, DeliveryRecord } from '../../types';
import { saveOrder } from '../../services/storageService';

interface OrderUpdateModalProps {
  editingOrder: Order | null;
  onCancel: () => void;
  onSave: () => void; 
}

const OrderUpdateModal: React.FC<OrderUpdateModalProps> = ({
  editingOrder,
  onCancel,
  onSave
}) => {
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [reason, setReason] = useState('');
  const [history, setHistory] = useState<DeliveryRecord[]>([]);
  
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newQty, setNewQty] = useState(0);
  const [newPayment, setNewPayment] = useState(0);
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingOrder) {
      setStatus(editingOrder.status);
      setReason(editingOrder.statusReason || '');
      setHistory(editingOrder.deliveryHistory || []);
    }
  }, [editingOrder]);

  if (!editingOrder) return null;

  const getTotalQuantity = (orderItems: any[]) => {
    return orderItems.reduce((sum, item) => sum + item.quantity, 0);
  };
  
  const totalOrdered = getTotalQuantity(editingOrder.items);
  const totalDelivered = history.reduce((sum, rec) => sum + rec.quantity, 0);
  const totalPaidInDeliveries = history.reduce((sum, rec) => sum + (rec.paymentReceived || 0), 0);
  const deposit = editingOrder.depositAmount || 0;
  
  const totalPaid = deposit + totalPaidInDeliveries;
  const remaining = editingOrder.totalAmount - totalPaid;

  const handleAddDelivery = () => {
    // Relaxed validation: Allow if there is a Note, OR if there is a Quantity, OR if there is Payment.
    if (newQty <= 0 && newPayment <= 0 && !newNote.trim()) {
      alert("Vui lòng nhập số lượng, số tiền, HOẶC ghi chú.");
      return;
    }
    if (!newDate) {
      alert("Vui lòng chọn ngày giao.");
      return;
    }
    
    if (newQty > 0 && totalDelivered + newQty > totalOrdered) {
        if (!window.confirm("Cảnh báo: Tổng số lượng giao lớn hơn số lượng đặt. Bạn có muốn tiếp tục?")) return;
    }

    const safeId = Date.now().toString() + Math.random().toString(36).substring(2, 9);

    const newRecord: DeliveryRecord = {
      id: safeId,
      date: new Date(newDate).toISOString(),
      quantity: newQty,
      paymentReceived: newPayment,
      notes: newNote
    };

    const updatedHistory = [...history, newRecord];
    updatedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setHistory(updatedHistory);
    // Reset inputs
    setNewQty(0);
    setNewPayment(0);
    setNewNote('');
  };

  const handleRemoveDelivery = (id: string) => {
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
  };

  const formatDate = (isoStr: string) => {
    try {
        const d = new Date(isoStr);
        return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
    } catch { return isoStr; }
  };

  const handleFinalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
        setIsSaving(true);
        try {
            const finalDeliveredQty = history.reduce((sum, rec) => sum + rec.quantity, 0);
            
            const updatedOrder: Order = {
                ...editingOrder,
                status: status,
                actualDeliveryQuantity: finalDeliveredQty,
                deliveryHistory: history,
                statusReason: reason
            };
            
            await saveOrder(updatedOrder);
            onSave(); // Refresh parent
        } catch (err) {
            alert('Lỗi khi lưu thay đổi.');
        } finally {
            setIsSaving(false);
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
       <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto relative">
          
          {/* Loading Overlay */}
          {isSaving && (
              <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-xl">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
          )}

          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <div>
                <h3 className="text-xl font-bold text-slate-800">Cập Nhật Tiến Độ #{editingOrder.id}</h3>
                <p className="text-sm text-slate-500">Quản lý giao hàng và thanh toán từng đợt</p>
            </div>
            <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>

          <form onSubmit={handleFinalSave}>
            {/* Finance Info Box */}
            <div className="mb-6 grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                    <div className="text-xs text-slate-500 uppercase font-semibold">Tổng Đơn Hàng</div>
                    <div className="text-lg font-bold text-slate-800">{editingOrder.totalAmount.toLocaleString('vi-VN')} đ</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1">
                        Đã Thanh Toán
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="text-lg font-bold text-emerald-600">
                        {totalPaid.toLocaleString('vi-VN')} đ
                    </div>
                    <div className="text-xs text-slate-400">(Cọc: {deposit.toLocaleString('vi-VN')} đ)</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 uppercase font-semibold">Còn Lại</div>
                    <div className={`text-lg font-bold ${remaining > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {remaining.toLocaleString('vi-VN')} đ
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Trạng Thái Đơn Hàng</label>
                        <select 
                            className="w-full p-2 border border-slate-300 rounded-lg"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as OrderStatus)}
                        >
                        {Object.values(OrderStatus).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                        Lý do / Ghi chú Trạng Thái
                        </label>
                        <textarea 
                            className="w-full p-2 border border-slate-300 rounded-lg"
                            rows={3}
                            placeholder="VD: Thiếu vải, máy hỏng, khách hoãn..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-800 font-semibold mb-1">Tiến độ giao hàng</div>
                        <div className="text-2xl font-bold text-blue-600">
                             {totalDelivered.toLocaleString('vi-VN')} <span className="text-sm text-blue-400 font-normal">/ {totalOrdered.toLocaleString('vi-VN')} cái</span>
                        </div>
                        <div className="w-full h-2 bg-blue-200 rounded-full mt-2 overflow-hidden">
                             <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${Math.min(100, (totalDelivered/totalOrdered)*100)}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm flex flex-col h-full">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0014 7z" />
                        </svg>
                        Thêm Đợt Giao / Thanh Toán
                    </h4>
                    
                    {/* Add New Delivery Form */}
                    <div className="mb-4 bg-slate-50 p-3 rounded border border-slate-200">
                        <div className="flex gap-2 mb-2">
                            <input 
                                type="date" 
                                className="w-1/2 p-2 border border-slate-300 rounded text-sm"
                                value={newDate}
                                onChange={e => setNewDate(e.target.value)}
                            />
                            <input 
                                type="number" 
                                placeholder="SL Giao"
                                className="w-1/2 p-2 border border-slate-300 rounded text-sm font-semibold text-blue-600"
                                value={newQty === 0 ? '' : newQty}
                                onChange={e => setNewQty(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="mb-2">
                            <input 
                                type="text" 
                                placeholder="Thanh toán đợt này (VNĐ)"
                                className="w-full p-2 border border-slate-300 rounded text-sm font-medium text-emerald-600"
                                value={newPayment === 0 ? '' : newPayment.toLocaleString('vi-VN')}
                                onChange={e => setNewPayment(parseInt(e.target.value.replace(/\D/g,'')) || 0)}
                            />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Ghi chú (VD: Giao xe anh Tuấn)"
                            className="w-full p-2 border border-slate-300 rounded text-sm mb-2"
                            value={newNote}
                            onChange={e => setNewNote(e.target.value)}
                        />
                        <button 
                            type="button"
                            onClick={handleAddDelivery}
                            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-2 rounded text-sm font-medium transition-colors shadow-sm"
                        >
                            + Xác Nhận
                        </button>
                    </div>

                    {/* History List */}
                    <div className="flex-1 overflow-y-auto max-h-48 space-y-2 border-t border-slate-100 pt-2">
                        {history.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm py-4 italic">Chưa có lịch sử giao hàng</div>
                        ) : (
                            history.map(rec => (
                                <div key={rec.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 text-sm group hover:border-blue-200 transition-colors">
                                    <div>
                                        <div className="font-medium text-slate-800">
                                            {formatDate(rec.date)} 
                                            {rec.quantity > 0 && (
                                                <>: <span className="text-blue-600 font-bold">{rec.quantity.toLocaleString('vi-VN')} cái</span></>
                                            )}
                                            {rec.paymentReceived && rec.paymentReceived > 0 && (
                                                <span className="ml-2 text-emerald-600 font-bold bg-emerald-50 px-1 rounded text-xs">
                                                    +{rec.paymentReceived.toLocaleString('vi-VN')} đ
                                                </span>
                                            )}
                                        </div>
                                        {rec.notes && <div className="text-xs text-slate-500">{rec.notes}</div>}
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveDelivery(rec.id)}
                                        className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                                        title="Xóa dòng này"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button 
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
              >
                Hủy Bỏ
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md shadow-blue-200 disabled:bg-blue-300"
              >
                {isSaving ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>
       </div>
    </div>
  );
};

export default OrderUpdateModal;