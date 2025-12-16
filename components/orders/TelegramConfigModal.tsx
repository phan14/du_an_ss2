import React from 'react';

interface TelegramConfigModalProps {
  teleConfig: { botToken: string; chatId: string };
  setTeleConfig: (config: { botToken: string; chatId: string }) => void;
  onSave: () => void;
  onClose: () => void;
}

const TelegramConfigModal: React.FC<TelegramConfigModalProps> = ({
  teleConfig,
  setTeleConfig,
  onSave,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
       <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-sky-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Cấu Hình Telegram
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Nhập thông tin Bot Telegram để nhận cảnh báo đơn hàng gấp.</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bot Token</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                placeholder="123456789:ABCdef..."
                value={teleConfig.botToken}
                onChange={(e) => setTeleConfig({...teleConfig, botToken: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chat ID (Group ID)</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                placeholder="-100xxxxxxx"
                value={teleConfig.chatId}
                onChange={(e) => setTeleConfig({...teleConfig, chatId: e.target.value})}
              />
              <p className="text-xs text-slate-400 mt-1">Thêm bot vào nhóm và lấy Chat ID.</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onSave}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 w-full font-medium"
            >
              Lưu Cấu Hình
            </button>
          </div>
       </div>
    </div>
  );
};

export default TelegramConfigModal;