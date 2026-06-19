import { S5Seo } from "@figma/my-make-file";

const noop = () => {};

// Slice `seo` de W2State: meta de "inicio" cargada, Schema.org activo, GEO off.
// La sección lee state.seo (SeoCard por página + ToggleRow de datos estructurados).
const state = {
  currentSection: "seo",
  completedSections: new Set<string>(["profile", "social", "location"]),
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
      inicio: {
        title: "Hotel Diplomatic · Mendoza · Mejor precio en reserva directa",
        description:
          "Hotel boutique en el centro de Mendoza. Reservá directo y obtené desayuno incluido y la mejor tarifa garantizada.",
      },
      habitaciones: {
        title: "Habitaciones · Hotel Diplomatic Mendoza · Suites boutique",
        description:
          "Habitaciones de diseño en el centro de Mendoza. Suites, estándar y familiares con vista a los Andes.",
      },
      contacto: { title: "", description: "" },
    },
    schemaOrgEnabled: true,
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

// SEO y Schema.org: meta titles/descriptions por página + Schema.org Hotel activo.
export const ConSeo = () => (
  <div style={{ width: 560, background: "#fff" }}>
    <S5Seo state={state as any} update={noop} />
  </div>
);
