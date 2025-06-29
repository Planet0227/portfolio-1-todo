import localFont from "next/font/local";
import "./globals.css";
import { ReactNode } from "react";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "List-Board",
  description: "Todoリストを視覚的に管理できるボードアプリ",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }:{ children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex">
          <div className="flex-grow">{children}</div>
        </div>
      </body>
    </html>
  );
}
