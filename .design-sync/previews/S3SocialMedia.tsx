import { S3SocialMedia } from "@figma/my-make-file";

const noop = () => {};

// Slice `social` de W2State del Hotel Diplomatic. La sección lee state.social.
const state = {
  currentSection: "social",
  completedSections: new Set<string>(["profile"]),
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
  social: {
    instagram: "@hoteldiplomatic",
    facebook: "facebook.com/hoteldiplomatic",
    whatsapp: "+54 9 261 555 0100",
    linkedin: "",
    tripadvisor: "tripadvisor.com/hoteldiplomatic",
  },
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

// Redes sociales: Instagram, WhatsApp y TripAdvisor cargados (con badges de prioridad);
// Facebook con valor; LinkedIn vacío para mostrar el placeholder.
export const ConRedes = () => (
  <div style={{ width: 560, background: "#fff" }}>
    <S3SocialMedia state={state as any} update={noop} />
  </div>
);
