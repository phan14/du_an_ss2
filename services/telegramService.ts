const TELEGRAM_CONFIG_KEY = 'arden_telegram_config';

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export const getTelegramConfig = (): TelegramConfig | null => {
  const data = localStorage.getItem(TELEGRAM_CONFIG_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveTelegramConfig = (botToken: string, chatId: string): void => {
  localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify({ botToken, chatId }));
};

export const sendTelegramMessage = async (message: string): Promise<{ success: boolean; error?: string }> => {
  const config = getTelegramConfig();
  if (!config || !config.botToken || !config.chatId) {
    return { success: false, error: 'Chưa cấu hình Telegram Bot.' };
  }

  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: 'HTML'
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.description || 'Lỗi gửi tin nhắn');
    }
    return { success: true };
  } catch (error: any) {
    console.error('Telegram Error:', error);
    return { success: false, error: error.message };
  }
};