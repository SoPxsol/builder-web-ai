import { OnboardingWizard } from "@figma/my-make-file";

const noop = () => {};

// State inicial fiel a INITIAL_WIZARD_STATE pero con datos de un hotel LATAM
// ("Diplomatic"), pasado como `initialState` para que el wizard arranque poblado.
// El wizard se monta con isOpen:true y se renderiza vía portal sobre document.body,
// por eso el contenedor solo necesita reservar alto para que se vea centrado.
const diplomatic = {
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
  rooms: {
    count: 3,
    names: ["Suite Diplomática", "Habitación Superior", "Habitación Estándar"],
  },
  summary: { npsRating: 0 as const, shared: false },
};

const frame = (children: React.ReactNode) => (
  <div style={{ position: "relative", minHeight: 760, background: "var(--surface-page)" }}>
    {children}
  </div>
);

// Paso 1 (Plantilla): modal completo abierto, columna izquierda con el step + asesor,
// columna derecha con preview en vivo del sitio de Diplomatic.
export const PasoPlantilla = () =>
  frame(
    <OnboardingWizard
      isOpen
      initialStep={1}
      initialState={diplomatic}
      onClose={noop}
      onComplete={noop}
      onGoToWizard2={noop}
    />,
  );

// Paso 5 (Lanzamiento): resumen + share + NPS + entrada al Wizard 2.
export const PasoLanzamiento = () =>
  frame(
    <OnboardingWizard
      isOpen
      initialStep={5}
      initialState={diplomatic}
      onClose={noop}
      onComplete={noop}
      onGoToWizard2={noop}
    />,
  );
