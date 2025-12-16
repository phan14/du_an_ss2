
import React, { useState } from 'react';
import { User } from '../../types';

interface StaffListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (username: string) => void;
  currentUser: User;
}

const ITEMS_PER_PAGE = 10;

const StaffList: React.FC<StaffListProps> = ({ users, onEdit, onDelete, currentUser }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination Logic
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentUsers = users.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
              <th className="px-6 py-4">Tài Khoản</th>
              <th className="px-6 py-4">Họ và Tên</th>
              <th className="px-6 py-4">Phân Quyền</th>
              <th className="px-6 py-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentUsers.map((user) => (
              <tr key={user.username} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{user.username}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button 
                    onClick={() => onEdit(user)}
                    className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50"
                  >
                    Sửa
                  </button>
                  {user.username !== currentUser.username && (
                    <button 
                        onClick={() => onDelete(user.username)}
                        className="text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50"
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
         {currentUsers.map(user => (
           <div key={user.username} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                 <div className="font-bold text-slate-800">{user.name}</div>
                 <div className="text-sm text-slate-500">@{user.username}</div>
                 <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                    user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                 </span>
              </div>
              <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit(user)}
                    className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-xs font-medium"
                  >
                    Sửa
                  </button>
                  {user.username !== currentUser.username && (
                    <button 
                        onClick={() => onDelete(user.username)}
                        className="bg-red-50 text-red-600 px-3 py-1.5 rounded text-xs font-medium"
                    >
                        Xóa
                    </button>
                  )}
              </div>
           </div>
         ))}
      </div>

      {/* Pagination Footer */}
      {users.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-slate-200 bg-slate-50 gap-4 mt-auto rounded-b-xl">
              <span className="text-sm text-slate-500">
                  Hiển thị <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(startIndex + ITEMS_PER_PAGE, users.length)}</span> / <span className="font-semibold">{users.length}</span>
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

export default StaffList;
