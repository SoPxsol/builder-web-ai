import { SitePreview } from "@figma/my-make-file";

// SitePreview toma { state, breakpoint } con la misma forma WizardState del wizard 1.
// Lee identity (colores + photoState), info (nombre/contacto) y rooms.names para
// armar el mock del sitio del hotelero (Hotel Diplomatic).
const state = {
  currentStep: 5 as const,
  selectedTemplate: "boutique" as const,
  identity: {
    logoState: "loaded" as const,
    photoState: "loaded" as const,
    colorPrimary: "#c4923a",
    colorSecondary: "#2a1f1a",
  },
  info: {
    hotelName: "Hotel Diplomatic",
    domain: "hoteldiplomatic.com",
    phone: "+54 261 555 0100",
    email: "reservas@hoteldiplomatic.com",
    instagram: "@hoteldiplomatic",
    facebook: "facebook.com/hoteldiplomatic",
    whatsapp: "+54 9 261 555 0100",
    importedFromOTA: false,
  },
  rooms: { count: 3, names: ["Suite Diplomática", "Habitación Superior", "Habitación Estándar"] },
  summary: { npsRating: 0 as const, shared: false },
};

const stage = (children: React.ReactNode) => (
  <div style={{ height: 560, background: "var(--surface-page)" }}>{children}</div>
);

// Vista desktop: frame ancho con hero, habitaciones, galería y contacto.
export const Desktop = () => stage(<SitePreview state={state} breakpoint="desktop" />);

// Vista mobile: frame angosto (sin subtítulo del hero ni nav).
export const Mobile = () => stage(<SitePreview state={state} breakpoint="mobile" />);
