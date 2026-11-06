import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ঈদ মোবারক কার্ড জেনারেটর | Eid Card Generator",
  description: "আপনার ছবি ও পছন্দের ফ্রেম দিয়ে তৈরি করুন আকর্ষণীয় ঈদ কার্ড এবং ডাউনলোড করুন সহজে।",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="scroll-smooth">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
