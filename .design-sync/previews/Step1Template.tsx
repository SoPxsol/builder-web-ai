import { Step1Template } from "@figma/my-make-file";

const noop = () => {};

// State fiel a WizardState con datos de Hotel Diplomatic (LATAM).
// Step1Template solo lee `selectedTemplate` para marcar la tarjeta activa.
const state = {
  currentStep: 1 as const,
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

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 600, background: "#fff" }}>{children}</div>
);

// Selección de plantilla: la tarjeta "Boutique" queda activa (borde azul).
export const Boutique = () => wrap(<Step1Template state={state} update={noop} />);

// Variante con "Resort" seleccionado, para ver el otro estado activo.
export const Resort = () =>
  wrap(<Step1Template state={{ ...state, selectedTemplate: "resort" }} update={noop} />);
