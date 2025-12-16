import React, { useRef, useState, useEffect } from 'react';
import { User } from '../types';
import { createBackupFile, getLastBackupDate, restoreFromBackup } from '../services/backupService';

interface SystemProps {
  currentUser: User;
}

const System: React.FC<SystemProps> = ({ currentUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackupDisplay, setLastBackupDisplay] = useState('');

  useEffect(() => {
    setLastBackupDisplay(getLastBackupDate());
  }, []);

  if (currentUser.role !== 'ADMIN') {
    return <div className="p-4 text-center text-red-500">Bạn không có quyền truy cập trang này.</div>;
  }

  const handleBackup = () => {
    createBackupFile();
    // Update the displayed date immediately without reloading the page
    // Reloading often cancels the download stream in browsers
    setTimeout(() => {
        setLastBackupDisplay(getLastBackupDate());
    }, 500);
  };

  const handleRestoreClick = () => {
    // Directly open file picker. Moving the confirm logic to "onChange" 
    // ensures the browser doesn't block the file picker popup.
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset to allow selecting same file
        fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Ask for confirmation AFTER selecting the file
    if (!window.confirm("CẢNH BÁO: Hành động này sẽ GHI ĐÈ toàn bộ dữ liệu hiện tại bằng dữ liệu trong file Excel. Bạn có chắc chắn muốn tiếp tục?")) {
        e.target.value = ''; // Clear selection
        return;
    }

    setIsRestoring(true);
    const result = await restoreFromBackup(file);
    setIsRestoring(false);

    alert(result.message);
    if (result.success) {
      window.location.reload();
    }
    
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Hệ Thống & Sao Lưu</h2>
        <p className="text-slate-500 text-sm">Quản lý dữ liệu và bảo mật</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-3 rounded-lg text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Sao Lưu Dữ Liệu</h3>
                    <p className="text-xs text-slate-500">Tải dữ liệu Excel về máy</p>
                </div>
            </div>
            
            <div className="flex-1 space-y-4">
                <p className="text-sm text-slate-600">
                    Hệ thống lưu trữ dữ liệu trực tiếp trên trình duyệt này. Để tránh mất mát khi máy hỏng hoặc xóa cache, hãy sao lưu thường xuyên.
                </p>
                <div className="bg-slate-50 p-3 rounded text-sm text-slate-700">
                    <span className="font-semibold block text-xs text-slate-400 uppercase">Sao lưu gần nhất:</span>
                    {lastBackupDisplay}
                </div>
            </div>

            <button 
                onClick={handleBackup}
                className="mt-6 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
                Tải File Excel Sao Lưu
            </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Khôi Phục Dữ Liệu</h3>
                    <p className="text-xs text-slate-500">Nhập từ file Excel backup</p>
                </div>
            </div>
            
            <div className="flex-1 space-y-4">
                <p className="text-sm text-slate-600">
                    Nếu bạn có file backup (<code>Arden_Backup_....xlsx</code>), bạn có thể tải lên để khôi phục lại toàn bộ hệ thống.
                </p>
                <div className="bg-red-50 p-3 rounded text-sm text-red-700 border border-red-100">
                    <span className="font-bold text-xs uppercase block mb-1">⚠️ Lưu ý quan trọng:</span>
                    Hành động này sẽ xóa toàn bộ dữ liệu hiện tại và thay thế bằng dữ liệu trong file backup.
                </div>
            </div>

            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }}
                accept=".xlsx, .xls" 
                onChange={handleFileChange}
            />
            
            <button 
                onClick={handleRestoreClick}
                disabled={isRestoring}
                className="mt-6 w-full py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors"
            >
                {isRestoring ? 'Đang khôi phục...' : 'Chọn File Excel Khôi Phục'}
            </button>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <a 
            href="https://drive.google.com" 
            target="_blank" 
            rel="noreferrer" 
            className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.01 1.984c-1.282 0-2.316.488-2.906 1.442L2.096 14.86c-1.206 1.954.116 4.304 2.296 4.304h7.525c.578 0 1.05-.444 1.05-1s-.472-1-1.05-1H4.392c-.61 0-1.026-.708-.66-1.268L10.74 3.82c.214-.348.882-.348 1.096 0l4.318 6.974c.294.476.906.634 1.382.35.476-.282.636-.88.35-1.354l-4.298-6.94c-.59-1.054-1.624-1.866-2.906-1.866zm8.818 10.96c-.578 0-1.05.444-1.05 1 0 .204.062.392.166.554l2.678 4.3c.366.56-.05 1.268-.66 1.268H5.618l2.64-4.264c.294-.476.136-1.098-.34-1.382-.476-.284-1.098-.134-1.382.34l-2.98 4.814c-1.206 1.954.116 4.304 2.296 4.304h15.222c2.18 0 3.502-2.35 2.296-4.304l-2.98-4.814c-.168-.27-.456-.44-.77-.44zM13.626 12c-.55 0-.996.446-.996 1 0 .152.036.294.1.42l3.292 6.584c.214.428.66.702 1.144.702.484 0 .93-.274 1.144-.702l3.292-6.584c.064-.126.1-.268.1-.42 0-.554-.446-1-.996-1H13.626z"/>
            </svg>
            Mở Google Drive để lưu trữ đám mây
        </a>
      </div>
    </div>
  );
};

export default System;