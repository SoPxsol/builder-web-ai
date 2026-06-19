import { S8Launch } from "@figma/my-make-file";

const noop = () => {};

// Slice `launch` de W2State: parte del checklist tildado. La sección lee state.launch
// (checklist de pre-publicación + hitos del primer mes + CTA de agenda).
const state = {
  currentSection: "launch",
  completedSections: new Set<string>([
    "profile",
    "social",
    "location",
    "seo",
    "languages",
    "pages",
    "policies",
  ]),
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
    payments: { transferencia: true, efectivo: true, mercadopago: true, payway: false },
  },
  launch: {
    previewChecked: true,
    mobileChecked: true,
    seoChecked: false,
    testReservation: false,
    meetingScheduled: false,
  },
};

// Lanzamiento: checklist parcialmente completo + hitos del primer mes + CTA de agenda.
export const PreLanzamiento = () => (
  <div style={{ width: 560, background: "#fff" }}>
    <S8Launch state={state as any} update={noop} />
  </div>
);
