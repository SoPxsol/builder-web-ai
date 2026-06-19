import { S1Profile } from "@figma/my-make-file";

const noop = () => {};

// Slice `profile` de W2State con datos del Hotel Diplomatic (boutique LATAM).
// La sección lee state.profile; `update` es no-op para la preview.
const state = {
  currentSection: "profile",
  completedSections: new Set<string>(),
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
  languages: { active: ["es", "en"], currency: "ARS" },
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

// Perfil completo: datos del hotel, categoría, tipografía y contacto.
export const Completo = () => (
  <div style={{ width: 560, background: "#fff" }}>
    <S1Profile state={state as any} update={noop} />
  </div>
);
