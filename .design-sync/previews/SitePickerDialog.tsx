import { SitePickerDialog } from "@figma/my-make-file";
import { Megaphone } from "lucide-react";

const noop = () => {};

// Site mocks: misma forma del tipo Site (id, name, domain, status, thumbLeft/Right,
// watermark…) reusada del array initialSites de App.tsx.
const sites = [
  { id: 1, name: "Hotel Diplomatic", domain: "diplomatic.com", stats: "4.218 visitas · 38 reservas", status: "active" as const, action: "Gestionar →", thumbLeft: "#1a1a2e", thumbRight: "#e84a2b", watermark: "D", pages: 8, language: "es" },
  { id: 2, name: "Posada del Mar", domain: "posadadelmar.com", stats: "5.104 visitas · 52 reservas", status: "active" as const, action: "Gestionar →", thumbLeft: "#0f3361", thumbRight: "#c9a86e", watermark: "P", pages: 6, language: "es" },
  { id: 5, name: "Aurora Stay — Hotel Boutique", domain: "aurorastay.com", stats: "6 páginas", status: "active" as const, action: "Gestionar →", thumbLeft: "#1a365d", thumbRight: "#4a90c4", watermark: "A", pages: 6, language: "es" },
  { id: 7, name: "Hotel Patagonia Chica", domain: "patagoniachica.com", stats: "8 páginas", status: "active" as const, action: "Gestionar →", thumbLeft: "#2d3748", thumbRight: "#6b46c1", watermark: "H", pages: 8, language: "es" },
];

// Dialog modal (fixed inset:0). Se elige un sitio antes de navegar a una acción
// rápida del Dashboard. action = { label, Icon: LucideIcon }. Lo envolvemos en un
// contenedor relative con alto para que el overlay fixed tenga contexto de layout.
export const Abierto = () => (
  <div style={{ position: "relative", width: 720, height: 520, background: "var(--surface-page)", overflow: "hidden" }}>
    <SitePickerDialog
      action={{ label: "Pop-ups", Icon: Megaphone }}
      sites={sites}
      onPick={noop}
      onClose={noop}
    />
  </div>
);
