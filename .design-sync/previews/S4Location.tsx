import { S4Location } from "@figma/my-make-file";

const noop = () => {};

// Slice `location` de W2State: dirección + 3 POIs (≥3 dispara el caso recomendado,
// oculta la nota "Recomendado: 3+ POIs"). La sección lee state.location.
const state = {
  currentSection: "location",
  completedSections: new Set<string>(["profile", "social"]),
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
  location: {
    address: "Av. San Martín 1234, Mendoza, Argentina",
    pois: [
      { id: "p1", icon: "building", label: "Centro histórico", distance: "500 m" },
      { id: "p2", icon: "shopping-bag", label: "Peatonal Sarmiento", distance: "1.2 km" },
      { id: "p3", icon: "trees", label: "Parque San Martín", distance: "3 km" },
    ],
  },
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

// Ubicación y puntos de interés: dirección cargada + 3 POIs editables.
export const ConPois = () => (
  <div style={{ width: 560, background: "#fff" }}>
    <S4Location state={state as any} update={noop} />
  </div>
);

// Estado vacío: sin POIs todavía — muestra solo el CTA de agregar y la nota recomendada.
export const SinPois = () => (
  <div style={{ width: 560, background: "#fff" }}>
    <S4Location
      state={{ ...state, location: { address: "", pois: [] } } as any}
      update={noop}
    />
  </div>
);
