// utils/imageCompression.ts
import imageCompression from 'browser-image-compression';

export const compressImage = async (imageFile: File, isAvatar: boolean = false): Promise<File> => {
  // إعدادات الضغط (نصغر الحجم والأبعاد بطريقة ذكية)
  const options = {
    maxSizeMB: isAvatar ? 0.2 : 0.8, // 200 كيلوبايت للصور الشخصية، 800 كيلوبايت للغلاف والحوالات
    maxWidthOrHeight: isAvatar ? 500 : 1280, // تصغير أبعاد الصورة بشكل متناسق
    useWebWorker: true, // استخدام المعالج الخلفي للمتصفح حتى لا تتجمد الشاشة
    initialQuality: 0.8 // الحفاظ على 80% من الجودة الأصلية
  };

  try {
    console.log(`حجم الصورة الأصلي: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    // 🪄 هنا يحدث السحر ويتم الضغط
    const compressedFile = await imageCompression(imageFile, options);
    
    console.log(`حجم الصورة بعد الضغط: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    return compressedFile;
  } catch (error) {
    console.error('فشل ضغط الصورة:', error);
    return imageFile; // إذا فشل الضغط لسبب ما، نرسل الصورة الأصلية لكي لا تتعطل العملية
  }
};