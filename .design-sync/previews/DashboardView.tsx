import { DashboardView } from "@figma/my-make-file";

const noop = () => {};

// Forma de `Site` (types.ts) — varios activos + uno pending para la grilla "Tus Sitios".
const sites = [
  { id: 1, name: "Hotel Diplomatic", domain: "hoteldiplomatic.com", stats: "12 páginas", status: "active", action: "edit", thumbLeft: "#1a3a5c", thumbRight: "#4a7ab5", watermark: "D", pages: 12, language: "ES" },
  { id: 2, name: "Posada del Río", domain: "posadadelrio.com.ar", stats: "8 páginas", status: "active", action: "edit", thumbLeft: "#3d2a1a", thumbRight: "#c9a86e", watermark: "P", pages: 8, language: "ES" },
  { id: 3, name: "Cabañas Aurora", domain: "cabanasaurora.cl", stats: "6 páginas", status: "active", action: "edit", thumbLeft: "#1a3d3a", thumbRight: "#2e8b7a", watermark: "A", pages: 6, language: "ES" },
  { id: 4, name: "Hostal Centro", domain: "", stats: "—", status: "pending", action: "resume", thumbLeft: "#c9cdd4", thumbRight: "#e2e5ea", watermark: "H", pages: 0, wizardStep: 2 as const },
];

// Draft del W2 con la forma de W2State (réplica del mock de SetupProgressCard.tsx).
// schemaOrgEnabled=true → "Buscadores activos" en 3/3; un idioma activo → hint de multilenguaje.
const wizard2Draft = {
  currentSection: "seo",
  completedSections: new Set(["profile", "social", "location", "seo"]),
  profile: {
    hotelName: "Hotel Diplomatic",
    category: "4 estrellas",
    email: "reservas@hoteldiplomatic.com",
    shortDescription: "Hotel boutique en el centro de Mendoza.",
    longDescription: "",
    phone: "+54 261 555 0100",
    font: "Inter",
  },
  languages: { active: ["es"], currency: "ARS" },
  social: { instagram: "@hoteldiplomatic", facebook: "hoteldiplomatic", whatsapp: "+542615550100", linkedin: "", tripadvisor: "" },
  location: { address: "Av. San Martín 1234, Mendoza", pois: [] },
  seo: {
    pages: {
      inicio: { title: "Hotel Diplomatic · Mendoza", description: "Hotel boutique 4 estrellas en el centro." },
      habitaciones: { title: "", description: "" },
      contacto: { title: "", description: "" },
    },
    schemaOrgEnabled: true,
    geoEnabled: true,
  },
  additionalPages: { experiencias: false, blog: false, promociones: false, spa: false, eventos: false },
  policies: {
    cancellation: { type: "flexible", hoursInAdvance: "72", penalty: "1 noche", text: "" },
    payments: { transferencia: false, efectivo: false, mercadopago: false, payway: false },
  },
  launch: { previewChecked: false, mobileChecked: false, seoChecked: false, testReservation: false, meetingScheduled: false },
};

// Dashboard con cuenta poblada: stat cards comerciales, acciones rápidas,
// SetupProgressCard, calendario comercial y grilla de sitios.
export const Poblado = () => (
  <div style={{ height: 820, display: "flex", background: "var(--surface-page)" }}>
    <DashboardView
      sites={sites as any}
      navigate={noop}
      openWizard={noop}
      openWizardAt={noop}
      wizard2Draft={wizard2Draft as any}
      openWizard2={noop}
      openCreatePopupWith={noop}
      onCreateInSite={noop}
      trialDay={4}
      trialTotalDays={14}
    />
  </div>
);

// Estado de bienvenida — cuenta sin sitios, hero de "Crear primer sitio".
export const Bienvenida = () => (
  <div style={{ height: 520, display: "flex", background: "var(--surface-page)" }}>
    <DashboardView
      sites={[]}
      navigate={noop}
      openWizard={noop}
      openWizardAt={noop}
      wizard2Draft={null}
      openWizard2={noop}
      openCreatePopupWith={noop}
      onCreateInSite={noop}
    />
  </div>
);
