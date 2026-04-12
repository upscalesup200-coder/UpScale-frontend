import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // ✅ ضروري جداً للسماح بملفات SVG (مثل ui-avatars و placehold.co)
    dangerouslyAllowSVG: true,
    // ✅ يفضل تفعيلها لضمان عدم حدوث مشاكل أمنية مع الـ SVG
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    remotePatterns: [
      // 🏠 [إعدادات البيئة المحلية]
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      // 💡 إضافة 127.0.0.1 تحل مشكلة "resolved to private ip" في بعض المتصفحات
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '/uploads/**',
      },

      // 🌍 [إعدادات السيرفر النظامي - Production]
      {
        protocol: 'https',
        hostname: 'api.learnupscale.com',
        port: '',
        pathname: '/**',
      },

      // 🚀 [إعدادات Bunny.net CDN]
      {
        protocol: 'https',
        hostname: 'UpscaleFile.b-cdn.net',
        port: '',
        pathname: '/**',
      },

      // 🖼️ [الصور الوهمية]
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },

      // 👤 [صور المدربين والطلاب الافتراضية]
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // يمكنك إضافة أي إعدادات أخرى هنا (مثل output: 'standalone' إذا كنت ترفع على VPS)
};

export default nextConfig;