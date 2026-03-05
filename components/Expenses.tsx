import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { getExpenses, saveExpense, deleteExpense } from '../services/storageService';
import { exportExpensesToExcel } from '../services/excelService';

interface ExpensesProps {
  onLoadExpenses: (expenses: Expense[]) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ onLoadExpenses }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [amountDisplay, setAmountDisplay] = useState<string>('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter State
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setIsLoading(true);
    const data = await getExpenses();
    setExpenses(data);
    onLoadExpenses(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || amount <= 0 || !category.trim()) {
      alert('Vui lòng nhập đầy đủ tên, loại và số tiền chi phí.');
      return;
    }

    const expense: Expense = {
      id: editingId || `EXP_${Date.now()}`,
      name: name.trim(),
      amount,
      category: category.trim(),
      date,
      notes: notes.trim(),
      createdAt: editingId ? expenses.find(e => e.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    await saveExpense(expense);
    await loadExpenses();
    
    // Reset Form
    setName('');
    setAmount(0);
    setAmountDisplay('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setName(expense.name);
    setAmount(expense.amount);
    setAmountDisplay(expense.amount.toLocaleString('vi-VN'));
    setCategory(expense.category);
    setDate(expense.date);
    setNotes(expense.notes || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khoản chi phí này?')) return;
    await deleteExpense(id);
    await loadExpenses();
  };

  const handleCancel = () => {
    setName('');
    setAmount(0);
    setAmountDisplay('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setEditingId(null);
    setShowForm(false);
  };

  // Get unique months from expenses
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  }, [expenses]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      // Category filter
      if (filterCategory !== 'ALL' && exp.category !== filterCategory) return false;
      
      // Month filter
      if (filterMonth !== 'ALL') {
        const expDate = new Date(exp.date);
        const expMonthKey = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`;
        if (expMonthKey !== filterMonth) return false;
      }
      
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return exp.name.toLowerCase().includes(term) || 
               (exp.notes && exp.notes.toLowerCase().includes(term));
      }
      
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filterCategory, filterMonth, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Get unique categories from actual data
    const categorySet = new Set(filteredExpenses.map(exp => exp.category));
    const byCategory = Array.from(categorySet).map(cat => {
      const categoryExpenses = filteredExpenses.filter(exp => exp.category === cat);
      const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return { category: cat, total, count: categoryExpenses.length };
    }).sort((a, b) => b.total - a.total);

    return {
      totalExpenses,
      totalCount: filteredExpenses.length,
      byCategory
    };
  }, [filteredExpenses]);

  const formatNumber = (num: number) => num.toLocaleString('vi-VN');
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    } catch { return dateStr; }
  };

  const handleAmountChange = (value: string) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue === '') {
      setAmount(0);
      setAmountDisplay('');
    } else {
      const num = parseInt(numericValue, 10);
      setAmount(num);
      setAmountDisplay(num.toLocaleString('vi-VN'));
    }
  };

  const handleExport = () => {
    exportExpensesToExcel(filteredExpenses);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in px-3 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Quản Lý Chi Phí
          </h2>
          <p className="text-slate-500 text-sm mt-1">Theo dõi và quản lý các khoản chi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Xuất Excel
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm Chi Phí
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-red-100 text-sm mb-1">Tổng Chi Phí</p>
              <p className="text-3xl font-bold">{formatNumber(stats.totalExpenses)} đ</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm mb-1">Số Khoản Chi</p>
              <p className="text-3xl font-bold">{stats.totalCount}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {editingId ? 'Chỉnh Sửa Chi Phí' : 'Thêm Chi Phí Mới'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên Chi Phí <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Mua vải cotton"
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Số Tiền <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={amountDisplay}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Loại Chi Phí <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="VD: Nguyên liệu, Lương, Điện nước..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ngày Chi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ghi Chú</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú thêm về chi phí này..."
                rows={3}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
              >
                {editingId ? 'Cập Nhật' : 'Thêm Chi Phí'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Stats */}
      {stats.byCategory.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Chi Phí Theo Loại
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.byCategory.map(item => (
              <div key={item.category} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">{item.category}</p>
                <p className="text-xl font-bold text-slate-800">{formatNumber(item.total)} đ</p>
                <p className="text-xs text-slate-500 mt-1">{item.count} khoản</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tìm Kiếm</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, ghi chú..."
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Loại</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="ALL">Tất cả loại</option>
              {Array.from(new Set(expenses.map(e => e.category))).sort().map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tháng</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="ALL">Tất cả tháng</option>
              {availableMonths.map(month => {
                const [year, monthNum] = month.split('-');
                return (
                  <option key={month} value={month}>
                    Tháng {monthNum}/{year}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('ALL');
                setFilterMonth('ALL');
              }}
              className="w-full p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm font-medium"
            >
              Xóa Bộ Lọc
            </button>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Ngày</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Tên Chi Phí</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Loại</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Số Tiền</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Ghi Chú</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p>Chưa có chi phí nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{formatDate(expense.date)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{expense.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                      {formatNumber(expense.amount)} đ
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
                      {expense.notes || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
