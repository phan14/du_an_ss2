import React, { useRef, useState, useEffect } from 'react';
import { User, Order, Customer } from '../types';
import { createBackupFile, getLastBackupDate, restoreFromBackup } from '../services/backupService';
import { backupToTelegram, sendBackupNotification, sendRestoreNotification } from '../services/telegramBackupService';

interface SystemProps {
  currentUser: User;
  orders?: Order[];
  customers?: Customer[];
  onDataRestored?: (orders: Order[], customers: Customer[]) => void;
}

const System: React.FC<SystemProps> = ({ currentUser, orders = [], customers = [], onDataRestored }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackupDisplay, setLastBackupDisplay] = useState('');
  const [isBackingUpToTelegram, setIsBackingUpToTelegram] = useState(false);

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

  const handleBackupToTelegram = async () => {
    setIsBackingUpToTelegram(true);
    try {
      // Send notification first
      await sendBackupNotification(orders, customers);
      
      // Then send file
      const result = await backupToTelegram(orders, customers);
      alert(result.message);
    } catch (error: any) {
      alert(`Lỗi backup: ${error.message}`);
    } finally {
      setIsBackingUpToTelegram(false);
    }
  };

  const handleRestoreFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Cảnh báo: Hành động này sẽ GHI ĐÈ toàn bộ dữ liệu hiện tại. Bạn có chắc chắn?')) {
      e.target.value = '';
      return;
    }

    setIsRestoring(true);
    try {
      const result = await restoreFromBackup(file);
      if (result.success && onDataRestored) {
        // Send restoration notification
        const restoredOrders = result.data?.orders || [];
        const restoredCustomers = result.data?.customers || [];
        await sendRestoreNotification(restoredOrders, restoredCustomers);
        onDataRestored(restoredOrders, restoredCustomers);
      }
      alert(result.message);
    } catch (error: any) {
      alert(`Lỗi restore: ${error.message}`);
    } finally {
      setIsRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Hệ Thống & Sao Lưu</h2>
        <p className="text-slate-500 text-sm">Quản lý dữ liệu và bảo mật</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Local Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-3 rounded-lg text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Sao Lưu Dữ Liệu (Máy Tính)</h3>
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

        {/* Telegram Backup Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Backup Telegram</h3>
                    <p className="text-xs text-slate-500">Gửi backup lên nhóm Telegram</p>
                </div>
            </div>
            
            <div className="flex-1 space-y-4">
                <p className="text-sm text-slate-600">
                    Gửi file backup thẳng vào nhóm Telegram của bạn để lưu trữ an toàn và dễ dàng chia sẻ.
                </p>
                <div className="bg-blue-50 p-3 rounded text-sm text-blue-700 border border-blue-200">
                    ✅ Bot Telegram đã được cấu hình
                </div>
            </div>

            <button 
              onClick={handleBackupToTelegram}
              disabled={isBackingUpToTelegram}
              className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isBackingUpToTelegram ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Đang gửi...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16151496 C3.50612381,-0.1 2.40999899,-0.0429026162 1.77946707,0.3429026 C0.994623095,0.9 0.837654359,2.0 1.15159189,2.7854869 L3.03521743,9.22648 C3.03521743,9.38358 3.19218622,9.54068 3.50612381,9.54068 L16.6915026,10.3261669 C16.6915026,10.3261669 17.1624089,10.3261669 17.1624089,9.99723794 L17.1624089,10.3261669 C17.1624089,10.4831526 17.3193774,11.01 17.3193774,11 C17.3193774,12.0425846 16.6915026,12.4744748 16.6915026,12.4744748 Z"/>
                  </svg>
                  📤 Backup Telegram
                </>
              )}
            </button>
        </div>
      </div>

      {/* Restore Local Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
              </div>
              <div>
                  <h3 className="font-bold text-slate-800">Khôi Phục Dữ Liệu (Máy Tính)</h3>
                  <p className="text-xs text-slate-500">Nhập từ file Excel backup</p>
              </div>
          </div>
          
          <div className="flex-1 space-y-4">
              <p className="text-sm text-slate-600">
                  Tải file backup từ Telegram hoặc máy tính của bạn để khôi phục lại toàn bộ hệ thống.
              </p>
              <div className="bg-red-50 p-3 rounded text-sm text-red-700 border border-red-100">
                  <span className="font-bold text-xs uppercase block mb-1">⚠️ Lưu ý quan trọng:</span>
                  Hành động này sẽ xóa toàn bộ dữ liệu hiện tại và thay thế bằng dữ liệu trong file backup.
              </div>
              <p className="text-xs text-slate-500">
                💡 File backup được gửi đến nhóm Telegram: <strong>@{import.meta.env.VITE_TELEGRAM_CHAT_ID}</strong>
              </p>
          </div>

          <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }}
              accept=".xlsx, .xls" 
              onChange={handleRestoreFromFile}
          />
          
          <button 
              onClick={handleRestoreClick}
              disabled={isRestoring}
              className="mt-6 w-full py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
              {isRestoring ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-slate-700 border-t-transparent rounded-full"></div>
                  Đang khôi phục...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  📥 Restore từ File Backup
                </>
              )}
          </button>
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