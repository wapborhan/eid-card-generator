import type { Metadata } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-sans-bengali",
  weight: ["400", "500", "600", "700"], // Include all weights you need
});

export const metadata: Metadata = {
  title: "ঈদ কার্ড",
  description: "এখনই ঈদ কার্ড বানিয়ে ফেলুন",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "ঈদ কার্ড",
    description: "এখনই ঈদ কার্ড বানিয়ে ফেলুন",
    url: "https://eidcard.vercel.app",
    siteName: "ঈদ কার্ড",
    images: [
      {
        url: "https://eidcard.vercel.app/og.png",
        width: 1200,
        height: 630,
        alt: "ঈদ কার্ড",
      },
    ],
    locale: "bn-BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ঈদ কার্ড",
    description: "এখনই ঈদ কার্ড বানিয়ে ফেলুন",
    images: ["https://eidcard.vercel.app/og.png"],
    creator: "@sabbirhossain",
    site: "@sabbirhossain",
  },
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ঈদ কার্ড",
    startupImage: [
      "/apple-touch-startup-image-640x1136.png",
      "/apple-touch-startup-image-750x1334.png",
      "/apple-touch-startup-image-1242x2208.png",
      "/apple-touch-startup-image-1125x2436.png",
      "/apple-touch-startup-image-1242x2688.png",
      "/apple-touch-startup-image-1536x2048.png",
      "/apple-touch-startup-image-1668x2388.png",
      "/apple-touch-startup-image-1668x2388.png",
      "/apple-touch-startup-image-2048x2732.png",
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSansBengali.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
