
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, saveUser, deleteUser } from '../services/authService';
import StaffList from './staff/StaffList';
import StaffFormModal from './staff/StaffFormModal';

interface StaffProps {
  currentUser: User;
}

const Staff: React.FC<StaffProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    // @ts-ignore - getUsers is now async
    const fetchedUsers = await getUsers();
    setUsers(fetchedUsers);
    setIsLoading(false);
  };

  const handleSave = async (user: User) => {
    try {
      await saveUser(user);
      await loadUsers();
      setIsEditing(false);
      setSelectedUser({});
    } catch (e) {
      alert('Lỗi lưu nhân viên');
    }
  };

  const handleDelete = async (username: string) => {
    if (username === currentUser.username) {
      alert("Bạn không thể xóa tài khoản đang đăng nhập!");
      return;
    }
    if (window.confirm(`Bạn có chắc muốn xóa nhân viên ${username}?`)) {
      try {
        await deleteUser(username);
        await loadUsers();
      } catch (e) {
        alert('Lỗi xóa nhân viên');
      }
    }
  };

  if (currentUser.role !== 'ADMIN') {
    return <div className="p-4 text-center text-red-500">Bạn không có quyền truy cập trang này.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Quản Lý Nhân Sự</h2>
           <p className="text-slate-500 text-sm">Phân quyền và quản lý tài khoản truy cập</p>
        </div>
        <button 
          onClick={() => { setSelectedUser({}); setIsEditing(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Thêm Nhân Viên
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-500">Đang tải danh sách nhân viên...</div>
      ) : (
        <StaffList 
          users={users} 
          onEdit={(u) => { setSelectedUser(u); setIsEditing(true); }}
          onDelete={handleDelete}
          currentUser={currentUser}
        />
      )}

      {isEditing && (
        <StaffFormModal 
          userData={selectedUser}
          onSave={handleSave}
          onCancel={() => { setIsEditing(false); setSelectedUser({}); }}
        />
      )}
    </div>
  );
};

export default Staff;
