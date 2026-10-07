import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nếp Việt – Nếp Việt, nét riêng.",
  description: "Trợ lý AI phối Việt phục cho thế hệ trẻ – Tôn vinh bản sắc, chuẩn mực văn hóa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-nep-paper text-nep-ink font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
