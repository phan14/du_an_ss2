import React from 'react';

interface EmailDraftModalProps {
  emailContent: string;
  setEmailContent: (content: string) => void;
  isGenerating: boolean;
  onClose: () => void;
}

const EmailDraftModal: React.FC<EmailDraftModalProps> = ({
  emailContent,
  setEmailContent,
  isGenerating,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
       <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 p-1 rounded">AI</span>
            Email Dự Thảo
          </h3>
          
          {isGenerating ? (
            <div className="py-12 flex flex-col items-center text-slate-500">
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Đang soạn email...
            </div>
          ) : (
            <>
              <textarea 
                className="w-full h-64 p-4 border border-slate-200 rounded-lg text-slate-700 bg-slate-50 focus:bg-white transition-colors"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              ></textarea>
              <div className="mt-4 flex justify-end gap-3">
                <button 
                  onClick={() => navigator.clipboard.writeText(emailContent).then(() => alert('Đã sao chép!'))}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Sao chép
                </button>
                <button 
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Đóng
                </button>
              </div>
            </>
          )}
       </div>
    </div>
  );
};

export default EmailDraftModal;