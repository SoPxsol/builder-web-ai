import { Step3InfoContact } from "@figma/my-make-file";

const noop = () => {};

// State fiel a WizardState (Hotel Diplomatic). Step3 lee `info` y recibe
// `attemptedNext` (contador que dispara la validación del nombre al avanzar).
const base = {
  currentStep: 3 as const,
  selectedTemplate: "boutique" as const,
  identity: {
    logoState: "loaded" as const,
    photoState: "loaded" as const,
    colorPrimary: "#c4923a",
    colorSecondary: "#2a1f1a",
  },
  rooms: { count: 3, names: ["Suite Diplomática", "Habitación Superior", "Habitación Estándar"] },
  summary: { npsRating: 0 as const, shared: false },
};

const infoCompleta = {
  hotelName: "Hotel Diplomatic",
  domain: "hoteldiplomatic.com",
  phone: "+54 261 555 0100",
  email: "reservas@hoteldiplomatic.com",
  instagram: "@hoteldiplomatic",
  facebook: "facebook.com/hoteldiplomatic",
  whatsapp: "+54 9 261 555 0100",
  importedFromOTA: false,
};

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 600, background: "#fff" }}>{children}</div>
);

// Formulario completo (datos cargados), bloque de importación OTA en estado idle.
export const Completo = () =>
  wrap(<Step3InfoContact state={{ ...base, info: infoCompleta }} update={noop} attemptedNext={0} />);

// Validación: intentó avanzar sin nombre → input en error + mensaje.
export const ErrorNombre = () =>
  wrap(
    <Step3InfoContact
      state={{ ...base, info: { ...infoCompleta, hotelName: "" } }}
      update={noop}
      attemptedNext={1}
    />,
  );
