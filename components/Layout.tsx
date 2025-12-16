import React, { useState } from 'react';
import { ViewState, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  currentUser: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, currentUser, onLogout }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const menuItems = [
    {
      id: 'DASHBOARD', label: 'Tổng Quan', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      id: 'CUSTOMERS', label: 'Khách Hàng', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      id: 'ORDERS', label: 'Đơn Hàng', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 'GLUING', label: 'Ủi Keo', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      id: 'PRODUCTS', label: 'Bảng Giá', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m0 0v10l8 4" />
        </svg>
      )
    },
    {
      id: 'STATISTICS', label: 'Thống Kê', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  if (currentUser.role === 'ADMIN') {
    menuItems.push({
      id: 'STAFF', label: 'Nhân Sự', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    });
    menuItems.push({
      id: 'SYSTEM', label: 'Hệ Thống', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    });
  }

  // Mobile Bottom Bar Logic
  const mobileMainItems = menuItems.slice(0, 4); // Show first 4
  const mobileMoreItems = menuItems.slice(4); // Rest in "Menu"

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-blue-500">Arden</span>Factory
          </h1>
          <p className="text-xs text-slate-500 mt-1">Hệ thống quản lý may mặc</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${(currentView === item.id || (currentView === 'CREATE_ORDER' && item.id === 'ORDERS'))
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'hover:bg-slate-800 hover:text-white'
                }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${currentUser.role === 'ADMIN' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                {currentUser.role === 'ADMIN' ? 'AD' : 'NV'}
              </div>
              <div className="text-sm overflow-hidden">
                <div className="text-white font-medium truncate">{currentUser.name}</div>
                <div className="text-slate-500 text-xs">{currentUser.role === 'ADMIN' ? 'Quản trị' : 'Nhân viên'}</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-white"
              title="Đăng xuất"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-gradient-to-r from-slate-900 to-slate-800 h-14 border-b border-slate-700 flex items-center justify-between px-4 flex-shrink-0 z-10 shadow-sm">
          <div className="font-bold text-white flex items-center gap-1">
            <span className="text-blue-400">Arden</span>
            <span>App</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${currentUser.role === 'ADMIN' ? 'bg-amber-500' : 'bg-blue-500'}`}>
              {currentUser.role === 'ADMIN' ? 'AD' : 'NV'}
            </div>
            <button onClick={onLogout} className="text-slate-300 hover:text-white transition p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Scrollable Area - Add padding-bottom for mobile nav */}
        <div className="flex-1 overflow-auto p-3 md:p-8 pb-24 md:pb-8">
          {children}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 z-40 h-20 flex items-center justify-around shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          {mobileMainItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onChangeView(item.id as ViewState); setShowMobileMenu(false); }}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 px-2 transition-colors ${(currentView === item.id || (currentView === 'CREATE_ORDER' && item.id === 'ORDERS'))
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {React.cloneElement(item.icon as React.ReactElement<any>, { className: "h-6 w-6" })}
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 px-2 transition-colors ${showMobileMenu ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs font-semibold">Menu</span>
          </button>
        </div>

        {/* Mobile Slide-up Menu */}
        {showMobileMenu && (
          <div className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)}>
            <div
              className="absolute bottom-20 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-4 max-h-[70vh] overflow-y-auto animate-slide-up"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-6"></div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 px-2">Thêm Tùy Chọn</h3>
              <div className="grid grid-cols-2 gap-3">
                {mobileMoreItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { onChangeView(item.id as ViewState); setShowMobileMenu(false); }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${currentView === item.id
                      ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 active:bg-slate-100'
                      }`}
                  >
                    {React.cloneElement(item.icon as React.ReactElement<any>, { className: "h-8 w-8 mb-2" })}
                    <span className="text-xs font-semibold text-center">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;