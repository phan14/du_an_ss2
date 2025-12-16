import React, { useState, useEffect } from 'react';
import { GluingRecord, Order } from '../../types';

interface GluingFormModalProps {
  currentRecord: Partial<GluingRecord>;
  orders: Order[];
  onSave: (record: GluingRecord) => void;
  onCancel: () => void;
}

const GluingFormModal: React.FC<GluingFormModalProps> = ({ currentRecord, orders, onSave, onCancel }) => {
  const [orderId, setOrderId] = useState('');
  const [productName, setProductName] = useState('');
  const [gluingType, setGluingType] = useState('Keo giấy');
  const [quantity, setQuantity] = useState(0);
  const [failQuantity, setFailQuantity] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [workerName, setWorkerName] = useState('');
  const [notes, setNotes] = useState('');

  const isEdit = !!currentRecord.id;

  // Initialize form
  useEffect(() => {
    if (currentRecord) {
      setOrderId(currentRecord.orderId || '');
      setProductName(currentRecord.productName || '');
      setGluingType(currentRecord.gluingType || 'Keo giấy');
      setQuantity(currentRecord.quantity || 0);
      setFailQuantity(currentRecord.failQuantity || 0);
      setWorkerName(currentRecord.workerName || '');
      setNotes(currentRecord.notes || '');

      if (currentRecord.date) {
        setDate(new Date(currentRecord.date).toISOString().split('T')[0]);
      }
    }
  }, [currentRecord]);

  // When order selection changes, auto-fill product name if possible
  const handleOrderChange = (newOrderId: string) => {
    setOrderId(newOrderId);
    const selectedOrder = orders.find(o => o.id === newOrderId);
    if (selectedOrder && selectedOrder.items.length > 0) {
      setProductName(selectedOrder.items.map(i => i.productName).join(', '));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: currentRecord.id, // If undefined, parent component handles new ID
      orderId,
      productName,
      gluingType,
      quantity,
      failQuantity,
      date: new Date(date).toISOString(),
      workerName,
      // Removed technical params: temperature, pressure, time
      notes
    } as GluingRecord);
  };

  const formatNumber = (num: number) => num.toLocaleString('vi-VN');
  const parseNumberInput = (value: string) => {
    return parseInt(value.replace(/\./g, '').replace(/\D/g, '')) || 0;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-slate-800">
            {isEdit ? 'Cập Nhật Thông Tin Ủi Keo' : 'Thêm Mới Thông Tin Ủi Keo'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Order & Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Đơn Hàng *</label>
              <select 
                required
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={orderId}
                onChange={(e) => handleOrderChange(e.target.value)}
                disabled={isEdit}
              >
                <option value="">-- Chọn Đơn Hàng --</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                      #{o.id} - {o.items[0]?.productName} ({o.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sản Phẩm (Ngữ cảnh)</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Tên sản phẩm..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày Thực Hiện</label>
                <input 
                  type="date"
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Người Thực Hiện</label>
                <input 
                  type="text"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  placeholder="Tên công nhân"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loại Keo / Vị Trí</label>
                <input 
                  type="text"
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={gluingType}
                  onChange={(e) => setGluingType(e.target.value)}
                  placeholder="VD: Keo giấy cổ, Keo vải tay..."
                  list="gluing-types"
                />
                <datalist id="gluing-types">
                    <option value="Keo giấy" />
                    <option value="Keo vải" />
                    <option value="Keo mùng" />
                    <option value="Keo tan" />
                    <option value="Cổ áo" />
                    <option value="Măng sét" />
                    <option value="Nẹp áo" />
                </datalist>
            </div>
            <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Số Lượng Tổng (Cái)</label>
                <input 
                  type="text"
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold text-blue-600"
                  value={quantity === 0 ? '' : formatNumber(quantity)}
                  onChange={(e) => setQuantity(parseNumberInput(e.target.value))}
                  placeholder="0"
                />
            </div>
          </div>

          {/* Simplified QC Section - Removed technical parameters */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
             <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Kiểm Soát Chất Lượng (QC)</h4>
             <div>
                <label className="block text-sm font-medium text-red-600 mb-1">Số Lượng Hàng Lỗi (Cái)</label>
                <input 
                    type="text" 
                    className="w-full p-2 border border-red-300 bg-red-50 text-red-700 rounded text-sm font-semibold" 
                    placeholder="0"
                    value={failQuantity === 0 ? '' : formatNumber(failQuantity)}
                    onChange={e => setFailQuantity(parseNumberInput(e.target.value))}
                />
                <p className="text-xs text-slate-500 mt-1">Số lượng đạt sẽ tự động tính = Tổng - Lỗi</p>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ghi Chú</label>
            <textarea 
              className="w-full p-2 border border-slate-300 rounded-lg"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Lưu ý về kỹ thuật hoặc vấn đề phát sinh..."
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md shadow-blue-200"
            >
              Lưu Thông Tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GluingFormModal;