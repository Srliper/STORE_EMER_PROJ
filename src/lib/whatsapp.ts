// Replace with Emerson's real number (DDI + DDD + numero, only digits)
export const WHATSAPP_NUMBER = "5515981183740";

export function openWhatsApp(message: string) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
