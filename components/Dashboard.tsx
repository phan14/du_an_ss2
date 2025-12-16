import React, { useMemo } from 'react';
import { Order, OrderStatus, Customer } from '../types';
import StatCard from './dashboard/StatCard';
import StatusChart from './dashboard/StatusChart';
import RevenueChart from './dashboard/RevenueChart';
import UrgentOrders from './dashboard/UrgentOrders';
import RecentOrdersTable from './dashboard/RecentOrdersTable';

interface DashboardProps {
  orders: Order[];
  onNavigate: (view: any) => void;
  customers?: Customer[];
}

const Dashboard: React.FC<DashboardProps> = ({ orders, onNavigate, customers = [] }) => {
  
  // --- CALCULATIONS ---
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
    
    // Financials
    const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const deposit = orders.reduce((sum, o) => sum + (o.depositAmount || 0), 0);
    // Add up payments from delivery history as well
    const deliveryPayments = orders.reduce((sum, o) => {
        const histSum = o.deliveryHistory?.reduce((hSum, h) => hSum + (h.paymentReceived || 0), 0) || 0;
        return sum + histSum;
    }, 0);
    const totalCollected = deposit + deliveryPayments;
    const remaining = revenue - totalCollected;

    // Production Progress
    const totalItemsOrdered = orders.reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);
    const totalItemsDelivered = orders.reduce((sum, o) => sum + (o.actualDeliveryQuantity || 0), 0);
    const productionRate = totalItemsOrdered > 0 ? (totalItemsDelivered / totalItemsOrdered) * 100 : 0;

    // Urgent Orders (< 7 days and not completed)
    const today = new Date().getTime();
    const urgentList = orders
      .filter(o => {
        if (o.status === OrderStatus.COMPLETED || o.status === OrderStatus.CANCELLED) return false;
        const deadline = new Date(o.deadline).getTime();
        const diff = Math.ceil((deadline - today) / (1000 * 3600 * 24));
        return diff < 7; 
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    // Chart Data (Group by Month for simple view)
    const chartData = orders.reduce((acc: any[], order) => {
        const date = new Date(order.createdAt);
        const key = `${date.getDate()}/${date.getMonth() + 1}`; // Group by Day for better granularity in demo
        const existing = acc.find(item => item.date === key);
        if (existing) {
            existing.amount += order.totalAmount;
        } else {
            acc.push({ date: key, amount: order.totalAmount, timestamp: date.getTime() });
        }
        return acc;
    }, []).sort((a, b) => a.timestamp - b.timestamp).slice(-7); // Last 7 data points

    return {
        totalOrders,
        pendingOrders,
        revenue,
        remaining,
        productionRate,
        urgentList,
        chartData
    };
  }, [orders]);

  // Chart Data for Pie
  const statusData = [
    { name: 'Chờ xử lý', value: orders.filter(o => o.status === OrderStatus.PENDING).length, color: '#f59e0b' },
    { name: 'Đang SX', value: orders.filter(o => o.status === OrderStatus.IN_PROGRESS).length, color: '#3b82f6' },
    { name: 'Hoàn thành', value: orders.filter(o => o.status === OrderStatus.COMPLETED).length, color: '#10b981' },
    { name: 'Đã hủy', value: orders.filter(o => o.status === OrderStatus.CANCELLED).length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* 1. Header Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Doanh Thu" 
          value={`${(stats.revenue / 1000000).toFixed(1)}M`} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend="+12%" trendUp={true}
          colorClass="bg-emerald-50"
        />
        <StatCard 
          title="Công Nợ Phải Thu" 
          value={`${(stats.remaining / 1000000).toFixed(1)}M`} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          colorClass="bg-amber-50"
        />
        <StatCard 
          title="Tiến Độ Sản Xuất" 
          value={`${stats.productionRate.toFixed(1)}%`} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          }
          trend="+5%" trendUp={true}
          colorClass="bg-blue-50"
        />
        <StatCard 
          title="Đơn Chờ Xử Lý" 
          value={stats.pendingOrders} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          }
          colorClass="bg-purple-50"
        />
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        <div className="lg:col-span-2 h-full">
            <RevenueChart data={stats.chartData} />
        </div>
        <div className="h-full">
            <StatusChart data={statusData} />
        </div>
      </div>

      {/* 3. Detailed Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Orders List */}
        <div className="lg:col-span-1 h-96">
            <UrgentOrders orders={stats.urgentList} customers={customers} onNavigate={() => onNavigate('ORDERS')} />
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-2 h-96">
            <RecentOrdersTable 
              orders={orders.slice(0, 5)} 
              customers={customers} 
              onViewAll={() => onNavigate('ORDERS')}
            />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;