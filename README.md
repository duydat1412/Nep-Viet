# NẾP VIỆT – Nếp Việt, nét riêng.

> Nền tảng AI Stylist phối Việt phục cho người trẻ – Tôn vinh bản sắc, chuẩn mực văn hóa.
> Bài dự thi cuộc thi **AI Arena Vietnam 2026** (Hệ sinh thái Gemini).

---

## 🌟 Giới thiệu

**Nếp Việt** giúp thế hệ trẻ (Gen Z, học sinh, sinh viên) tự tin khám phá và phối trang phục truyền thống Việt Nam (Việt phục) theo phong cách riêng, vừa hiện đại vừa giữ trọn vẹn giá trị và tính chuẩn xác văn hóa.

### Nguyên tắc thiết kế cốt lõi
1. **Rule-Based Cultural Guardrails:** Mọi quy chuẩn trang nghiêm, kiêng kỵ hay nẹp vạt đều do **Code đánh giá dựa trên dữ liệu biên tập có nguồn gốc thực tế** (`data/cultural_rules.json`).
2. **Deterministic Color Harmony:** Điểm hài hòa màu sắc do thuật toán góc màu tuần hoàn CIELAB/HSL tính toán độc lập, khách quan và minh bạch.
3. **Gemini vai trò Stylist & Diễn giải:** Gemini AI **không tự phán** mức cảnh báo hay điểm số; Gemini diễn giải bối cảnh, xếp hạng các tổ hợp đã được Rule Engine tiền kiểm duyệt và trích dẫn thẻ căn cứ văn hóa.
4. **Minh bạch khi thiếu dữ liệu:** Khi dữ liệu chưa bao quát một sự kết hợp, hệ thống trả về trạng thái `CHUA_DU_CAN_CU` (⚪) ngay từ code với **0 token, không gọi AI**.

---

## 🏗️ Kiến trúc kỹ thuật (Vertical Slice)

```
[Browser / User] (Form 4 bước: Dịp, Nhóm Việt phục, Mức diễn giải, Tone màu)
       │
       ▼ (POST /api/recommend)
[Next.js Server API Route]
       ├── 1. Rate Limiting (Token-bucket per-IP)
       ├── 2. Rule Engine: Kiểm tra ma trận độ phủ & Đánh giá quy tắc văn hóa
       │       └── Nếu chưa có dữ liệu ──► Trả ngay CHUA_DU_CAN_CU (0 token)
       ├── 3. Fallback Presets Lookup (SHA-256 matching)
       ├── 4. Gemini API Call (Structured Output / responseSchema)
       │       └── Timeout 8s / Retry với Model Fallback
       ├── 5. Post-Validator (Kiểm tra ID, kiểm tra nguồn, đối soát mức cảnh báo)
       └── 6. Assemble Lookbook Payload (Code ghi đè mức cảnh báo & điểm màu)
       │
       ▼
[Client / Lookbook Card (9:16)]
       ├── Hiển thị lưới phân rã (Outfit Breakdown Grid)
       ├── Badge chuẩn hóa (🟢 XANH / 🟡 VANG / 🔴 DO / ⚪ CHUA_DU_CAN_CU)
       ├── Điểm hài hòa màu sắc & Lời diễn giải văn hóa có trích nguồn
       └── Xuất ảnh 1080x1920 (Dual-pass Safari hardened qua html-to-image)
```

---

## 🚀 Khởi chạy dự án

### Yêu cầu môi trường
- Node.js >= 18.18.0 (khuyên dùng Node 20+)
- npm hoặc yarn/pnpm

### Cài đặt & Chạy Local
```bash
# Cài đặt dependencies
npm install

# Kiểm tra sức khỏe kết nối Gemini model
npm run check-model

# Kiểm tra tính toàn vẹn dữ liệu biên tập
npm run validate-data

# Chạy kiểm thử tự động (Unit Tests)
npm run test

# Chạy môi trường phát triển (Dev Server)
npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

---

## 🧪 3 Kịch bản kiểm thử lát cắt (Vertical Slice Scenarios)

1. **Kịch bản 1 (🟢 XANH):** 
   - Chọn: Đi lễ $\rightarrow$ Áo ngũ thân $\rightarrow$ Truyền thống nguyên bản $\rightarrow$ Tone Trầm.
   - Kết quả: Áo ngũ thân + Quần lụa trắng + Guốc mộc. Đạt chuẩn XANH, không có cảnh báo.
2. **Kịch bản 2 (🟡 VÀNG):** 
   - Chọn: Đi lễ $\rightarrow$ Áo ngũ thân $\rightarrow$ Phối hiện đại $\rightarrow$ Tone Trầm.
   - Kết quả: Áo ngũ thân + Quần lụa + Sneaker trắng + Túi canvas. Kích hoạt luật `R_DILE_03` cảnh báo VÀNG về việc tiết chế phụ kiện đường phố nơi thờ tự.
3. **Kịch bản 3 (⚪ CHƯA ĐỦ CĂN CỨ):** 
   - Chọn: Kỷ yếu $\rightarrow$ Áo tứ thân.
   - Kết quả: Hệ thống chặn ngay lập tức, không tốn quota AI, hiển thị thông báo chưa đủ tư liệu biên tập.

---

## 📄 Bản quyền & Tác giả
- Đội thi: Nếp Việt Team
- Cuộc thi: AI Arena Vietnam 2026
