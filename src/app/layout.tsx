import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Nếp Việt – Nếp Việt, nét riêng.",
  description: "Trợ lý AI phối Việt phục cho thế hệ trẻ – Tôn vinh bản sắc, chuẩn mực văn hóa.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Nếp Việt – Nếp Việt, nét riêng.",
    description: "Trợ lý AI phối Việt phục cho thế hệ trẻ – Tôn vinh bản sắc, chuẩn mực văn hóa.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Nếp Việt – Heritage Styling Studio",
      },
    ],
  },
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
