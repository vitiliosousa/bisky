import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";


const body = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Bisky — ERP da confeitaria",
  description: "Gestão de pedidos, receitas, estoque e finanças para confeiteiras",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${body.variable} h-full antialiased`} suppressHydrationWarning
    >
      <body className="min-h-full font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
