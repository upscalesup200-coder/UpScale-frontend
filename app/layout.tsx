import type { Metadata } from "next"; 
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from 'react-hot-toast'; 
import GlobalHistoryFix from "@/components/GlobalHistoryFix"; 
import ScrollToTop from "@/components/ScrollToTop";
import ImageProtection from "@/components/ImageProtection"; 

// 👈 استيراد الغلاف الجديد الذي صنعناه
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'UpScale | معسكرات برمجية وورشات عمل تفاعلية',
  description: 'منصة UpScale التعليمية: وجهتك لاحتراف البرمجة من خلال معسكرات تدريبية مكثفة، ورشات عمل تطبيقية، ودروس تفاعلية تغطي كافة الشؤون البرمجية والتقنية لسد الفجوة بين العلم والعمل.',
  metadataBase: new URL('https://learnupscale.com'),
  icons: {
    icon: '/favicon.ico?v=4', 
    apple: '/apple-touch-icon.png', 
  },
  openGraph: {
    title: 'UpScale | ابدأ رحلتك في عالم البرمجة مع أقوى المعسكرات',
    description: 'انضم إلينا في UpScale واستمتع بتجربة تعلم تفاعلية تشمل ورشات عمل ومعسكرات برمجية تركز على التطبيق العملي وبناء الخبرة الحقيقية.',
    url: 'https://learnupscale.com',
    siteName: 'UpScale Learning Platform',
    locale: 'ar_SA',
    type: 'website',
    images: [
      {
        url: '/upscale-banner.webp',
        width: 1200,
        height: 630,
        alt: 'UpScale Interactive Programming Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UpScale | معسكرات وورشات برمجية تفاعلية',
    description: 'ارتقِ بمهاراتك البرمجية مع UpScale. دروس تفاعلية وورشات عمل تطبيقية تضعك على طريق الاحتراف.',
    images: ['/upscale-banner.webp'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body className={inter.className}>
        
        <GlobalHistoryFix /> 
        <ScrollToTop />
        <ImageProtection /> 
        
        <AuthProvider>
          <Toaster position="top-center" reverseOrder={false} />

          {/* 👈 استخدام الغلاف ليقوم بالتحكم بإظهار/إخفاء النافبار والفوتر حسب الرابط */}
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>

        </AuthProvider>

      </body>
    </html>
  );
}