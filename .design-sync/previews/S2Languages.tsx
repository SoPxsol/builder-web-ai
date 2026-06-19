import { S2Languages } from "@figma/my-make-file";

const noop = () => {};

// Slice `languages` de W2State: español (fijo) + inglés + portugués activos,
// cobro en ARS. La sección lee state.languages.
const state = {
  currentSection: "languages",
  completedSections: new Set<string>(["profile", "social", "location", "seo"]),
  profile: {
    hotelName: "Hotel Diplomatic",
    category: "boutique",
    email: "reservas@hoteldiplomatic.com",
    shortDescription: "",
    longDescription: "",
    phone: "+54 261 555 0100",
    font: "Playfair Display",
  },
  languages: { active: ["es", "en", "pt"], currency: "ARS" },
  social: { instagram: "", facebook: "", whatsapp: "", linkedin: "", tripadvisor: "" },
  location: { address: "", pois: [] },
  seo: {
    pages: {
      inicio: { title: "", description: "" },
      habitaciones: { title: "", description: "" },
      contacto: { title: "", description: "" },
    },
    schemaOrgEnabled: false,
    geoEnabled: false,
  },
  additionalPages: { experiencias: false, blog: false, promociones: false, spa: false, eventos: false },
  policies: {
    cancellation: { type: "flexible", hoursInAdvance: "72", penalty: "1 noche", text: "" },
    payments: { transferencia: false, efectivo: false, mercadopago: false, payway: false },
  },
  launch: {
    previewChecked: false,
    mobileChecked: false,
    seoChecked: false,
    testReservation: false,
    meetingScheduled: false,
  },
};

// Idiomas y monedas: 3 idiomas activos (es/en/pt) con badges de prioridad, moneda ARS.
export const ConIdiomas = () => (
  <div style={{ width: 560, background: "#fff" }}>
    <S2Languages state={state as any} update={noop} />
  </div>
);
