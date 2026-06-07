// Swift Mind contact details — update phone number here to change site-wide.
export const WHATSAPP_NUMBER = "201000000000"; // بصيغة دولية بدون +
export const WHATSAPP_LINK = (msg?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;

export const PRICING = {
  plan30: { days: 30, price: 7000, currency: "ج.م" },
  plan60: { days: 60, price: 10000, currency: "ج.م" },
};
