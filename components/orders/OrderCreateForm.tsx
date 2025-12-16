import React from 'react';
import { Customer, OrderItem } from '../../types';

interface OrderCreateFormProps {
  customers: Customer[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  orderDate: string;
  setOrderDate: (date: string) => void;
  productionDays: number;
  setProductionDays: (days: number) => void;
  deadline: string;
  setDeadline: (date: string) => void;
  depositAmount: number;
  setDepositAmount: (amount: number) => void;
  notes: string;
  setNotes: (notes: string) => void;
  items: OrderItem[];
  setItems: (items: OrderItem[]) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  aiResult: { materialEstimate: string; advice: string } | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

const OrderCreateForm: React.FC<OrderCreateFormProps> = ({
  customers,
  selectedCustomerId,
  setSelectedCustomerId,
  orderDate,
  setOrderDate,
  productionDays,
  setProductionDays,
  deadline,
  setDeadline,
  depositAmount,
  setDepositAmount,
  notes,
  setNotes,
  items,
  setItems,
  onCancel,
  onSubmit,
  aiResult,
  isAnalyzing,
  onAnalyze
}) => {
  const formatNumber = (num: number) => num.toLocaleString('vi-VN');
  
  // Helper to display DD-MM-YYYY
  const formatDisplayDate = (isoDate: string) => {
    if (!isoDate) return '';
    const parts = isoDate.split('-'); // YYYY-MM-DD
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // Helper to parse "1.000.000" -> 1000000
  const parseNumberInput = (value: string) => {
    return parseInt(value.replace(/\./g, '').replace(/\D/g, '')) || 0;
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productName: '', quantity: 1, size: 'M', unitPrice: 0, imageUrl: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateItem(index, 'imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Tạo Đơn Hàng Mới</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={onSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Khách Hàng</label>
              <select 
                required
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">-- Chọn khách hàng --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày Đặt (Bắt đầu)</label>
                  <input 
                  type="date"
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thời Gian (Ngày)</label>
                  <input 
                  type="number"
                  min="1"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={productionDays}
                  onChange={(e) => setProductionDays(parseInt(e.target.value) || 0)}
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hạn Giao (Dự kiến)</label>
                  <input 
                  type="text"
                  readOnly
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 font-medium"
                  value={formatDisplayDate(deadline)}
                  />
              </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiền Cọc (VNĐ)</label>
                <input 
                  type="text"
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium text-emerald-700"
                  value={depositAmount === 0 ? '' : formatNumber(depositAmount)}
                  onChange={(e) => setDepositAmount(parseNumberInput(e.target.value))}
                  placeholder="0"
                />
            </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi Chú Chung</label>
                <textarea 
                className="w-full p-2 border border-slate-300 rounded-lg"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú về đơn hàng..."
                />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Chi Tiết Sản Phẩm</h3>
            </div>
            
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 mb-4 items-start pb-4 border-b border-slate-50 last:border-0">
                <div className="col-span-5">
                  <label className="text-xs text-slate-500">Tên Sản Phẩm</label>
                  <input 
                    type="text" 
                    placeholder="VD: Áo sơ mi nam"
                    className="w-full p-2 border border-slate-300 rounded mb-2"
                    value={item.productName}
                    onChange={(e) => updateItem(idx, 'productName', e.target.value)}
                    required
                  />
                  
                  <label className="text-xs text-slate-500 block mb-1">Ảnh Mô Tả</label>
                  <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        placeholder="URL hoặc chọn ảnh..."
                        className="flex-1 p-2 border border-slate-300 rounded text-xs"
                        value={item.imageUrl || ''}
                        onChange={(e) => updateItem(idx, 'imageUrl', e.target.value)}
                      />
                        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 p-2 rounded border border-slate-300 shrink-0" title="Chọn ảnh từ máy">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(idx, e)}
                          />
                      </label>
                  </div>
                    {item.imageUrl && (
                      <div className="mt-2 relative w-16 h-16 border rounded overflow-hidden group">
                          <img src={item.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                              type="button"
                              onClick={() => updateItem(idx, 'imageUrl', '')}
                              className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                          </button>
                      </div>
                    )}
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500">Size</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-slate-300 rounded"
                    value={item.size}
                    onChange={(e) => updateItem(idx, 'size', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500">SL</label>
                  <input 
                    type="text"
                    className="w-full p-2 border border-slate-300 rounded font-medium"
                    value={item.quantity === 0 ? '' : formatNumber(item.quantity)}
                    onChange={(e) => updateItem(idx, 'quantity', parseNumberInput(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-3 flex gap-2 items-start">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500">Đơn Giá</label>
                    <input 
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded font-medium"
                      value={item.unitPrice === 0 ? '' : formatNumber(item.unitPrice)}
                      onChange={(e) => updateItem(idx, 'unitPrice', parseNumberInput(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeItem(idx)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded mt-5"
                    disabled={items.length === 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              type="button"
              onClick={addItem}
              className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
            >
              + Thêm dòng sản phẩm
            </button>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="font-semibold text-slate-700">Tổng Tiền:</span>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">{formatNumber(calculateTotal())} VNĐ</div>
                {depositAmount > 0 && (
                  <div className="text-xs text-green-600 font-medium">Đã cọc: {formatNumber(depositAmount)} VNĐ</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button 
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-indigo-100 text-indigo-700 font-medium rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-2"
            >
                {isAnalyzing ? (
                  <>
                  <svg className="animate-spin h-5 w-5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Gemini đang phân tích...
                  </>
                ) : (
                  <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  Dự tính Nguyên Liệu (AI)
                  </>
                )}
            </button>
            <button 
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Tạo Đơn Hàng
            </button>
          </div>
        </form>

        {/* AI Analysis Result Panel */}
        <div className="lg:col-span-1 space-y-4">
            {aiResult && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">Gemini Insight</span>
                </div>
                <h4 className="font-bold text-indigo-900 mb-2">Ước tính sản xuất</h4>
                <div className="text-sm text-indigo-800 space-y-3">
                  <div>
                    <span className="font-semibold block">Vật liệu cần thiết:</span>
                    <p className="whitespace-pre-line mt-1">{aiResult.materialEstimate}</p>
                  </div>
                  <div className="border-t border-indigo-200 pt-2">
                    <span className="font-semibold block">Lời khuyên:</span>
                    <p className="italic mt-1">"{aiResult.advice}"</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-sm text-slate-500">
              <h4 className="font-semibold text-slate-700 mb-2">Ghi chú hướng dẫn</h4>
              <p>Nhập đầy đủ thông tin sản phẩm (bao gồm URL ảnh nếu có) để quản lý trực quan hơn.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCreateForm;