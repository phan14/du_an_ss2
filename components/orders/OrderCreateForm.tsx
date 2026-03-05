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
  onSaveDraft: (e: React.FormEvent) => void;
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
  onSaveDraft,
  aiResult,
  isAnalyzing,
  onAnalyze
}) => {
  const productCategories = ['Áo', 'Quần', 'Giày', 'Túi', 'Mũ', 'Thắt lưng', 'Phụ kiện', 'Khác'];

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

    // Auto-generate productId when productName is updated
    if (field === 'productName' && value) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      const customerName = customer?.name || 'KHACH';
      const productName = String(value);
      const productId = `${customerName.toUpperCase().replace(/\s+/g, '_')}_${productName.toUpperCase().replace(/\s+/g, '_')}`;
      newItems[index].productId = productId;
    }

    setItems(newItems);
  };

  const addItem = () => {
    // Generate productId from customer name + product name (initially empty, will be updated when product name is entered)
    const customer = customers.find(c => c.id === selectedCustomerId);
    const customerName = customer?.name || 'KHACH';
    const newItem: OrderItem = {
      productId: '',
      productName: '',
      quantity: 0,
      size: '',
      color: '',
      unitPrice: 0,
      imageUrl: ''
    };
    setItems([...items, newItem]);
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
    <div className="max-w-4xl mx-auto pb-10 px-3 md:px-0">
      <div className="flex items-center gap-3 md:gap-4 mb-6">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-full flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 md:h-6 w-5 md:w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Tạo Đơn Hàng Mới</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <form onSubmit={onSubmit} className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-semibold text-slate-800 mb-2">Khách Hàng <span className="text-red-500">*</span></label>
              <select
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">-- Chọn khách hàng --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-slate-800 mb-1.5">Ngày Đặt <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  className="w-full px-2.5 md:px-4 py-2 md:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold text-slate-800 mb-1.5">Thời Gian (Ngày)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-2.5 md:px-4 py-2 md:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                  value={productionDays}
                  onChange={(e) => setProductionDays(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold text-slate-800 mb-1.5">Hạn Giao</label>
                <input
                  type="text"
                  readOnly
                  className="w-full px-2.5 md:px-4 py-2 md:py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm"
                  value={formatDisplayDate(deadline)}
                />
              </div>
            </div>

            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-semibold text-slate-800 mb-2">Tiền Cọc (VNĐ)</label>
              <input
                type="text"
                className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-slate-300 rounded-lg font-semibold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
                value={depositAmount === 0 ? '' : formatNumber(depositAmount)}
                onChange={(e) => setDepositAmount(parseNumberInput(e.target.value))}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Ghi Chú Chung</label>
              <textarea
                className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-sm"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú về đơn hàng..."
              />
            </div>
          </div>

          <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold text-slate-800">Chi Tiết Sản Phẩm</h3>
              <button
                type="button"
                onClick={addItem}
                className="text-blue-600 text-xs md:text-sm font-semibold hover:text-blue-700 hover:bg-blue-50 px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg transition flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="hidden md:inline">Thêm Sản Phẩm</span>
                <span className="md:hidden">Thêm</span>
              </button>
            </div>

            {items.length > 0 ? (
              <div className="space-y-4 md:space-y-6 mb-6">
                {items.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 md:p-4 rounded-lg border border-slate-200">
                    {/* Product Header with Index & Delete Button */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-800">Sản Phẩm #{idx + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-red-600 hover:bg-red-100 p-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Xóa sản phẩm"
                        disabled={items.length === 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    {/* Row 1: Product Name (Full Width) */}
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tên Sản Phẩm <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="VD: Áo sơ mi nam"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                        value={item.productName}
                        onChange={(e) => updateItem(idx, 'productName', e.target.value)}
                        required
                      />
                    </div>

                    {/* Row 2: Category & Image (2 columns) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Loại Sản Phẩm</label>
                        <select
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                          value={item.category || ''}
                          onChange={(e) => updateItem(idx, 'category', e.target.value || undefined)}
                        >
                          <option value="">-- Chọn loại --</option>
                          {productCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ảnh Mô Tả</label>
                        <div className="flex gap-2 items-center h-full">
                          <input
                            type="text"
                            placeholder="URL ảnh..."
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                            value={item.imageUrl || ''}
                            onChange={(e) => updateItem(idx, 'imageUrl', e.target.value)}
                          />
                          <label className="cursor-pointer bg-blue-100 hover:bg-blue-200 p-2 rounded-lg border border-blue-300 transition flex items-center justify-center h-10 w-10 flex-shrink-0" title="Chọn ảnh từ máy">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      </div>
                    </div>

                    {/* Row 3: Size & Color (2 columns) */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Size</label>
                        <input
                          type="text"
                          placeholder="M, L, XL..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                          value={item.size}
                          onChange={(e) => updateItem(idx, 'size', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Màu Sắc</label>
                        <input
                          type="text"
                          placeholder="Đen, Đỏ..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                          value={item.color || ''}
                          onChange={(e) => updateItem(idx, 'color', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Row 4: Quantity & Unit Price (2 columns) */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Số Lượng</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm text-center"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Đơn Giá (VNĐ)</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm font-medium"
                          value={item.unitPrice === 0 ? '' : formatNumber(item.unitPrice)}
                          onChange={(e) => updateItem(idx, 'unitPrice', parseNumberInput(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Image Preview */}
                    {item.imageUrl && (
                      <div className="mb-3">
                        <div className="relative w-24 h-24 border border-slate-300 rounded-lg overflow-hidden group bg-slate-100">
                          <img src={item.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => updateItem(idx, 'imageUrl', '')}
                            className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Item Summary Card */}
                    {item.productName && (
                      <div className="bg-white p-3 rounded-lg border border-blue-200 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-600">Tên:</span>
                            <p className="font-semibold text-slate-800 truncate">{item.productName}</p>
                          </div>
                          <div>
                            <span className="text-slate-600">Loại:</span>
                            <p className="font-semibold text-slate-800">{item.category || '-'}</p>
                          </div>
                          <div>
                            <span className="text-slate-600">Size / Màu:</span>
                            <p className="font-semibold text-slate-800">{item.size || '-'} / {item.color || '-'}</p>
                          </div>
                          <div>
                            <span className="text-slate-600">SL × Giá:</span>
                            <p className="font-semibold text-blue-600">{item.quantity} × {formatNumber(item.unitPrice)}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-600">Tổng cộng:</span>
                            <p className="font-bold text-lg text-emerald-600">{formatNumber(item.quantity * item.unitPrice)} đ</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm mb-4">Chưa có sản phẩm nào</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between items-center bg-slate-50 p-4 rounded-lg">
              <span className="font-semibold text-slate-700">Tổng Tiền Hàng:</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{formatNumber(calculateTotal())}</div>
                <div className="text-xs text-slate-500">VNĐ</div>
                {depositAmount > 0 && (
                  <div className="text-xs text-green-600 font-semibold mt-1">Đã cọc: {formatNumber(depositAmount)} VNĐ</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-4 pt-3 md:pt-4">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="px-4 md:px-6 py-2 md:py-3 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm md:text-base order-2 sm:order-1"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-4 md:h-5 w-4 md:w-5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span className="hidden md:inline">Gemini phân tích...</span>
                  <span className="md:hidden">Phân tích...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 md:h-5 w-4 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden md:inline">Dự tính Nguyên Liệu</span>
                  <span className="md:hidden">Dự tính</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 md:px-6 py-2 md:py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors text-sm md:text-base order-1 sm:order-2"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="px-4 md:px-6 py-2 md:py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors text-sm md:text-base order-3 sm:order-3"
            >
              💾 Lưu Nháp
            </button>
            <button
              type="submit"
              className="px-4 md:px-8 py-2 md:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm md:text-base order-4 sm:order-4"
            >
              Tạo Đơn
            </button>
          </div>
        </form>

        {/* AI Analysis Result Panel - Below on Mobile, Right on Desktop */}
        <div className="lg:col-span-1 space-y-3 md:space-y-4">
          {aiResult && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-6 rounded-xl border border-indigo-100 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">AI Gemini</span>
              </div>
              <h4 className="font-bold text-indigo-900 mb-2 text-sm md:text-base">Ước tính sản xuất</h4>
              <div className="text-xs md:text-sm text-indigo-800 space-y-2 md:space-y-3">
                <div>
                  <span className="font-semibold block">Vật liệu cần thiết:</span>
                  <p className="whitespace-pre-line mt-1 text-indigo-700">{aiResult.materialEstimate}</p>
                </div>
                <div className="border-t border-indigo-200 pt-2">
                  <span className="font-semibold block">Lời khuyên:</span>
                  <p className="italic mt-1 text-indigo-700">"{aiResult.advice}"</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 text-xs md:text-sm text-slate-600">
            <h4 className="font-semibold text-slate-700 mb-2">📋 Hướng dẫn nhanh</h4>
            <ul className="space-y-1 text-slate-600">
              <li>✓ Nhập tên sản phẩm (bắt buộc)</li>
              <li>✓ Chọn loại sản phẩm</li>
              <li>✓ Nhập size, màu, số lượng</li>
              <li>✓ Nhập đơn giá</li>
              <li>✓ Tải ảnh sản phẩm</li>
              <li>✓ Nhấn "Dự tính Nguyên Liệu" để AI phân tích</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCreateForm;