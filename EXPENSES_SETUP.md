# Hướng Dẫn Cài Đặt Bảng Chi Phí (Expenses)

## 🎯 Tổng Quan

Tính năng **Quản Lý Chi Phí** cho phép bạn:
- ✅ Ghi lại các khoản chi phí (nguyên liệu, lương, điện nước, vận chuyển...)
- ✅ Phân loại chi phí theo danh mục
- ✅ Xem thống kê chi phí theo tháng, theo loại
- ✅ Xuất báo cáo Excel chi phí
- ✅ Dashboard hiển thị tổng chi phí và lãi ròng

---

## 🗄️ Tạo Bảng Trong Supabase

### Bước 1: Truy cập Supabase SQL Editor
1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor** (biểu tượng database bên trái)

### Bước 2: Chạy SQL Script
Copy và paste đoạn SQL sau vào editor, sau đó nhấn **RUN**:

```sql
-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Enable Row Level Security (RLS)
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth setup)
CREATE POLICY "Allow all operations on expenses" 
ON expenses 
FOR ALL 
USING (true) 
WITH CHECK (true);
```

### Bước 3: Kiểm tra
Sau khi chạy script, kiểm tra:
1. Vào **Table Editor**
2. Tìm bảng `expenses`
3. Xác nhận các cột: `id`, `name`, `amount`, `category`, `date`, `notes`, `created_at`

---

## 📝 Cấu Trúc Bảng

| Cột | Kiểu | Mô Tả |
|-----|------|-------|
| `id` | TEXT | Mã chi phí (Primary Key) |
| `name` | TEXT | Tên chi phí |
| `amount` | NUMERIC | Số tiền chi |
| `category` | TEXT | Loại chi phí (Nguyên liệu, Lương, Điện nước...) |
| `date` | TEXT | Ngày chi (ISO format) |
| `notes` | TEXT | Ghi chú (optional) |
| `created_at` | TEXT | Ngày tạo record |

---

## 🎨 Các Loại Chi Phí Mặc Định

Ứng dụng đã có sẵn 8 loại chi phí:

1. **Nguyên liệu** - Mua vải, phụ liệu
2. **Lương** - Chi trả lương nhân viên
3. **Điện nước** - Hóa đơn điện, nước
4. **Vận chuyển** - Chi phí giao hàng, ship
5. **Bảo trì** - Sửa chữa máy móc
6. **Văn phòng** - Văn phòng phẩm, thuê mặt bằng
7. **Marketing** - Quảng cáo, truyền thông
8. **Khác** - Các chi phí khác

---

## 🚀 Sử Dụng

### Thêm Chi Phí Mới
1. Vào trang **Chi Phí** từ menu
2. Nhấn **Thêm Chi Phí**
3. Điền thông tin:
   - Tên chi phí *
   - Số tiền *
   - Loại chi phí *
   - Ngày chi *
   - Ghi chú (tùy chọn)
4. Nhấn **Thêm Chi Phí**

### Xem Thống Kê
- **Dashboard**: Hiển thị tổng chi phí, lãi ròng (doanh thu - chi phí)
- **Trang Chi Phí**: 
  - Xem chi tiết từng khoản chi
  - Lọc theo loại, tháng
  - Tìm kiếm theo tên
  - Xem thống kê theo loại

### Xuất Báo Cáo
Nhấn **Xuất Excel** để tải file `danh_sach_chi_phi.xlsx` bao gồm:
- Danh sách tất cả chi phí đã lọc
- Tổng cộng chi phí

---

## 🔧 Troubleshooting

### Lỗi: "relation 'expenses' does not exist"
➡️ Chưa tạo bảng trong Supabase. Chạy lại SQL script ở Bước 2.

### Lỗi: "permission denied for table expenses"
➡️ RLS policy chưa đúng. Chạy lại phần policy trong SQL script.

### Không hiển thị dữ liệu
➡️ Kiểm tra:
1. Bảng đã được tạo trong Supabase
2. Kết nối Supabase trong `supabaseClient.ts` đúng
3. Console browser để xem lỗi

---

## 📊 Dashboard Updates

Dashboard hiện tại hiển thị 4 chỉ số chính:

1. **Tổng Doanh Thu** - Tổng tiền từ đơn hàng
2. **Tổng Chi Phí** - Tổng các khoản chi đã ghi
3. **Lãi Ròng** - Doanh thu đã thu - Tổng chi phí
4. **Đơn Chờ Xử Lý** - Số đơn hàng đang chờ

---

## 🎉 Hoàn Tất!

Tính năng Chi Phí đã sẵn sàng sử dụng. Bạn có thể:
- Ghi lại mọi khoản chi
- Theo dõi chi phí theo thời gian
- So sánh thu chi để tính lãi/lỗ
- Xuất báo cáo cho kế toán

**Lưu ý**: Dữ liệu chi phí sẽ được backup cùng với Orders và Customers khi bạn sử dụng tính năng backup hệ thống.
