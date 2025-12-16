import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';

interface StaffFormModalProps {
  userData: Partial<User>;
  onSave: (user: User) => void;
  onCancel: () => void;
}

const StaffFormModal: React.FC<StaffFormModalProps> = ({ userData, onSave, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('STAFF');
  const isEdit = !!userData.username;

  useEffect(() => {
    if (userData) {
      setUsername(userData.username || '');
      setName(userData.name || '');
      setRole(userData.role || 'STAFF');
      setPassword(userData.password || '');
    }
  }, [userData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      username,
      password,
      name,
      role
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-4">{isEdit ? 'Sửa Nhân Viên' : 'Thêm Nhân Viên Mới'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tài Khoản (Username)</label>
            <input 
              type="text" 
              required
              readOnly={isEdit}
              className={`w-full p-2 border rounded-lg ${isEdit ? 'bg-slate-100 text-slate-500' : 'border-slate-300'}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Họ Tên</label>
            <input 
              type="text" 
              required
              className="w-full p-2 border border-slate-300 rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật Khẩu</label>
            <input 
              type="text" 
              required
              className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quyền Hạn</label>
            <select 
              className="w-full p-2 border border-slate-300 rounded-lg"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="STAFF">STAFF (Nhân viên)</option>
              <option value="ADMIN">ADMIN (Quản trị)</option>
            </select>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFormModal;