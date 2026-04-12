import axios from 'axios';
import { API_BASE_URL } from '../config/api'; 
// لم تعد بحاجة لمكتبة js-cookie هنا إذا كنت تستخدم HttpOnly cookies من الباك إند
// import Cookies from 'js-cookie'; 

export const securityService = {
  getAlerts: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/security/alerts`, {
      withCredentials: true // ✅ إضافة الكوكيز
    });
    return response.data;
  },

  // ✅ الدالة الجديدة لمسح السجلات من الفرونت إند
  clearAllAlerts: async () => {
    const response = await axios.delete(`${API_BASE_URL}/api/security/alerts/clear`, {
      withCredentials: true // ✅ إضافة الكوكيز
    });
    return response.data;
  },

  getBlockedIps: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/security/blocked`, {
      withCredentials: true // ✅ إضافة الكوكيز
    });
    return response.data;
  },

  blockIp: async (ip: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/security/block`, { ip }, {
      withCredentials: true // ✅ إضافة الكوكيز
    });
    return response.data;
  },

  unblockIp: async (ip: string) => {
    const encodedIp = encodeURIComponent(ip);
    const response = await axios.delete(`${API_BASE_URL}/api/security/block/${encodedIp}`, {
      withCredentials: true // ✅ إضافة الكوكيز
    });
    return response.data;
  }
};