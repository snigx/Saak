// Single source of truth for Saak's customer contact details
export const SAAK_WHATSAPP_NUMBER = '916267664409';
export const SAAK_EMAIL = 'Saakbyaprajita@gmail.com';

export function getWhatsAppLink(message = '') {
  const base = `https://wa.me/${SAAK_WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
