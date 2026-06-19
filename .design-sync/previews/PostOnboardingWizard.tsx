import { PostOnboardingWizard } from "@figma/my-make-file";

const noop = () => {};

// Estado fiel a W2State (ver INITIAL_W2_STATE en types/wizard2). Hotel "Diplomatic"
// (boutique LATAM) con varias secciones ya completas para mostrar el wizard vivo.
// El wizard se abre con isOpen:true y monta su propio portal full-screen.
const diplomaticInitial = {
  currentSection: "seo",
  completedSections: ["profile", "social", "location"],
  profile: {
    hotelName: "Hotel Diplomatic",
    category: "boutique",
    email: "reservas@hoteldiplomatic.com",
    shortDescription: "Hotel boutique en el centro histórico de Mendoza.",
    longDescription:
      "Hotel boutique en el corazón de Mendoza. Diseño contemporáneo, atención personalizada y una ubicación privilegiada a pasos de la peatonal. 18 habitaciones únicas, desayuno regional y rooftop con vista a los Andes.",
    phone: "+54 261 555 0100",
    font: "Playfair Display",
  },
  languages: { active: ["es", "en", "pt"], currency: "ARS" },
  social: {
    instagram: "@hoteldiplomatic",
    facebook: "facebook.com/hoteldiplomatic",
    whatsapp: "+54 9 261 555 0100",
    linkedin: "",
    tripadvisor: "tripadvisor.com/hoteldiplomatic",
  },
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
      inicio: {
        title: "Hotel Diplomatic · Mendoza · Mejor precio en reserva directa",
        description:
          "Hotel boutique en el centro de Mendoza. Reservá directo y obtené desayuno incluido y la mejor tarifa garantizada.",
      },
      habitaciones: { title: "", description: "" },
      contacto: { title: "", description: "" },
    },
    schemaOrgEnabled: true,
    geoEnabled: false,
  },
  additionalPages: {
    experiencias: true,
    blog: false,
    promociones: true,
    spa: false,
    eventos: false,
  },
  policies: {
    cancellation: {
      type: "flexible",
      hoursInAdvance: "72",
      penalty: "1 noche",
      text: "Cancelación gratuita hasta 72 horas antes del check-in.",
    },
    payments: { transferencia: true, efectivo: true, mercadopago: true, payway: false },
  },
  launch: {
    previewChecked: true,
    mobileChecked: false,
    seoChecked: false,
    testReservation: false,
    meetingScheduled: false,
  },
};

// Wizard abierto en la sección SEO, con 3 secciones ya completas. Render principal:
// modal full-screen con step trail, formulario + preview en vivo y footer sticky.
export const Abierto = () => (
  <PostOnboardingWizard
    isOpen
    onClose={noop}
    onPublish={noop}
    onChange={noop}
    initialState={diplomaticInitial as any}
  />
);
