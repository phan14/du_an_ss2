import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.local.TELEGRAM_BOT_TOKEN!;
  const chatId = process.env.TELEGRAM_CHAT_ID!;

  // 👉 TODO: query DB lấy đơn chưa gửi
  const fakeOrder = {
    id: "DH001",
    customer: "Nguyễn Văn A",
    total: 500000,
  };

  const message = `
🛒 ĐƠN HÀNG MỚI
Mã: ${fakeOrder.id}
Khách: ${fakeOrder.customer}
Tổng tiền: ${fakeOrder.total}đ
`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });

  return NextResponse.json({ success: true });
}