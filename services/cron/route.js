export async function GET(request) {
  const TELEGRAM_TOKEN = process.env.local.VITE_TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.local.VITE_TELEGRAM_CHAT_ID;

  const message = "Cron job chạy thành công 🚀";

  await fetch(
    `https://api.telegram.org/bot${VITE_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${VITE_TELEGRAM_CHAT_ID}&text=${message}`
  );

  return new Response("OK");
}