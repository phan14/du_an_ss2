
import React, { useState, useEffect } from 'react';
import { GluingRecord, Order, User } from '../types';
import { getGluingRecords, saveGluingRecord, deleteGluingRecord } from '../services/storageService';
import { exportGluingToExcel } from '../services/excelService';
import GluingList from './gluing/GluingList';
import GluingFormModal from './gluing/GluingFormModal';
import GluingDetailModal from './gluing/GluingDetailModal';

interface GluingProps {
  orders: Order[];
  currentUser: User;
}

const Gluing: React.FC<GluingProps> = ({ orders, currentUser }) => {
  const [records, setRecords] = useState<GluingRecord[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Partial<GluingRecord>>({});
  const [viewingRecord, setViewingRecord] = useState<GluingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getGluingRecords();
    setRecords(data);
  };

  const handleSave = async (record: GluingRecord) => {
    setIsLoading(true);
    try {
        const newRecord = {
            ...record,
            id: record.id || `GLU-${Date.now()}`
        };
        await saveGluingRecord(newRecord);
        await loadData();
        setIsEditing(false);
        setCurrentRecord({});
    } catch (error) {
        alert("Lỗi khi lưu dữ liệu");
    } finally {
        setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (currentUser.role !== 'ADMIN') {
        alert("Bạn không có quyền xóa dữ liệu này.");
        return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      await deleteGluingRecord(id);
      loadData();
    }
  };

  const handleExport = () => {
    if (records.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }
    const fileName = `ui_keo_ep_keo_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportGluingToExcel(records, fileName);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Quản Lý Ủi Keo / Ép Keo</h2>
            <p className="text-slate-500 text-sm">Theo dõi quy trình ép keo cho các đơn hàng</p>
        </div>
        
        <div className="flex gap-3">
            <button
                onClick={handleExport}
                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Xuất Excel
            </button>

            <button 
              onClick={() => { setCurrentRecord({}); setIsEditing(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Thêm Mới
            </button>
        </div>
      </div>

      <GluingList 
        records={records}
        onEdit={(rec) => { setCurrentRecord(rec); setIsEditing(true); }}
        onDelete={handleDelete}
        onView={(rec) => setViewingRecord(rec)}
      />

      {isEditing && (
        <GluingFormModal 
          currentRecord={currentRecord}
          orders={orders}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {viewingRecord && (
        <GluingDetailModal 
          record={viewingRecord} 
          onClose={() => setViewingRecord(null)} 
        />
      )}
      
      {isLoading && (
           <div className="fixed inset-0 z-[100] bg-black/20 flex items-center justify-center">
               <div className="bg-white p-5 rounded-xl shadow-2xl flex flex-col items-center gap-3">
                   <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                   <span className="font-semibold text-slate-700">Đang xử lý...</span>
               </div>
           </div>
       )}
    </div>
  );
};

export default Gluing;
