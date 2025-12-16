import { GoogleGenAI, Type } from "@google/genai";
import { Order, OrderItem, Customer } from '../types';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes an order to estimate material requirements and production time.
 */
export const analyzeOrderRequirements = async (items: OrderItem[]): Promise<{ materialEstimate: string; productionTimeEstimate: string; advice: string }> => {
  try {
    const itemsDescription = items.map(i => `${i.quantity} cái ${i.productName} (Size ${i.size})`).join(', ');
    
    const prompt = `
      Với vai trò là chuyên gia quản lý sản xuất may mặc tại xưởng may Arden.
      Hãy phân tích đơn hàng sau: ${itemsDescription}.
      
      Hãy cung cấp:
      1. Ước tính nguyên phụ liệu cần thiết (vải, chỉ, cúc...).
      2. Ước tính thời gian sản xuất (giả sử xưởng có 10 công nhân).
      3. Lời khuyên kỹ thuật hoặc lưu ý quan trọng cho đơn hàng này.
      
      Trả về kết quả dưới dạng JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            materialEstimate: { type: Type.STRING, description: "Chi tiết ước tính vải và phụ liệu" },
            productionTimeEstimate: { type: Type.STRING, description: "Ước tính thời gian hoàn thành" },
            advice: { type: Type.STRING, description: "Lời khuyên kỹ thuật" }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return {
      materialEstimate: "Không thể phân tích lúc này.",
      productionTimeEstimate: "Không thể phân tích lúc này.",
      advice: "Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau."
    };
  }
};

/**
 * Generates a professional email draft for the customer.
 */
export const generateOrderEmail = async (customer: Customer, order: Order, type: 'CONFIRMATION' | 'STATUS_UPDATE'): Promise<string> => {
  try {
    const itemsDesc = order.items.map(i => `${i.quantity} x ${i.productName}`).join(', ');
    const context = type === 'CONFIRMATION' 
      ? `Xác nhận đơn hàng mới #${order.id}. Tổng tiền: ${order.totalAmount.toLocaleString('vi-VN')} VNĐ. Hạn giao: ${order.deadline}.`
      : `Cập nhật trạng thái đơn hàng #${order.id} là: ${order.status}.`;

    const prompt = `
      Viết một email chuyên nghiệp, lịch sự bằng tiếng Việt gửi cho khách hàng tên là ${customer.name}.
      Nội dung: ${context}.
      Đơn hàng gồm: ${itemsDesc}.
      Tên xưởng may: Xưởng may Arden.
      Văn phong: Thân thiện, chuyên nghiệp, khuyến khích hợp tác lâu dài.
      Chỉ trả về nội dung text của email, không cần tiêu đề JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Không thể tạo email.";
  } catch (error) {
    console.error("Gemini email generation error:", error);
    return "Lỗi khi tạo email tự động.";
  }
};
