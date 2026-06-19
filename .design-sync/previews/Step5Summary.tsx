import { Step5Summary } from "@figma/my-make-file";

const noop = () => {};

// State fiel a WizardState (Hotel Diplomatic). Step5 lee selectedTemplate,
// identity.logoState, info.hotelName y rooms.count para el bloque de resumen,
// y summary.npsRating para las estrellas.
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

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 600, background: "#fff", padding: 4 }}>{children}</div>
);

// Resumen del onboarding: trial día 4/14, filas de configuración, share, NPS y
// entrada al Wizard 2. NPS sin calificar (estado inicial).
export const Resumen = () =>
  wrap(<Step5Summary state={state} update={noop} onGoToWizard2={noop} trialDay={4} trialTotalDays={14} />);

// Variante con NPS calificado (5 estrellas) → "¡Muy fácil!".
export const ConValoracion = () =>
  wrap(
    <Step5Summary
      state={{ ...state, summary: { npsRating: 5, shared: true } }}
      update={noop}
      onGoToWizard2={noop}
      trialDay={9}
      trialTotalDays={14}
    />,
  );
