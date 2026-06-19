import { SitePreview2 } from "@figma/my-make-file";

// SitePreview2 toma { state } con la forma W2State (wizard 2, configuración completa).
// Lee profile (nombre/contacto), languages, additionalPages, seo (preview tipo Google)
// y policies para componer el sitio del hotelero. `completedSections` es un Set.
// Mock fiel a INITIAL_W2_STATE poblado con datos de Hotel Diplomatic (LATAM).
const state = {
  currentSection: "seo" as const,
  completedSections: new Set(["profile", "social", "location", "seo", "languages", "pages", "policies"]),
  profile: {
    hotelName: "Hotel Diplomatic",
    category: "4 estrellas",
    email: "reservas@hoteldiplomatic.com",
    shortDescription: "Hotel boutique en el centro de Mendoza.",
    longDescription: "",
    phone: "+54 261 555 0100",
    font: "Inter",
  },
  languages: { active: ["es", "en", "pt"], currency: "ARS" },
  social: {
    instagram: "@hoteldiplomatic",
    facebook: "hoteldiplomatic",
    whatsapp: "+54 9 261 555 0100",
    linkedin: "",
    tripadvisor: "hoteldiplomatic",
  },
  location: { address: "Av. San Martín 1234, Mendoza", pois: [] },
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
    geoEnabled: true,
  },
  additionalPages: {
    experiencias: true,
    blog: false,
    promociones: true,
    spa: true,
    eventos: false,
  },
  policies: {
    cancellation: { type: "flexible" as const, hoursInAdvance: "72", penalty: "1 noche", text: "" },
    payments: { transferencia: true, efectivo: false, mercadopago: true, payway: false },
  },
  launch: {
    previewChecked: true,
    mobileChecked: true,
    seoChecked: true,
    testReservation: false,
    meetingScheduled: false,
  },
};

const stage = (children: React.ReactNode) => (
  <div style={{ height: 560, background: "var(--surface-page)" }}>{children}</div>
);

// Sitio completo: idiomas, páginas extra, snippet SEO con Schema.org activo,
// políticas y contacto. Todo poblado.
export const Completo = () => stage(<SitePreview2 state={state as any} />);

// Variante mínima: solo perfil + un idioma, sin SEO ni páginas extra
// (cómo se ve el sitio al arrancar el wizard 2).
export const Minimo = () =>
  stage(
    <SitePreview2
      state={
        {
          ...state,
          completedSections: new Set(["profile"]),
          languages: { active: ["es"], currency: "ARS" },
          additionalPages: { experiencias: false, blog: false, promociones: false, spa: false, eventos: false },
          seo: { ...state.seo, pages: { ...state.seo.pages, inicio: { title: "", description: "" } }, schemaOrgEnabled: false },
          policies: { ...state.policies, payments: { transferencia: false, efectivo: false, mercadopago: false, payway: false } },
        } as any
      }
    />,
  );
