import { API_BASE_URL } from "@/config/api";

export type PlaceholderType = 'avatar' | 'course' | 'workshop' | 'bootcamp' | 'news' | 'general' | 'settings';

export const getImageUrl = (
  path: string | null | undefined, 
  type: PlaceholderType = 'general',
  width?: number // 👈 التعديل الأول: إضافة متغير العرض لـ Bunny Optimizer
): string | null => { 
  
  if (!path || path.trim() === "") {
    if (type === 'avatar') {
      return null; 
    }

    const placeholders: Partial<Record<PlaceholderType, string>> = {
      course: '/images/course-placeholder.png',
      workshop: '/images/workshop-placeholder.png',
      bootcamp: '/images/bootcamp-placeholder.png',
      news: '/images/news-placeholder.png',
      general: '/images/placeholder.png',
      settings: '/images/settings-placeholder.png'
    };
    
    return placeholders[type] || placeholders.general || '/images/placeholder.png';
  }

  let finalUrl = path;

  // التحقق مما إذا كان الرابط لا يحتوي على http
  if (!path.startsWith('http://') && !path.startsWith('https://')) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    finalUrl = `${API_BASE_URL}${cleanPath}`;
  }

  // 🪄 التعديل الثاني: السحر الخاص بـ Bunny Optimizer
  // إذا طلبنا عرضاً معيناً، نضيفه إلى الرابط لكي يصغره Bunny على الطاير
  if (width) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}width=${width}`;
  }

  return finalUrl;
};