import { S7Policies } from "@figma/my-make-file";

const noop = () => {};

// Slice `policies` de W2State: cancelación flexible (72hs / 1 noche) con texto IA,
// y 3 medios de pago activos. La sección lee state.policies; el acordeón de
// "Política de cancelación" abre por defecto (estado interno de S7).
const state = {
  currentSection: "policies",
  completedSections: new Set<string>(["profile", "social", "location", "seo", "languages", "pages"]),
  profile: {
    hotelName: "Hotel Diplomatic",
    category: "boutique",
    email: "reservas@hoteldiplomatic.com",
    shortDescription: "",
    longDescription: "",
    phone: "+54 261 555 0100",
    font: "Playfair Display",
  },
  languages: { active: ["es", "en"], currency: "ARS" },
  social: { instagram: "@hoteldiplomatic", facebook: "", whatsapp: "", linkedin: "", tripadvisor: "" },
  location: { address: "Av. San Martín 1234, Mendoza, Argentina", pois: [] },
  seo: {
    pages: {
      inicio: { title: "", description: "" },
      habitaciones: { title: "", description: "" },
      contacto: { title: "", description: "" },
    },
    schemaOrgEnabled: true,
    geoEnabled: false,
  },
  additionalPages: { experiencias: true, blog: false, promociones: true, spa: false, eventos: false },
  policies: {
    cancellation: {
      type: "flexible",
      hoursInAdvance: "72",
      penalty: "1 noche",
      text: "Cancelación gratuita hasta 72 horas antes del check-in. En caso de no-show se aplica una penalidad de 1 noche de estadía.",
    },
    payments: { transferencia: true, efectivo: true, mercadopago: true, payway: false },
  },
  launch: {
    previewChecked: false,
    mobileChecked: false,
    seoChecked: false,
    testReservation: false,
    meetingScheduled: false,
  },
};

// Políticas y medios de pago: cancelación flexible con texto cargado (acordeón abierto).
export const ConPoliticas = () => (
  <div style={{ width: 560, background: "#fff" }}>
    <S7Policies state={state as any} update={noop} />
  </div>
);
