import { Step4Rooms } from "@figma/my-make-file";

const noop = () => {};

// State fiel a WizardState (Hotel Diplomatic). Step4Rooms lee `rooms`
// (count + names): el stepper y los inputs por habitación.
const base = {
  currentStep: 4 as const,
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
  summary: { npsRating: 0 as const, shared: false },
};

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 600, background: "#fff" }}>{children}</div>
);

// Tres tipos de habitación cargados, con nombres realistas.
export const TresTipos = () =>
  wrap(
    <Step4Rooms
      state={{
        ...base,
        rooms: { count: 3, names: ["Suite Diplomática", "Habitación Superior", "Habitación Estándar"] },
      }}
      update={noop}
    />,
  );

// Estado inicial: un solo tipo vacío (botón restar deshabilitado en el mínimo).
export const UnTipo = () =>
  wrap(<Step4Rooms state={{ ...base, rooms: { count: 1, names: [""] } }} update={noop} />);
