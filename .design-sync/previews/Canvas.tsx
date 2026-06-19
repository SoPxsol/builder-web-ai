import { Canvas } from "@figma/my-make-file";

const noop = () => {};

// Secciones de la página "Inicio" (réplica del árbol inicial del builder).
const modulos = [
  { id: "hero", name: "HeroSection", alias: "Portada", typeLabel: "Hero", origin: "manual", icon: "layout", expanded: false, properties: [
    { name: "kicker", type: "STRING" }, { name: "headline", type: "STRING" }, { name: "subtitle", type: "STRING" }, { name: "ctaText", type: "STRING" }, { name: "backgroundImage", type: "OBJECT" },
  ] },
  { id: "rooms", name: "RoomsGrid", alias: "Habitaciones", typeLabel: "Habitaciones", origin: "manual", icon: "layout-grid", expanded: false, properties: [
    { name: "titulo", type: "STRING" }, { name: "rooms", type: "ARRAY" }, { name: "showPrices", type: "BOOLEAN" },
  ] },
  { id: "about", name: "TextImage", alias: "Sobre nosotros", typeLabel: "Texto e imagen", origin: "manual", icon: "columns", expanded: false, properties: [
    { name: "titulo", type: "STRING" }, { name: "texto", type: "OBJECT" }, { name: "imagen", type: "OBJECT" }, { name: "imagenAlt", type: "STRING" },
  ] },
  { id: "gallery", name: "Gallery", alias: "Galería", typeLabel: "Galería", origin: "manual", icon: "images", expanded: false, properties: [
    { name: "images", type: "ARRAY" }, { name: "columns", type: "NUMBER" },
  ] },
];

const valores = {
  "hero::kicker": "Hotel Diplomatic",
  "hero::headline": "Una casa frente al río",
  "hero::subtitle": "Boutique en el casco histórico, a pasos de la costanera.",
  "hero::ctaText": "Reservar ahora",
  "rooms::titulo": "Nuestras habitaciones",
  "about::titulo": "Sobre nosotros",
};

// Config de header por defecto (para el tab "header").
const NAV = {
  logo: { type: "image", imageAlt: "Logo del hotel", textFallback: "Diplomatic" },
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
    { id: "nav-gastronomia", label: "Gastronomía", href: "#gastronomia", visible: true, order: 1 },
    { id: "nav-contacto", label: "Contacto", href: "#contacto", visible: true, order: 2 },
  ],
  drawerUtility: [
    { id: "drawer-login", label: "Inicio de sesión", icon: "user", actionType: "link" },
  ],
  languages: [
    { code: "es", label: "Español", enabled: true },
    { code: "en", label: "English", enabled: false },
  ],
  currencies: [{ code: "ARS", symbol: "$", enabled: true }],
};

const handlers = {
  onSelectModule: noop,
  onReorderModule: noop,
  onAddFromPalette: noop,
  onEditModule: noop,
  onDuplicateModule: noop,
  onRequestDeleteModule: noop,
};

// Tab "página": render del lienzo con las secciones de la página de inicio.
export const Pagina = () => (
  <Canvas
    canvasWidth={1268}
    viewport="desktop"
    activeTab="page"
    pageName="Inicio"
    modules={modulos}
    propertyValues={valores}
    selectedId="hero"
    {...handlers}
  />
);

// Tab "header": preview del header navegable (dos filas en desktop) según navConfig.
export const Header = () => (
  <Canvas
    canvasWidth={1268}
    viewport="desktop"
    activeTab="header"
    pageName="Global header"
    modules={[]}
    propertyValues={{}}
    selectedId={null}
    navConfig={NAV}
    {...handlers}
  />
);

// Viewport mobile: header con disposición "Ambas" (top + bottom bar).
export const HeaderMobile = () => (
  <Canvas
    canvasWidth={390}
    viewport="mobile"
    activeTab="header"
    pageName="Global header"
    modules={[]}
    propertyValues={{}}
    selectedId={null}
    navConfig={NAV}
    {...handlers}
  />
);
