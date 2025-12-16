
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import Orders from './components/Orders';
import Products from './components/Products';
import Login from './components/Login';
import Staff from './components/Staff';
import System from './components/System';
import Gluing from './components/Gluing';
import Statistics from './components/Statistics';
import BackupReminderModal from './components/common/BackupReminderModal';
import { Customer, Order, ViewState, User } from './types';
import { getCustomers, getOrders } from './services/storageService';
import { getCurrentUser, logout } from './services/authService';
import { isBackupDue } from './services/backupService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const loadData = async () => {
    try {
      const [fetchedCustomers, fetchedOrders] = await Promise.all([
        getCustomers(),
        getOrders()
      ]);
      setCustomers(fetchedCustomers);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for logged in user on mount
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    loadData();
  }, []);

  // Separate effect to check backup status whenever currentUser changes
  useEffect(() => {
    if (currentUser && currentUser.role === 'ADMIN') {
      if (isBackupDue()) {
        setShowBackupModal(true);
      }
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLoginSuccess={setCurrentUser} />;
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500">Đang khởi tạo hệ thống...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard orders={orders} customers={customers} onNavigate={setCurrentView} />;
      case 'CUSTOMERS':
        return (
          <Customers
            customers={customers}
            orders={orders}
            refreshData={loadData}
            currentUser={currentUser}
          />
        );
      case 'ORDERS':
        return (
          <Orders
            orders={orders}
            customers={customers}
            refreshData={loadData}
            onNavigate={setCurrentView}
            currentUser={currentUser}
          />
        );
      case 'CREATE_ORDER':
        return (
          <Orders
            orders={orders}
            customers={customers}
            refreshData={loadData}
            initialView="CREATE"
            onNavigate={setCurrentView}
            currentUser={currentUser}
          />
        );
      case 'GLUING':
        return (
          <Gluing
            orders={orders}
            currentUser={currentUser}
          />
        );
      case 'PRODUCTS':
        return <Products orders={orders} />;
      case 'STAFF':
        return <Staff currentUser={currentUser} />;
      case 'SYSTEM':
        return <System currentUser={currentUser} />;
      case 'STATISTICS':
        return <Statistics customers={customers} orders={orders} />;
      default:
        return <Dashboard orders={orders} customers={customers} onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onChangeView={setCurrentView}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {renderContent()}

      {showBackupModal && (
        <BackupReminderModal onClose={() => setShowBackupModal(false)} />
      )}
    </Layout>
  );
};

export default App;
