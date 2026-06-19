import { SFinal } from "@figma/my-make-file";

const noop = () => {};

// Pantalla de resumen y publicación. Lee state.completedSections (para stats + lista),
// state.languages.active y state.additionalPages. onEdit navega a una sección a editar.
function makeState(completed: string[]) {
  return {
    currentSection: "final",
    completedSections: new Set<string>(completed),
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
      seoChecked: true,
      testReservation: false,
      meetingScheduled: false,
    },
  };
}

// 8/8 secciones completas: stats al 100%, resumen "Listo" y plan value.
export const Completo = () => (
  <div style={{ width: 560, background: "#fff" }}>
    <SFinal
      state={
        makeState([
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
      update={noop}
      onEdit={noop}
    />
  </div>
);

// En progreso: 4 de 8 hechas — mezcla "Listo" / "Pendiente" en la lista de secciones.
export const EnProgreso = () => (
  <div style={{ width: 560, background: "#fff" }}>
    <SFinal
      state={makeState(["profile", "social", "location", "seo"]) as any}
      update={noop}
      onEdit={noop}
    />
  </div>
);
