
import React from 'react';
import { createBackupFile } from '../../services/backupService';

interface BackupReminderModalProps {
  onClose: () => void;
}

const BackupReminderModal: React.FC<BackupReminderModalProps> = ({ onClose }) => {
  const handleBackup = () => {
    createBackupFile();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-amber-50 p-6 border-b border-amber-100 flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Cảnh Báo Sao Lưu</h3>
            <p className="text-slate-600 mt-1">Đã hơn 7 ngày bạn chưa sao lưu dữ liệu. Để tránh mất mát dữ liệu khi máy tính gặp sự cố, vui lòng sao lưu ngay.</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <button 
            onClick={handleBackup}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
             </svg>
             Tải File Sao Lưu (.XLSX)
          </button>
          
          <div className="text-center text-sm text-slate-500">
             Sau khi tải xuống, hãy tải file này lên <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline">Google Drive</a> để lưu trữ an toàn.
          </div>
        </div>

        <div className="p-4 bg-slate-50 text-center">
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">
             Bỏ qua lần này (Không khuyến khích)
           </button>
        </div>
      </div>
    </div>
  );
};

export default BackupReminderModal;
