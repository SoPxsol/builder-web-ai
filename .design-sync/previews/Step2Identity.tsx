import { Step2Identity } from "@figma/my-make-file";

const noop = () => {};

// State fiel a WizardState (Hotel Diplomatic). Step2Identity lee `identity`:
// logoState/photoState mueven las UploadZones y el banner de micro-logro; los
// colores alimentan los ColorPickers.
const base = {
  currentStep: 2 as const,
  selectedTemplate: "boutique" as const,
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

// Logo y foto cargados: aparece el banner "¡Tu hotel tiene cara propia!" y los
// colores de marca detectados del logo (cálidos, paleta boutique).
export const ConLogo = () =>
  wrap(
    <Step2Identity
      state={{
        ...base,
        identity: {
          logoState: "loaded",
          photoState: "loaded",
          colorPrimary: "#c4923a",
          colorSecondary: "#2a1f1a",
        },
      }}
      update={noop}
    />,
  );

// Estado inicial vacío: zonas de subida sin logo/foto, botón "Detectar colores"
// deshabilitado.
export const Vacio = () =>
  wrap(
    <Step2Identity
      state={{
        ...base,
        identity: {
          logoState: "empty",
          photoState: "placeholder",
          colorPrimary: "#c4923a",
          colorSecondary: "#2a1f1a",
        },
      }}
      update={noop}
    />,
  );
