import { WHATSAPP_LINK } from "@/lib/contact";

export function WhatsAppFloat({ message }: { message?: string }) {
  return (
    <a
      href={WHATSAPP_LINK(message ?? "مرحباً ظاهرلي، أرغب في معرفة المزيد")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="no-print fixed bottom-5 left-5 z-[60] flex items-center gap-2 rounded-full bg-[#25D366] text-white px-4 py-3 shadow-lg hover:scale-105 active:scale-95 transition-transform"
    >
      <svg viewBox="0 0 32 32" className="size-6" fill="currentColor" aria-hidden="true">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.385.703 4.6 1.91 6.46L4 29l7.74-1.86A11.93 11.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.628 3 16.001 3zm0 21.6c-1.83 0-3.55-.5-5.03-1.37l-.36-.21-4.59 1.1 1.13-4.46-.24-.37A9.55 9.55 0 0 1 6.4 15c0-5.3 4.3-9.6 9.6-9.6S25.6 9.7 25.6 15s-4.3 9.6-9.6 9.6zm5.45-7.18c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.47-2.4-1.49-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.23-.24-.58-.48-.5-.68-.51l-.58-.01a1.1 1.1 0 0 0-.8.38c-.28.3-1.06 1.03-1.06 2.52 0 1.49 1.08 2.93 1.23 3.13.15.2 2.14 3.27 5.2 4.59.73.31 1.3.5 1.74.64.73.23 1.4.2 1.93.12.59-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.07-.13-.27-.2-.57-.35z"/>
      </svg>
      <span className="font-bold text-sm">واتساب</span>
    </a>
  );
}
