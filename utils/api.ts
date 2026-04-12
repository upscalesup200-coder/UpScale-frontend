// utils/api.ts
export const fetchAuth = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include', // 👈 السر صار مخزن هون مرة واحدة وللأبد
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};