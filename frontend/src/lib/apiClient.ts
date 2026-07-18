import { supabase } from './supabase';

/**
 * Otomatik yetkilendirme (Token) ekleyen fetch yardımcısı.
 * Backend'e istek atarken `EXPO_PUBLIC_API_URL` ve `Authorization` ekleme işini kendi halleder.
 */
export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Oturum varsa token'ı ekle
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  // URL'i oluştur (Örn: endpoint '/vehicles' ise tam adresi birleştirir)
  const url = `${process.env.EXPO_PUBLIC_API_URL}${endpoint}`;

  return fetch(url, {
    ...options,
    headers,
  });
};
