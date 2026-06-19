import { S6AdditionalPages } from "@figma/my-make-file";

const noop = () => {};

// Slice `additionalPages` de W2State: Experiencias y Promociones activas, resto off.
// La sección lee state.additionalPages (lista de PageCard con toggle).
const state = {
  currentSection: "pages",
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

// Páginas adicionales: Experiencias y Promociones activadas, resto desactivadas.
export const ConPaginas = () => (
  <div style={{ width: 560, background: "#fff" }}>
    <S6AdditionalPages state={state as any} update={noop} />
  </div>
);
