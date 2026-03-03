import React, { useState, useEffect, useRef } from 'react';
import { Customer, Order, OrderItem, OrderStatus, ViewState, User } from '../types';
import { saveOrder, deleteOrder, saveCustomer, saveCustomersBulk, saveOrdersBulk } from '../services/storageService';
import { analyzeOrderRequirements, generateOrderEmail } from '../services/geminiService';
import { sendTelegramMessage, getTelegramConfig, saveTelegramConfig } from '../services/telegramService';
import { exportOrdersToExcel, importOrdersFromExcel } from '../services/excelService';

// Sub-components
import OrderList from './orders/OrderList';
import OrderCreateForm from './orders/OrderCreateForm';
import OrderUpdateModal from './orders/OrderUpdateModal';
import OrderDetailModal from './orders/OrderDetailModal';
import TelegramConfigModal from './orders/TelegramConfigModal';
import EmailDraftModal from './orders/EmailDraftModal';
import ImageLightbox from './common/ImageLightbox';

interface OrdersProps {
  orders: Order[];
  customers: Customer[];
  refreshData: () => void;
  initialView?: 'LIST' | 'CREATE';
  onNavigate: (view: ViewState) => void;
  currentUser: User;
}

const Orders: React.FC<OrdersProps> = ({ orders, customers, refreshData, initialView = 'LIST', onNavigate, currentUser }) => {
  const [view, setView] = useState<'LIST' | 'CREATE'>(initialView);

  // Create Order State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ productId: '', productName: '', quantity: 0, size: '', color: '', unitPrice: 0, imageUrl: '' }]);

  // Date & Duration Logic
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [productionDays, setProductionDays] = useState<number>(14);
  const [deadline, setDeadline] = useState('');

  const [notes, setNotes] = useState('');
  const [depositAmount, setDepositAmount] = useState<number>(0);

  // Update Status & View Detail Modal State
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ materialEstimate: string, advice: string } | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  // Telegram State
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [teleConfig, setTeleConfig] = useState(() => {
    const saved = getTelegramConfig();
    return {
      botToken: saved?.botToken || '',
      chatId: saved?.chatId || ''
    };
  });

  // Auto-load telegram config from .env or localStorage on mount
  useEffect(() => {
    const savedConfig = getTelegramConfig();
    if (savedConfig) {
      setTeleConfig({
        botToken: savedConfig.botToken,
        chatId: savedConfig.chatId
      });
    }
  }, []);

  // Filter & UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCompletedOrders, setShowCompletedOrders] = useState(false);

  // Refs to track alerts (prevent duplicate notifications)
  const alertedOrderIdsRef = useRef(new Set<string>());
  const threeDayAlertedOrderIdsRef = useRef(new Set<string>());
  const isCheckingAlertsRef = useRef(false);

  const formatNumber = (num: number) => num.toLocaleString('vi-VN');
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };
  const getTotalQuantity = (orderItems: OrderItem[]) => orderItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate days remaining until deadline (excluding Sundays to match deadline calculation)
  const getDaysRemaining = (deadlineStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadlineStr);

    let daysCount = 0;
    let currentDate = new Date(today);

    while (currentDate < deadlineDate) {
      currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate.getDay() !== 0) { // Loại bỏ chủ nhật
        daysCount++;
      }
    }

    return daysCount;
  };

  // Auto-calculate deadline (excluding Sundays)
  useEffect(() => {
    if (orderDate) {
      const parts = orderDate.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]) - 1;
        const d = parseInt(parts[2]);

        const currentDate = new Date(y, m, d);

        let daysAdded = 0;
        const targetDays = productionDays || 0;

        while (daysAdded < targetDays) {
          currentDate.setDate(currentDate.getDate() + 1);
          if (currentDate.getDay() !== 0) {
            daysAdded++;
          }
        }

        const resYear = currentDate.getFullYear();
        const resMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
        const resDay = String(currentDate.getDate()).padStart(2, '0');
        setDeadline(`${resYear}-${resMonth}-${resDay}`);
      }
    }
  }, [orderDate, productionDays]);

  // Auto-check for order deadline alerts (3-day and urgent)
  useEffect(() => {
    // Prevent concurrent execution
    if (isCheckingAlertsRef.current) return;
    isCheckingAlertsRef.current = true;

    const checkOrderAlerts = async () => {
      const teleConfig = getTelegramConfig();

      // Check for 3-day milestone alerts (exactly 3 days or more before deadline)
      const threeDayOrders = orders.filter(order => {
        const daysLeft = getDaysRemaining(order.deadline);
        const isNotCompleted = order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED;
        return daysLeft >= 3 && daysLeft < 4 && isNotCompleted && !threeDayAlertedOrderIdsRef.current.has(order.id);
      });

      if (threeDayOrders.length > 0) {
        const order = threeDayOrders[0];
        const daysLeft = getDaysRemaining(order.deadline);
        const customer = customers.find(c => c.id === order.customerId);

        // Show browser notification
        const alertMsg = `📌 ĐƠN HÀNG SẮP ĐÓ HẠN\n\nMã: #${order.id}\nKhách: ${customer?.name || 'N/A'}\nHạn: ${formatDate(order.deadline)}\nCòn: ${daysLeft} ngày`;
        alert(alertMsg);

        // Send Telegram if configured
        if (teleConfig) {
          const message = `
📌 <b>NHẮC NHỡ ĐƠN HÀNG - CÒN 3 NGÀY</b>

<b>Mã đơn:</b> #${order.id}
<b>Khách hàng:</b> ${customer?.name || 'N/A'}
<b>Sản phẩm:</b> ${order.items.map(i => i.productName).join(', ')}
<b>Hạn giao:</b> ${formatDate(order.deadline)}
<b>Tiến độ:</b> ${formatNumber(order.actualDeliveryQuantity || 0)}/${formatNumber(getTotalQuantity(order.items))}
<b>Trạng thái:</b> ${order.status}

⏰ Bạn còn 3 ngày để chuẩn bị giao hàng!
          `;
          await sendTelegramMessage(message);
        }

        // Mark orders as alerted using ref to prevent duplicate notifications
        threeDayOrders.forEach(o => threeDayAlertedOrderIdsRef.current.add(o.id));
      }

      // Check for urgent alerts (less than 3 days)
      const urgentOrders = orders.filter(order => {
        const daysLeft = getDaysRemaining(order.deadline);
        const isNotCompleted = order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED;
        return daysLeft < 3 && isNotCompleted && !alertedOrderIdsRef.current.has(order.id);
      });

      if (urgentOrders.length > 0) {
        const firstUrgentOrder = urgentOrders[0];
        const daysLeft = getDaysRemaining(firstUrgentOrder.deadline);
        const customer = customers.find(c => c.id === firstUrgentOrder.customerId);

        // Show browser alert
        const alertMsg = `⚠️ ĐƠN HÀNG GẬP\n\nMã: #${firstUrgentOrder.id}\nKhách: ${customer?.name || 'N/A'}\nHạn: ${formatDate(firstUrgentOrder.deadline)}\nCòn: ${daysLeft < 0 ? `QUÁ HẠN ${Math.abs(daysLeft)} ngày` : `${daysLeft} ngày`}`;
        alert(alertMsg);

        // Send Telegram if configured
        if (teleConfig) {
          const urgencyText = daysLeft < 0 ? `QUÁ HẠN ${Math.abs(daysLeft)} NGÀY` : `CÒN ${daysLeft} NGÀY`;
          const message = `
🚨 <b>CẢNH BÁO ĐƠN HÀNG GẬP - TỰ ĐỘNG</b> 🚨

<b>Mã đơn:</b> #${firstUrgentOrder.id}
<b>Khách hàng:</b> ${customer?.name || 'N/A'}
<b>Sản phẩm:</b> ${firstUrgentOrder.items.map(i => i.productName).join(', ')}
<b>Hạn giao:</b> ${formatDate(firstUrgentOrder.deadline)}
<b>Tình trạng:</b> <b>${urgencyText}</b>
<b>Tiến độ:</b> ${formatNumber(firstUrgentOrder.actualDeliveryQuantity || 0)}/${formatNumber(getTotalQuantity(firstUrgentOrder.items))}
<b>Trạng thái:</b> ${firstUrgentOrder.status}

⚠️ Cần xử lý ngay!
          `;
          await sendTelegramMessage(message);
        }

        // Mark orders as alerted using ref to prevent duplicate notifications
        urgentOrders.forEach(order => alertedOrderIdsRef.current.add(order.id));
      }

      isCheckingAlertsRef.current = false;
    };

    if (view === 'LIST' && orders.length > 0) {
      checkOrderAlerts();
    }
  }, [orders, view]);

  // Handlers
  const calculateTotal = () => items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert("Vui lòng chọn khách hàng!");
      return;
    }

    setIsSaving(true);
    try {
      const safeId = `${Date.now().toString(36).toUpperCase()}`;
      const newOrder: Order = {
        id: safeId.slice(0, 8),
        customerId: selectedCustomerId,
        items,
        totalAmount: calculateTotal(),
        depositAmount: depositAmount,
        status: OrderStatus.PENDING,
        deadline,
        createdAt: new Date(orderDate).toISOString(),
        notes,
        actualDeliveryQuantity: 0,
        statusReason: '',
        aiAnalysis: aiResult ? `Vật liệu: ${aiResult.materialEstimate}\nLời khuyên: ${aiResult.advice}` : undefined
      };

      await saveOrder(newOrder);
      await refreshData();
      setView('LIST');

      // Reset form
      setSelectedCustomerId('');
      setItems([{ productId: '', productName: '', quantity: 0, size: '', color: '', unitPrice: 0, imageUrl: '' }]);
      setAiResult(null);
      setProductionDays(14);
      setOrderDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setDepositAmount(0);
    } catch (err) {
      alert('Có lỗi khi tạo đơn hàng');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (items.some(i => !i.productName)) return alert("Vui lòng điền tên sản phẩm trước khi phân tích.");
    setIsAnalyzing(true);
    const result = await analyzeOrderRequirements(items);
    setAiResult(result);
    setIsAnalyzing(false);
  };

  const handleSaveTelegramConfig = () => {
    saveTelegramConfig(teleConfig.botToken, teleConfig.chatId);
    setShowTelegramModal(false);
    alert('Đã lưu cấu hình Telegram!');
  };

  const handleReportToTelegram = async (order: Order, daysLeft: number) => {
    if (!getTelegramConfig()) {
      setShowTelegramModal(true);
      return;
    }
    const customer = customers.find(c => c.id === order.customerId);
    const urgencyText = daysLeft < 0 ? `QUÁ HẠN ${Math.abs(daysLeft)} NGÀY` : `CÒN ${daysLeft} NGÀY`;
    const message = `
🚨 <b>CẢNH BÁO ĐƠN HÀNG GẤP</b> 🚨

<b>Mã đơn:</b> #${order.id}
<b>Khách hàng:</b> ${customer?.name || 'N/A'}
<b>Sản phẩm:</b> ${order.items.map(i => i.productName).join(', ')}
<b>Hạn giao:</b> ${formatDate(order.deadline)}
<b>Tình trạng:</b> <b>${urgencyText}</b>
<b>Tiến độ:</b> ${formatNumber(order.actualDeliveryQuantity || 0)}/${formatNumber(getTotalQuantity(order.items))}
<b>Trạng thái:</b> ${order.status}
<b>Ghi chú:</b> ${order.statusReason || 'Không có'}

⚠️ Cần xử lý ngay!
    `;
    const result = await sendTelegramMessage(message);
    if (result.success) alert('Đã gửi cảnh báo đến nhóm Telegram thành công!');
    else alert(`Gửi thất bại: ${result.error}`);
  };

  const openUpdateModal = (order: Order) => {
    setEditingOrder(order);
  };

  const handleUpdateProgress = async () => {
    await refreshData();
    setEditingOrder(null);
  };

  const handleGenerateEmail = async (order: Order) => {
    const customer = customers.find(c => c.id === order.customerId);
    if (!customer) return;
    setIsGeneratingEmail(true);
    const email = await generateOrderEmail(customer, order, 'CONFIRMATION');
    setGeneratedEmail(email);
    setIsGeneratingEmail(false);
  };

  const handleDeleteOrder = async (id: string) => {
    if (currentUser.role !== 'ADMIN') {
      alert("Bạn không có quyền xóa đơn hàng.");
      return;
    }
    if (window.confirm('Xóa đơn hàng này?')) {
      await deleteOrder(id);
      refreshData();
    }
  };

  // Excel Handlers
  const handleExport = (filteredOrders: Order[]) => {
    const fileName = searchTerm ? `don_hang_${searchTerm}.xlsx` : `danh_sach_don_hang_${new Date().getFullYear()}.xlsx`;
    exportOrdersToExcel(filteredOrders, customers, fileName);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentUser.role !== 'ADMIN') return;

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      const { newOrders, newCustomers } = await importOrdersFromExcel(file, customers);

      // Save data using BULK operations to prevent race conditions
      if (newCustomers.length > 0) {
        await saveCustomersBulk(newCustomers);
      }

      if (newOrders.length > 0) {
        await saveOrdersBulk(newOrders);
      }

      await refreshData();
      alert(`Đã nhập thành công ${newOrders.length} đơn hàng và cập nhật ${newCustomers.length} khách hàng!`);
    } catch (error: any) {
      console.error(error);
      alert('Lỗi nhập file Excel: ' + (error.message || 'Vui lòng kiểm tra định dạng file.'));
    } finally {
      setIsSaving(false);
      // Reset file input
      e.target.value = '';
    }
  };

  if (view === 'CREATE') {
    return (
      <div className="relative">
        {isSaving && (
          <div className="absolute inset-0 z-50 bg-white/50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
              <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="font-medium text-slate-700">Đang lưu đơn hàng...</span>
            </div>
          </div>
        )}
        <OrderCreateForm
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          setSelectedCustomerId={setSelectedCustomerId}
          orderDate={orderDate}
          setOrderDate={setOrderDate}
          productionDays={productionDays}
          setProductionDays={setProductionDays}
          deadline={deadline}
          setDeadline={setDeadline}
          depositAmount={depositAmount}
          setDepositAmount={setDepositAmount}
          notes={notes}
          setNotes={setNotes}
          items={items}
          setItems={setItems}
          onCancel={() => setView('LIST')}
          onSubmit={handleCreateOrder}
          aiResult={aiResult}
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAIAnalysis}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading Overlay for Global Actions */}
      {isSaving && (
        <div className="fixed inset-0 z-[100] bg-black/20 flex items-center justify-center">
          <div className="bg-white p-5 rounded-xl shadow-2xl flex flex-col items-center gap-3">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="font-semibold text-slate-700">Đang xử lý dữ liệu...</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Quản Lý Đơn Hàng</h2>
        <div className="flex gap-2 items-center">

          {/* Import Button - ADMIN ONLY */}
          {currentUser.role === 'ADMIN' && (
            <label className="cursor-pointer bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Nhập Excel
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImport} />
            </label>
          )}

          {/* Telegram Config - Available to all users */}
          <button
            onClick={() => setShowTelegramModal(true)}
            className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Cấu hình Telegram
          </button>

          <button
            onClick={() => setView('CREATE')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            + Tạo Đơn Mới
          </button>
        </div>
      </div>

      {/* Active Orders Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">📋 Đơn Hàng Đang Xử Lý</h3>
        <OrderList
          orders={orders.filter(o => o.status !== OrderStatus.COMPLETED)}
          customers={customers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus === 'ALL' ? 'ALL' : (filterStatus === OrderStatus.COMPLETED ? 'ALL' : filterStatus)}
          setFilterStatus={setFilterStatus}
          onZoomImage={setZoomedImage}
          onReportTelegram={handleReportToTelegram}
          onOpenUpdateModal={openUpdateModal}
          onGenerateEmail={handleGenerateEmail}
          onDeleteOrder={handleDeleteOrder}
          onExportExcel={handleExport}
          onViewDetail={setViewingOrder}
          currentUser={currentUser}
        />
      </div>

      {/* Completed Orders Section */}
      <div className="pt-8">
        <div className="flex items-center gap-3 cursor-pointer mb-4" onClick={() => setShowCompletedOrders(!showCompletedOrders)}>
          <h3 className="text-lg font-semibold text-slate-800">✅ Đơn Hàng Đã Hoàn Thành</h3>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {orders.filter(o => o.status === OrderStatus.COMPLETED).length}
          </span>
          <svg
            className={`w-5 h-5 text-slate-600 transition-transform ${showCompletedOrders ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {showCompletedOrders && (
          <OrderList
            orders={orders.filter(o => o.status === OrderStatus.COMPLETED)}
            customers={customers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={OrderStatus.COMPLETED}
            setFilterStatus={() => { }}
            onZoomImage={setZoomedImage}
            onReportTelegram={handleReportToTelegram}
            onOpenUpdateModal={openUpdateModal}
            onGenerateEmail={handleGenerateEmail}
            onDeleteOrder={handleDeleteOrder}
            onExportExcel={handleExport}
            onViewDetail={setViewingOrder}
            currentUser={currentUser}
          />
        )}
      </div>

      <OrderUpdateModal
        editingOrder={editingOrder}
        onCancel={() => setEditingOrder(null)}
        onSave={handleUpdateProgress}
      />

      <OrderDetailModal
        order={viewingOrder}
        customer={viewingOrder ? customers.find(c => c.id === viewingOrder.customerId) : undefined}
        onClose={() => setViewingOrder(null)}
      />

      {showTelegramModal && (
        <TelegramConfigModal
          teleConfig={teleConfig}
          setTeleConfig={setTeleConfig}
          onSave={handleSaveTelegramConfig}
          onClose={() => setShowTelegramModal(false)}
        />
      )}

      {(generatedEmail || isGeneratingEmail) && (
        <EmailDraftModal
          emailContent={generatedEmail}
          setEmailContent={setGeneratedEmail}
          isGenerating={isGeneratingEmail}
          onClose={() => { setGeneratedEmail(''); setIsGeneratingEmail(false); }}
        />
      )}

      <ImageLightbox
        imageUrl={zoomedImage}
        onClose={() => setZoomedImage(null)}
      />
    </div>
  );
};

export default Orders;