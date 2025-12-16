# Cấu Hình Telegram Notifications

## Tổng Quan
Hệ thống sẽ tự động cảnh báo qua Telegram khi đơn hàng còn dưới 3 ngày đến hạn giao hàng, và cho phép bạn thủ công gửi thông báo cho bất kỳ đơn hàng nào.

## Cách Thiết Lập

### Bước 1: Tạo Telegram Bot
1. Mở Telegram và tìm `@BotFather`
2. Gửi `/start` rồi `/newbot`
3. Đặt tên bot (VD: "Arden Factory Manager Bot")
4. Đặt username bot (phải kết thúc bằng "bot", VD: "arden_factory_bot")
5. **Sao chép Bot Token** (dạng: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Bước 2: Tạo Group Telegram
1. Tạo nhóm Telegram mới
2. Thêm bot bạn vừa tạo vào nhóm (tìm `@your_bot_username`)
3. Làm cho bot trở thành quản trị viên trong nhóm (Admin)

### Bước 3: Lấy Chat ID của Group
**Cách 1: Dùng Link Ngay**
1. Mở Terminal/Command Prompt
2. Chạy lệnh sau (thay `YOUR_BOT_TOKEN`):
   ```bash
   curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates"
   ```
3. Gửi bất kỳ tin nhắn nào trong nhóm
4. Chạy lại lệnh trên
5. Tìm `"chat":{"id": -100xxxxxxx}` - **Đó là Chat ID của bạn**

**Cách 2: Dùng Bot Khác**
- Tìm `@get_id_bot` trong Telegram
- Thêm vào nhóm của bạn
- Nó sẽ tự động gửi Chat ID

### Bước 4: Cấu Hình Trong Ứng Dụng
1. Mở trang **Quản Lý Đơn Hàng**
2. Nhấp nút **"Cấu Hình Telegram"** (nút xanh lam ở góc trên phải)
3. Nhập:
   - **Bot Token**: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
   - **Chat ID**: `-100xxxxxxxxx` (nếu là nhóm, bắt đầu bằng `-100`)
4. Nhấp **"Lưu Cấu Hình"**

## Sử Dụng

### Cảnh Báo Tự Động
- Mỗi khi bạn mở trang **Quản Lý Đơn Hàng**, hệ thống sẽ tự động:
  1. Kiểm tra tất cả đơn hàng còn < 3 ngày đến hạn
  2. Hiển thị **alert** trên trình duyệt
  3. Gửi thông báo đến nhóm Telegram (nếu đã cấu hình)

### Gửi Thủ Công
- Trong danh sách đơn hàng, nhấp nút **"Telegram"** bên cạnh hạn giao
- Thông báo sẽ được gửi ngay đến nhóm với thông tin chi tiết

## Troubleshooting

### Không nhận được thông báo
**Kiểm tra:**
1. ✅ Bot Token đúng (copy-paste chính xác, không có khoảng trắng)
2. ✅ Chat ID đúng (bắt đầu bằng `-100` với nhóm)
3. ✅ Bot có quyền Admin trong nhóm
4. ✅ Trang được tải lại sau khi cấu hình
5. ✅ Mở Browser Console (F12 → Console) để xem lỗi

### Kiểm tra kết nối
Chạy trong Console trình duyệt:
```javascript
const result = await fetch('https://api.telegram.org/bot123456789:TOKEN/getMe');
const data = await result.json();
console.log(data);
```
Nếu thành công sẽ hiển thị thông tin bot.

### Tin nhắn không gửi được
- Kiểm tra internet connection
- Đảm bảo bot vẫn còn trong nhóm
- Thử gửi test message từ lệnh: 
  ```bash
  curl -X POST "https://api.telegram.org/bot123456789:TOKEN/sendMessage" \
    -d "chat_id=-100xxxxxxx" \
    -d "text=Test Message"
  ```

## Ví Dụ Thông Báo

Bạn sẽ nhận được thông báo dạng:
```
🚨 CẢNH BÁO ĐƠN HÀNG GẬP 🚨

Mã đơn: #ORD123
Khách hàng: Công Ty ABC
Sản phẩm: Hộp giấy A4, Túi xách
Hạn giao: 14-12-2025
Tình trạng: CÒN 2 NGÀY
Tiến độ: 50/100
Trạng thái: Đang sản xuất
```

## Lưu Ý Bảo Mật
- ⚠️ **KHÔNG chia sẻ Bot Token** công khai
- ⚠️ **KHÔNG commit .env.local** vào Git
- ✅ Lưu trữ Bot Token an toàn trong `.env.local`
