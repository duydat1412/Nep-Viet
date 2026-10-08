# ❖ NẾP VIỆT — Nếp Việt, Nét Riêng.

> **Nền tảng AI Heritage Stylist & Không Gian Giám Tuyển Y Phục Việt Đương Đại.**  
> Dự án tham gia cuộc thi **AI Arena Vietnam 2026** (Hệ sinh thái Google Gemini & Web AI).

[![Next.js](https://img.shields.io/badge/Next.js-14.2.24-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-1.0_/_Flash-8E75C2?style=flat-square&logo=google)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Tests-15%2F15_Passing-success?style=flat-square)](https://vitest.dev/)
[![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)]()

---

## 📌 BÁO CÁO HIỆN TRẠNG DỰ ÁN (PROJECT STATUS REPORT)
*Cập nhật: Tháng 10/2026 — Giai đoạn: Production-Ready MVP & High-Fidelity Atelier*

### 1. Tổng quan & Định vị Sản phẩm
**Nếp Việt** giải quyết rào cản lớn nhất của người trẻ khi tiếp cận cổ phục Việt Nam: **sự e dè trước các quy tắc điển chế, kiêng kỵ văn hóa** và **thiếu công cụ hỗ trợ phối đồ linh hoạt** giữa thẩm mỹ truyền thống với lối sống đương đại.

Dự án kết hợp giữa **Hệ thống Kiểm soát Quy tắc Văn hóa Xác định (Deterministic Cultural Rule Engine)** và **Trí tuệ Nhân tạo Đa phương thức Google Gemini**, tạo nên một cố vấn thời trang chuẩn mực, minh bạch nguồn gốc và phản hồi tức thì.

---

### 2. Các Trụ cột Kiến trúc Kỹ thuật (Technical Pillars)

1. **Code-First Cultural Guardrails (Bảo chứng quy tắc bằng Mã nguồn):**
   - Không dựa vào LLM để "phán đoán" đúng/sai về văn hóa. Mọi quy chuẩn trang nghiêm, kiêng kỵ tâm linh hay phối vạt đều do **Rule Engine bằng TypeScript thuần** đánh giá dựa trên dữ liệu điển thư có nguồn gốc (`data/cultural_rules.json`).
2. **Deterministic Color Harmony (Thuật toán Hòa sắc Xác định 0ms):**
   - Điểm số hài hòa màu sắc (0 - 10) được tính toán tức thì theo khoảng cách góc pha tuần hoàn trên không gian màu **HSL/CIELAB**, phân tách màu sắc tố (Chromatic) và màu trung tính (Neutral), kèm điểm thưởng tương hỗ.
3. **Gemini AI Stylist & Diễn giải Ngữ cảnh:**
   - Gemini chỉ đóng vai trò Stylist biên tập: xếp hạng tổ hợp, diễn giải ý nghĩa văn hóa và gợi ý phối cảnh. AI bắt buộc tuân thủ mức cảnh báo do hệ thống đã xác định trước, loại bỏ hoàn toàn hiện tượng ảo giác (hallucination).
4. **Interactive Cultural Rule Feedback (Cơ chế Khoanh vùng & Khắc phục Vi phạm):**
   - Làm sạch toàn bộ mã kỹ thuật (`R_DILE_03`, `A_FORMAL_01`...) khỏi giao diện người dùng.
   - Khi có cảnh báo (VÀNG / ĐỎ), người dùng bấm vào cảnh báo để **khoanh vùng trực tiếp món đồ vi phạm** trên bản phối (hiệu ứng viền hổ phách, nhịp thở `animate-pulse`), đồng thời nhận nút bấm **"Đổi món ↺"** để điều chỉnh tức thì.
5. **Zero-Token Fallback & Presets:**
   - Trường hợp cặp phối chưa đủ tư liệu biên tập: trả về `CHUA_DU_CAN_CU` ngay tại tầng Engine (0 token, 0ms).
   - Tích hợp bộ đệm SHA-256 đối soát `data/fallback_presets.json` sẵn sàng phục vụ khi ngoại tuyến hoặc vượt hạn mức API.

---

## 🏛️ Sơ đồ Luồng Hoạt động Hệ thống (System Architecture)

```
                       [ NGƯỜI DÙNG / TRÌNH DUYỆT ]
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌─────────────────────────────┐             ┌─────────────────────────────┐
│  ƯỚM THỬ TRỰC TIẾP (0ms)    │             │   TRỢ LÝ GIÁM TUYỂN (AI)    │
│  - Thay đổi slot đồ tự do   │             │   - Form 4 bước định hướng  │
│  - Khoanh vùng vi phạm live │             │   - Dịp / Phom dáng / Tone  │
└──────────────┬──────────────┘             └──────────────┬──────────────┘
               │                                           │
               │ (Client Engine 0ms)                       │ (POST /api/recommend)
               ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       RULE & HARMONY ENGINE                             │
│  ├── 1. Check Coverage Matrix (Kiểm tra ma trận độ phủ tư liệu)         │
│  ├── 2. Evaluate Cultural Rules (Đối chiếu luật Type A & Type B)        │
│  ├── 3. Rule Detector & Sanitizer (Lọc mã thô, định vị item vi phạm)    │
│  └── 4. Deterministic HSL Harmony (Tính điểm hòa sắc tuần hoàn)         │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       [ Chưa đủ căn cứ ]               [ Đủ điều kiện phối ]
       Trả về CHUA_DU_CAN_CU                      │
       (0 Token - Tiết kiệm)             ┌────────┴────────┐
                                         ▼                 ▼
                                  [ Fallback Cache ]   [ Gemini 1.0 API ]
                                  (SHA-256 Hit)        (Structured Output)
                                         │                 │
                                         └────────┬────────┘
                                                  ▼
                                       [ Post-Validator ]
                                       - Kiểm tra ID món đồ & Nguồn
                                       - Khóa cứng mức cảnh báo
                                                  │
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │   LOOKBOOK ATELIER CARD       │
                                  │   - Trực quan hóa tỷ lệ 9:16  │
                                  │   - Huy hiệu chuẩn văn hóa    │
                                  │   - Điểm màu & Diễn giải      │
                                  │   - Xuất PNG 1080x1920        │
                                  │   - Lưu bộ sưu tập / Chia sẻ  │
                                  └───────────────────────────────┘
```

---

## 🧩 Danh mục Tính năng Đã Triển khai (Feature Inventory)

### 1. Không gian Giám tuyển Lookbook Đa chế độ (Consolidated Atelier)
- **Ươm Thử Trực Tiếp (Live Fitting Studio):**
  - Tự do kết hợp các món trong tủ đồ (Áo chính, Quần/Váy, Giày guốc, Túi & Phụ kiện).
  - Phản hồi thời gian thực 0ms về độ hài hòa màu sắc và quy tắc ứng xử trang phục.
  - Bộ điều hướng danh mục thông minh: Tự động gắn nhãn `⚠️ Lưu ý` và viền hổ phách tại các nhóm phụ kiện có nguy cơ xung đột văn hóa.
- **Trợ Lý Giám Tuyển AI (Stylist Wizard):**
  - Trải nghiệm từng bước: *Dịp mặc (Đi lễ, Tết, Kỷ yếu, Dạo phố, Biểu diễn)* $\rightarrow$ *Nhóm cổ phục (Ngũ thân, Áo tấc, Áo tứ thân...)* $\rightarrow$ *Mức độ cách tân* $\rightarrow$ *Bảng sắc độ*.
  - Tự động sinh trọn bộ outfit kèm lời bình giám tuyển phong nhã, chuẩn mực.

### 2. Hệ thống Khoanh vùng Cảnh báo Văn hóa (Interactive Rule Warning UX)
- **Phát hiện đa điểm vi phạm (`detectOffendingItems`):** Phân tích danh sách đồ và thẻ tags (ví dụ: phụ kiện hiện đại đi lễ, hở hang nơi tôn nghiêm, lạc điệu phom dáng).
- **Trực quan hóa tương tác:**
  - Nhấp vào hộp lưu ý văn hóa để mở rộng danh sách chi tiết các món đồ cần điều chỉnh.
  - Món đồ vi phạm trên bục phối đồ được viền phát sáng hổ phách và kích hoạt hiệu ứng nhịp thở.
  - Modal chi tiết từng món hiển thị thẻ cảnh báo riêng biệt kèm gợi ý khắc phục.

### 3. Tra cứu Điển thư Di sản (Heritage Codex Modal)
- Nút bấm truy cập nhanh **"Tra Cứu Điển Thư"** ngay tại trung tâm làm việc.
- Minh bạch 100% nguồn tham khảo: sách khảo cứu lịch sử, tài liệu bảo tàng, quy chế phẩm phục triều đại, thông lệ làng nghề dân gian.

### 4. Quản lý Bộ sưu tập & Chia sẻ (Saved Looks & Social Export)
- **Bộ Sưu Tập Đã Lưu:** Lưu trữ cục bộ (LocalStorage), xem lại các bản phối tâm đắc, hỗ trợ quản lý và tải lại.
- **Xuất ảnh Lookbook 9:16 (High-Res Export):**
  - Tối ưu hóa đa trình duyệt (đặc biệt là Safari iOS) bằng kỹ thuật **Dual-Pass Rendering** thông qua `html-to-image`.
  - Xuất ảnh độ phân giải chuẩn mạng xã hội (1080x1920 @3x DPI) sắc nét, sẵn sàng chia sẻ Story/Instagram/TikTok.
- **Trang Chia sẻ Công khai (`/share/[slug]`):** Hỗ trợ tạo liên kết chia sẻ trực tuyến qua Supabase.

### 5. Xưởng Nhập liệu & Quản trị Di sản (Admin Ingest Studio)
- Đường dẫn quản trị: `/admin/ingest`.
- Hỗ trợ biên tập món đồ mới, tự động phân tích tag văn hóa, tải ảnh lên Cloudflare R2 / AWS S3 và công cụ cắt ảnh thông minh (Smart Image Cropper).

---

## 📊 Bảng Quy tắc & Nguồn Dữ liệu Văn hóa (Data Matrix)

| Tệp Dữ liệu | Quy mô / Cấu trúc | Vai trò Kỹ thuật |
| :--- | :--- | :--- |
| `data/cultural_rules.json` | 300+ dòng quy tắc, ma trận độ phủ, phân loại Type A (cấu trúc) & Type B (văn hóa) | Bộ quy chuẩn cốt lõi dùng để tiền kiểm duyệt |
| `data/items.json` | Danh mục món đồ chi tiết: phân loại slot, hệ màu Hex, độ trang trọng (1-5), tag văn hóa | Kho trang phục cho Fitting Studio & Combo Builder |
| `data/sources.json` | Danh bạ nguồn trích dẫn lịch sử, tài liệu khảo cứu, bảo tàng | Căn cứ minh bạch cho từng quy tắc và lời bình AI |
| `data/knowledge_base.json` | Các thẻ tri thức văn hóa tóm lược ngữ cảnh từng dòng trang phục | Cung cấp tri thức cho LLM (Context Injection) |
| `data/fallback_presets.json` | Các bộ phối mẫu biên tập sẵn kèm hash SHA-256 | Đảm bảo tính khả dụng cao khi mất mạng hoặc cạn quota AI |

---

## 🧪 Đảm bảo Chất lượng & Kiểm thử (QA & Test Coverage)

Toàn bộ logic cốt lõi được bảo vệ bởi bộ kiểm thử tự động Vitest (**15/15 unit tests passed**):

- **Coverage Matrix Tests:** Kiểm tra trạng thái phủ dữ liệu (hỗ trợ, từ chối, cảnh báo thiếu tư liệu).
- **HSL Harmony Tests:** Kiểm tra tính chính xác của các dải góc pha màu (Tương đồng, Bổ túc, Tam giác, Thưởng trung tính).
- **Rule Evaluator Tests:** Kiểm tra kích hoạt chính xác các mức cảnh báo XANH (chuẩn), VÀNG (lưu ý), ĐỎ (loại trừ).
- **Rule Detector & Sanitizer Tests:** Kiểm tra loại bỏ mã kỹ thuật thô và phát hiện chính xác món đồ gây xung đột.
- **Slice Verification Tests:** Kiểm tra tính toàn vẹn của kịch bản ứng dụng mẫu.

```bash
# Kết quả kiểm thử thực tế
✓ src/lib/engine/slice-verification.test.ts (3 tests)
✓ src/lib/engine/engine.test.ts (12 tests)
Test Files  2 passed (2)
     Tests  15 passed (15)
```

---

## 🛠️ Hướng dẫn Cài đặt & Khởi chạy (Getting Started)

### Yêu cầu môi trường
- Node.js >= 18.18.0 (khuyên dùng Node 20+)
- npm / yarn / pnpm

### Cài đặt
```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Thiết lập biến môi trường (.env.local)
# GEMINI_API_KEY=your_gemini_api_key
# GEMINI_MODEL=gemini-2.5-flash (hoặc gemini-1.5-flash)

# 3. Kiểm tra kết nối mô hình Gemini
npm run check-model

# 4. Kiểm tra tính toàn vẹn của dữ liệu di sản
npm run validate-data

# 5. Chạy bộ kiểm thử tự động
npm run test

# 6. Khởi động môi trường phát triển
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`.

---

## 🗺️ Lộ trình Phát triển Tiếp theo (Roadmap)
- [ ] Mở rộng dữ liệu trang phục: Áo Nhật bình triều Nguyễn, Áo Giao lĩnh thời Lê, Áo Viên lĩnh.
- [ ] Nâng cấp thuật toán phối đa phụ kiện: Nón quai thao, Guốc mộc ngũ đinh, Trâm cài tóc.
- [ ] Tích hợp tính năng Thử đồ Ảo (Virtual Try-on preview) bằng công nghệ sinh ảnh AI có kiểm soát phom dáng.
- [ ] Kết nối mạng lưới các nhà may, thương hiệu phục dựng cổ phục uy tín tại Việt Nam.

---

## 👥 Đội ngũ Phát triển
- **Đội thi:** Nếp Việt Team
- **Cuộc thi:** AI Arena Vietnam 2026
