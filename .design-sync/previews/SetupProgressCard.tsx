import { SetupProgressCard } from "@figma/my-make-file";

const noop = () => {};

// Draft mínimo con la forma de W2State. Solo `completedSections` mueve la UI;
// el resto se completa con datos realistas de Hotel Diplomatic.
function makeDraft(completed: string[]) {
  return {
    currentSection: "seo",
    completedSections: new Set(completed),
    profile: {
      hotelName: "Hotel Diplomatic",
      category: "4 estrellas",
      email: "reservas@hoteldiplomatic.com",
      shortDescription: "Hotel boutique en el centro de Mendoza.",
      longDescription: "",
      phone: "+54 261 555 0100",
      font: "Inter",
    },
    languages: { active: ["es", "en"], currency: "ARS" },
    social: {
      instagram: "@hoteldiplomatic",
      facebook: "hoteldiplomatic",
      whatsapp: "+542615550100",
      linkedin: "",
      tripadvisor: "",
    },
    location: { address: "Av. San Martín 1234, Mendoza", pois: [] },
    seo: {
      pages: {
        inicio: { title: "", description: "" },
        habitaciones: { title: "", description: "" },
        contacto: { title: "", description: "" },
      },
      schemaOrgEnabled: false,
      geoEnabled: false,
    },
    additionalPages: {
      experiencias: false,
      blog: false,
      promociones: false,
      spa: false,
      eventos: false,
    },
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
}

// 3 de 8 listos — variante expandida (default) con barra, faltantes y CTAs.
export const EnProgreso = () => (
  <div style={{ maxWidth: 640, padding: 20, background: "var(--surface-page)" }}>
    <SetupProgressCard
      draft={makeDraft(["profile", "social", "location"]) as any}
      onContinue={() => {}}
      trialDay={4}
      trialTotalDays={14}
    />
  </div>
);

// Configuración 8/8 completa — variante de éxito.
export const Completo = () => (
  <div style={{ maxWidth: 640, padding: 20, background: "var(--surface-page)" }}>
    <SetupProgressCard
      draft={
        makeDraft([
          "profile",
          "social",
          "location",
          "seo",
          "languages",
          "pages",
          "policies",
          "launch",
        ]) as any
      }
      onContinue={() => {}}
      trialDay={9}
      trialTotalDays={14}
    />
  </div>
);
