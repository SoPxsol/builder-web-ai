import { PopupPreview } from "@figma/my-make-file";

// PopupPreview solo lee del state: `position` (ubica la tarjeta en el mock del
// sitio), `imageUrl`, `title`, `description` y `ctaText`. Es el panel derecho del
// wizard de creación de popup. No tiene handlers (es read-only).
const state = {
  currentStep: 1 as const,
  variant: "popup" as const,
  internalName: "Popup oferta invierno 2026",
  title: "15% off por reserva directa",
  description: "Reservá sin intermediarios y obtené el mejor precio garantizado, desayuno incluido.",
  imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=70&w=600",
  ctaText: "Reservar ahora",
  ctaUrl: "https://hoteldiplomatic.com/reservas",
  openIn: "new-tab" as const,
  position: "center" as const,
  pages: ["inicio"],
  triggers: { delay: true },
  delaySeconds: 5,
  scrollPercent: 50,
  inactivitySeconds: 30,
  devices: { desktop: true, mobile: true },
  frequency: "once-per-session" as const,
};

// Preview del popup centrado sobre el sitio, con imagen, título, texto y CTA.
export const Centrado = () => <PopupPreview state={state} />;

// Variante: popup abajo-derecha, sin imagen (placeholder gris) y texto distinto.
export const AbajoDerechaSinImagen = () => (
  <PopupPreview
    state={{
      ...state,
      position: "bottom-right",
      imageUrl: "",
      title: "Última habitación disponible",
      description: "Quedan pocas para tus fechas. Asegurá tu estadía hoy.",
      ctaText: "Ver disponibilidad",
    }}
  />
);
