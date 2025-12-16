
import React, { useState } from 'react';
import { GluingRecord } from '../../types';

interface GluingListProps {
  records: GluingRecord[];
  onEdit: (record: GluingRecord) => void;
  onDelete: (id: string) => void;
  onView: (record: GluingRecord) => void;
}

const ITEMS_PER_PAGE = 10;

const GluingList: React.FC<GluingListProps> = ({ records, onEdit, onDelete, onView }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const formatDate = (isoStr: string) => {
    try {
        const d = new Date(isoStr);
        return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
    } catch { return isoStr; }
  };

  const formatNumber = (num: number) => num.toLocaleString('vi-VN');

  // Pagination Logic
  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRecords = records.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  return (
    <div className="bg-transparent md:bg-white md:rounded-xl md:shadow-sm md:border md:border-slate-100 flex flex-col overflow-hidden">
      
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-800 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Ngày / Đơn</th>
              <th className="px-6 py-4">Loại Keo / SP</th>
              <th className="px-6 py-4 text-center">QC (Đạt / Lỗi)</th>
              <th className="px-6 py-4">Người Làm</th>
              <th className="px-6 py-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentRecords.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Chưa có dữ liệu ủi keo nào.</td>
                </tr>
            ) : currentRecords.map((record) => {
                const failQty = record.failQuantity || 0;
                const passQty = record.quantity - failQty;

                return (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{formatDate(record.date)}</div>
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold mt-1 inline-block">
                            #{record.orderId}
                        </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                        <div className="text-blue-600 font-medium">{record.gluingType}</div>
                        <div className="text-xs text-slate-500 truncate">{record.productName}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-800">{formatNumber(record.quantity)} Tổng</span>
                            <div className="flex gap-2 text-xs mt-1">
                                <span className="text-green-600 font-medium" title="Đạt">✓ {formatNumber(passQty)}</span>
                                {failQty > 0 && (
                                    <span className="text-red-600 font-medium" title="Lỗi">✕ {formatNumber(failQty)}</span>
                                )}
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        {record.workerName || '---'}
                        {record.notes && <div className="text-xs text-slate-400 italic mt-0.5 truncate max-w-[100px]">{record.notes}</div>}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => onView(record)}
                        className="text-slate-600 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors border border-slate-200"
                        title="Xem chi tiết"
                      >
                        Chi Tiết
                      </button>
                      <button 
                        onClick={() => onEdit(record)}
                        className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => onDelete(record.id)}
                        className="text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="md:hidden space-y-3">
         {currentRecords.length === 0 ? (
           <div className="text-center p-8 text-slate-400 bg-white rounded-xl border border-slate-100">Chưa có dữ liệu.</div>
         ) : currentRecords.map(record => {
            const failQty = record.failQuantity || 0;
            const passQty = record.quantity - failQty;
            
            return (
              <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                   <div>
                      <div className="text-xs text-slate-500">{formatDate(record.date)}</div>
                      <div className="font-bold text-slate-800">#{record.orderId}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-xs text-slate-400">Tổng SL</div>
                      <div className="text-lg font-bold text-blue-600">{formatNumber(record.quantity)}</div>
                   </div>
                </div>
                
                <div className="mb-3">
                   <div className="font-medium text-blue-700">{record.gluingType}</div>
                   <div className="text-xs text-slate-600 line-clamp-1">{record.productName}</div>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg mb-3">
                   <div className="text-center flex-1 border-r border-slate-200">
                      <div className="text-[10px] text-green-600 uppercase font-bold">Đạt</div>
                      <div className="font-bold text-green-700">{formatNumber(passQty)}</div>
                   </div>
                   <div className="text-center flex-1">
                      <div className="text-[10px] text-red-600 uppercase font-bold">Lỗi</div>
                      <div className="font-bold text-red-700">{formatNumber(failQty)}</div>
                   </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <span className="text-xs text-slate-500">Thợ: {record.workerName || '--'}</span>
                    <div className="flex gap-2">
                        <button onClick={() => onView(record)} className="text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs font-medium">Chi tiết</button>
                        <button onClick={() => onEdit(record)} className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-medium">Sửa</button>
                        <button onClick={() => onDelete(record.id)} className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-medium">Xóa</button>
                    </div>
                </div>
              </div>
            );
         })}
      </div>

      {/* Pagination Footer */}
      {records.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-slate-200 bg-slate-50 gap-4 mt-auto rounded-b-xl">
              <span className="text-sm text-slate-500">
                  Hiển thị <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(startIndex + ITEMS_PER_PAGE, records.length)}</span> / <span className="font-semibold">{records.length}</span>
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
  );
};

export default GluingList;
