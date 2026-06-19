import { MisSitiosView } from "@figma/my-make-file";

const noop = () => {};

// Forma de `Site` (types.ts). Mezcla de sitios activos y uno pending para
// mostrar las dos variantes de tarjeta (thumbnail con acciones vs. setup incompleto).
const sites = [
  { id: 1, name: "Hotel Diplomatic", domain: "hoteldiplomatic.com", stats: "12 páginas", status: "active", action: "edit", thumbLeft: "#1a3a5c", thumbRight: "#4a7ab5", watermark: "D", pages: 12, language: "ES" },
  { id: 2, name: "Posada del Río", domain: "posadadelrio.com.ar", stats: "8 páginas", status: "active", action: "edit", thumbLeft: "#3d2a1a", thumbRight: "#c9a86e", watermark: "P", pages: 8, language: "ES" },
  { id: 3, name: "Cabañas Aurora", domain: "cabanasaurora.cl", stats: "6 páginas", status: "active", action: "edit", thumbLeft: "#1a3d3a", thumbRight: "#2e8b7a", watermark: "A", pages: 6, language: "ES" },
  { id: 4, name: "Mar Azul Resort", domain: "marazulresort.com", stats: "10 páginas", status: "active", action: "edit", thumbLeft: "#0d2961", thumbRight: "#0d87d1", watermark: "M", pages: 10, language: "EN" },
  { id: 5, name: "Hostal Centro", domain: "", stats: "—", status: "pending", action: "resume", thumbLeft: "#c9cdd4", thumbRight: "#e2e5ea", watermark: "H", pages: 0, wizardStep: 3 as const },
];

export const Listado = () => (
  <div style={{ height: 720, display: "flex", background: "var(--surface-page)" }}>
    <MisSitiosView sites={sites as any} navigate={noop} openWizard={noop} openWizardAt={noop} />
  </div>
);

// Estado vacío — sin sitios todavía, solo las dos opciones de creación.
export const Vacio = () => (
  <div style={{ height: 520, display: "flex", background: "var(--surface-page)" }}>
    <MisSitiosView sites={[]} navigate={noop} openWizard={noop} openWizardAt={noop} />
  </div>
);
