import { CreatePopupWizard } from "@figma/my-make-file";

const noop = () => {};

// Preset realista de un hotel boutique LATAM. CreatePopupWizard mergea
// `initialState` sobre INITIAL_POPUP_STATE al abrir, así que con esto el wizard
// arranca pre-cargado: nombre, copy, CTA, imagen y `currentStep` para ver la
// StepBar mid-flow + el panel de preview del popup poblado a la derecha.
// El shell se monta como overlay full-screen (createPortal a body) con isOpen:true.
const preset = {
  currentStep: 2 as const,
  variant: "popup" as const,
  internalName: "Popup oferta invierno 2026",
  title: "15% off por reserva directa",
  description: "Reservá sin intermediarios y obtené el mejor precio garantizado, desayuno incluido.",
  imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=70&w=600",
  ctaText: "Reservar ahora",
  ctaUrl: "https://hoteldiplomatic.com/reservas?promo=directa15",
  openIn: "new-tab" as const,
  position: "center" as const,
  pages: ["inicio", "habitaciones"],
};

// Wizard de creación de popup abierto en el paso 2 (Configuración), con el popup
// ya diseñado renderizándose en el panel de preview de la derecha.
export const Wizard = () => (
  <CreatePopupWizard
    isOpen={true}
    contextLabel="hoteldiplomatic.com"
    initialState={preset}
    onClose={noop}
    onPublish={noop}
  />
);
