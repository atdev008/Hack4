import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, IBM_Plex_Sans } from "next/font/google";
import { I18nProvider } from "@/i18n/context";
import "./globals.css";

const ibmPlexThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const ibmPlex = IBM_Plex_Sans({
  variable: "--font-ibm",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MoodQuest Thailand",
  description: "เที่ยวตาม mood สร้างประสบการณ์ที่เป็นของคุณ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MoodQuest",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${ibmPlexThai.variable} ${ibmPlex.variable} antialiased`}
    >
      <body className="min-h-dvh bg-white">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
