
import React, { useState } from 'react';
import { Customer } from '../../types';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onExport: (customer: Customer) => void;
  onViewStats: (customer: Customer) => void;
  isAdmin: boolean;
}

const ITEMS_PER_PAGE = 10;

const CustomerList: React.FC<CustomerListProps> = ({ customers, onEdit, onDelete, onExport, onViewStats, isAdmin }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination Logic
  const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentCustomers = customers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
      
      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-800 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Tên</th>
              <th className="px-6 py-4">Liên Hệ</th>
              <th className="px-6 py-4">Địa Chỉ</th>
              <th className="px-6 py-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentCustomers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Chưa có khách hàng nào.</td>
              </tr>
            ) : currentCustomers.map(customer => (
              <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{customer.name}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span>{customer.phone}</span>
                    <span className="text-slate-400 text-xs">{customer.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs truncate">{customer.address}</td>
                <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
                  <button 
                    onClick={() => onViewStats(customer)}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                    title="Thống kê sản phẩm theo tháng"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    TK
                  </button>
                  <div className="h-4 w-px bg-slate-300 mx-1"></div>
                  <button 
                    onClick={() => onExport(customer)}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                    title="Xuất file Excel đơn hàng"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Excel
                  </button>
                  <div className="h-4 w-px bg-slate-300 mx-1"></div>
                  <button 
                    onClick={() => onEdit(customer)}
                    className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                  >
                    Sửa
                  </button>
                  {isAdmin && (
                    <button 
                        onClick={() => onDelete(customer.id)}
                        className="text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                        Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="md:hidden space-y-3">
         {currentCustomers.length === 0 ? (
           <div className="text-center p-8 text-slate-400 bg-white rounded-xl border border-slate-100">Chưa có khách hàng nào.</div>
         ) : currentCustomers.map(customer => (
           <div key={customer.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-start mb-3">
               <div>
                 <h3 className="text-lg font-bold text-slate-800">{customer.name}</h3>
                 <a href={`tel:${customer.phone}`} className="text-blue-600 font-medium text-sm flex items-center gap-1 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {customer.phone}
                 </a>
               </div>
               <button 
                 onClick={() => onViewStats(customer)}
                 className="p-2 bg-indigo-50 text-indigo-600 rounded-full"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
               </button>
             </div>
             
             {customer.address && (
                <div className="text-sm text-slate-600 mb-3 flex items-start gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                   {customer.address}
                </div>
             )}

             <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-50">
                <button 
                  onClick={() => onExport(customer)}
                  className="flex items-center justify-center gap-1 py-1.5 rounded bg-emerald-50 text-emerald-700 text-xs font-medium"
                >
                  Excel
                </button>
                <button 
                  onClick={() => onEdit(customer)}
                  className="flex items-center justify-center gap-1 py-1.5 rounded bg-blue-50 text-blue-700 text-xs font-medium"
                >
                  Sửa
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => onDelete(customer.id)}
                    className="flex items-center justify-center gap-1 py-1.5 rounded bg-red-50 text-red-700 text-xs font-medium"
                  >
                    Xóa
                  </button>
                )}
             </div>
           </div>
         ))}
      </div>

      {/* Pagination Footer */}
      {customers.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-slate-200 bg-slate-50 gap-4 mt-auto rounded-b-xl">
              <span className="text-sm text-slate-500">
                  Hiển thị <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(startIndex + ITEMS_PER_PAGE, customers.length)}</span> / <span className="font-semibold">{customers.length}</span>
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

export default CustomerList;
