import { HeaderConfigPanel } from "@figma/my-make-file";

const noop = () => {};

// Configuración de nav por defecto del builder (wireframe Diplomatic "Ambas").
const NAV = {
  logo: { type: "image", imageAlt: "Logo del hotel", textFallback: "Diplomatic" },
  hotelTagline: undefined,
  mobileLayout: "both",
  desktopLayout: "two-rows",
  utilityBar: {
    visible: true,
    leftSlot: { id: "utility-checkin", label: "Check-in", icon: "key-round", actionType: "booking-engine" },
    rightSlot: { id: "utility-login", label: "Inicio de sesión", icon: "user", actionType: "link" },
  },
  mainBar: { sticky: true, showBookingButton: true, bookingButtonLabel: "Reservar" },
  bottomBar: {
    visible: true,
    backdropBlur: true,
    slots: [
      { id: "bottom-reservar", action: { id: "action-reservar", label: "Reservar", icon: "calendar-check", actionType: "booking-engine" }, order: 0 },
      { id: "bottom-whatsapp", action: { id: "action-whatsapp", label: "WhatsApp", icon: "message-circle", actionType: "whatsapp" }, order: 1 },
      { id: "bottom-ai", action: { id: "action-ai", label: "Asistente AI", icon: "sparkles", actionType: "ai-chat" }, order: 2 },
    ],
  },
  drawerSections: [
    { id: "nav-habitaciones", label: "Habitaciones", href: "#habitaciones", visible: true, order: 0 },
    { id: "nav-eventos", label: "Eventos", href: "#eventos", visible: true, order: 1 },
    { id: "nav-gastronomia", label: "Gastronomía", href: "#gastronomia", visible: true, order: 2 },
    { id: "nav-experiencia", label: "Experiencia", href: "#experiencia", visible: true, order: 3 },
    { id: "nav-promociones", label: "Promociones", href: "#promociones", visible: true, order: 4 },
    { id: "nav-contacto", label: "Contacto", href: "#contacto", visible: true, order: 5 },
  ],
  drawerUtility: [
    { id: "drawer-checkin", label: "Check-in", icon: "key-round", actionType: "booking-engine" },
    { id: "drawer-login", label: "Inicio de sesión", icon: "user", actionType: "link" },
    { id: "drawer-ai", label: "Asistente AI", icon: "sparkles", actionType: "ai-chat" },
    { id: "drawer-wp", label: "WhatsApp", icon: "message-circle", actionType: "whatsapp" },
  ],
  languages: [
    { code: "es", label: "Español", enabled: true },
    { code: "en", label: "English", enabled: false },
    { code: "pt", label: "Português", enabled: false },
  ],
  currencies: [
    { code: "ARS", symbol: "$", enabled: true },
    { code: "USD", symbol: "U$S", enabled: false },
  ],
};

// Configurador del header: logo, disposición, utility/main/bottom bar,
// secciones del drawer, idiomas y monedas.
export const Configurador = () => (
  <HeaderConfigPanel navConfig={NAV} onChange={noop} />
);
