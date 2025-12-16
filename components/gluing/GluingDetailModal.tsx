import React from 'react';
import { GluingRecord } from '../../types';

interface GluingDetailModalProps {
  record: GluingRecord | null;
  onClose: () => void;
}

const GluingDetailModal: React.FC<GluingDetailModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const formatDate = (isoStr: string) => {
    try {
        const d = new Date(isoStr);
        return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
    } catch { return isoStr; }
  };

  const formatNumber = (num: number) => num.toLocaleString('vi-VN');
  const failQty = record.failQuantity || 0;
  const passQty = record.quantity - failQty;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
           <div>
             <h3 className="text-xl font-bold text-slate-800">Chi Tiết Ủi Keo</h3>
             <p className="text-sm text-slate-500">Mã: {record.id}</p>
           </div>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>

        <div className="p-6 space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <span className="text-xs text-blue-500 uppercase font-bold block mb-1">Đơn Hàng</span>
                  <span className="text-lg font-bold text-slate-800">#{record.orderId}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Ngày Thực Hiện</span>
                  <span className="text-lg font-medium text-slate-800">{formatDate(record.date)}</span>
              </div>
           </div>

           <div>
              <h4 className="text-sm font-bold text-slate-800 mb-2 border-l-4 border-blue-500 pl-2">Thông Tin Sản Phẩm</h4>
              <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span>Sản phẩm:</span>
                      <span className="font-medium text-slate-800 text-right">{record.productName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span>Loại keo / Vị trí:</span>
                      <span className="font-medium text-blue-600">{record.gluingType}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                      <span>Người thực hiện:</span>
                      <span className="font-medium text-slate-800">{record.workerName || '---'}</span>
                  </div>
              </div>
           </div>

           <div>
              <h4 className="text-sm font-bold text-slate-800 mb-2 border-l-4 border-green-500 pl-2">Số Lượng & QC</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-slate-100">
                      <div className="text-xs text-slate-500 mb-1">Tổng SL</div>
                      <div className="font-bold text-slate-800">{formatNumber(record.quantity)}</div>
                  </div>
                  <div className="p-2 rounded bg-green-50 border border-green-100">
                      <div className="text-xs text-green-600 mb-1">Đạt (OK)</div>
                      <div className="font-bold text-green-700">{formatNumber(passQty)}</div>
                  </div>
                  <div className="p-2 rounded bg-red-50 border border-red-100">
                      <div className="text-xs text-red-600 mb-1">Lỗi (NG)</div>
                      <div className="font-bold text-red-700">{formatNumber(failQty)}</div>
                  </div>
              </div>
           </div>

           {record.notes && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-sm">
                  <span className="font-bold text-amber-800 block mb-1">Ghi chú:</span>
                  <p className="text-amber-900">{record.notes}</p>
              </div>
           )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium"
            >
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};

export default GluingDetailModal;