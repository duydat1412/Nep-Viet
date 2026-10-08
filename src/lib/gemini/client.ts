import { GoogleGenAI } from '@google/genai';
import { FALLBACK_MODEL_CHAIN } from '../constants/models';

/**
 * Trình phân tích cú pháp JSON an toàn, tự động sửa lỗi xuống dòng chưa escape
 * hoặc tự động đóng ngoặc/dấu nháy kép nếu JSON bị cắt ngắn giữa chừng.
 */
export function safeParseJson(raw: string): any {
  if (!raw || typeof raw !== 'string') throw new Error('Dữ liệu JSON phản hồi trống');

  let text = raw.trim();
  if (text.startsWith('```json')) text = text.slice(7);
  else if (text.startsWith('```')) text = text.slice(3);
  if (text.endsWith('```')) text = text.slice(0, -3);
  text = text.trim();

  // 1. Thử parse thông thường trước
  try {
    return JSON.parse(text);
  } catch (err1) {
    // Tiếp tục pass xử lý lỗi ký tự điều khiển
  }

  // 2. Pass 1: Xử lý escape các ký tự xuống dòng / tab bên trong chuỗi nháy kép
  try {
    let inString = false;
    let escaped = false;
    let fixed = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (escaped) {
        fixed += char;
        escaped = false;
        continue;
      }
      if (char === '\\') {
        fixed += char;
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        fixed += char;
        continue;
      }
      if (inString) {
        if (char === '\n') {
          fixed += '\\n';
          continue;
        }
        if (char === '\r') continue;
        if (char === '\t') {
          fixed += '\\t';
          continue;
        }
      }
      fixed += char;
    }
    return JSON.parse(fixed);
  } catch (err2) {
    // Tiếp tục pass tự động đóng ngoặc / nháy kép nếu bị ngắt giữa chừng
  }

  // 3. Pass 2: Tự động đóng nháy kép và ngoặc nhọn/vuông nếu bị đứt đoạn
  try {
    let inString = false;
    let escaped = false;
    const stack: string[] = [];
    let fixed = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (escaped) {
        fixed += char;
        escaped = false;
        continue;
      }
      if (char === '\\') {
        fixed += char;
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        fixed += char;
        continue;
      }
      if (!inString) {
        if (char === '{' || char === '[') {
          stack.push(char);
        } else if (char === '}') {
          if (stack[stack.length - 1] === '{') stack.pop();
        } else if (char === ']') {
          if (stack[stack.length - 1] === '[') stack.pop();
        }
      } else {
        if (char === '\n') {
          fixed += '\\n';
          continue;
        }
        if (char === '\r') continue;
        if (char === '\t') {
          fixed += '\\t';
          continue;
        }
      }
      fixed += char;
    }

    if (inString) {
      fixed += '"';
    }

    while (stack.length > 0) {
      const open = stack.pop();
      if (open === '{') fixed += '}';
      else if (open === '[') fixed += ']';
    }

    return JSON.parse(fixed);
  } catch (err3: any) {
    console.error('Không thể phục hồi JSON:', text.slice(0, 300));
    throw new Error(`Lỗi cú pháp phản hồi AI: ${err3.message}`);
  }
}

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  responseSchema: object,
  preferredModel?: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const ai = new GoogleGenAI({ apiKey });
  const configuredDefault = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const initialModel = preferredModel || configuredDefault;

  // Build model cascade list starting with initialModel, then fallback candidates
  const modelsToTry: string[] = [initialModel];
  for (const m of FALLBACK_MODEL_CHAIN) {
    if (!modelsToTry.includes(m)) {
      modelsToTry.push(m);
    }
  }

  const timeoutMs = parseInt(process.env.GEMINI_TIMEOUT_MS || '20000', 10);
  let lastError: any = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    const isFallback = i > 0;
    const temperature = isFallback ? 0.0 : 0.2;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema,
          temperature,
          maxOutputTokens: 8192,
        },
      });
      clearTimeout(id);

      const text = response.text;
      if (!text) throw new Error(`Phản hồi trống từ model ${currentModel}`);

      const parsed = safeParseJson(text);
      if (parsed && typeof parsed === 'object') {
        parsed._used_model = currentModel;
        parsed._is_fallback = isFallback;
      }

      if (isFallback) {
        console.warn(`[Gemini Auto-Fallback] Đã tự động chuyển đổi thành công sang model: ${currentModel} (Model ban đầu ${initialModel} gặp sự cố hoặc hết quota)`);
      }

      return parsed;
    } catch (error: any) {
      clearTimeout(id);
      lastError = error;

      console.warn(
        `[Gemini Warning] Model '${currentModel}' thất bại (status: ${error?.status || error?.name || 'unknown'}, message: ${error?.message?.slice(0, 100)}...). ` +
        (i < modelsToTry.length - 1 ? `Đang tự động chuyển sang model dự phòng: '${modelsToTry[i + 1]}'...` : 'Đã thử hết danh sách model dự phòng.')
      );

      // Nếu còn model trong cascade list, tiếp tục thử model tiếp theo
      if (i < modelsToTry.length - 1) {
        continue;
      }
    }
  }

  throw lastError || new Error('Tất cả các model Gemini đều không khả dụng hoặc đã hết quota');
}

