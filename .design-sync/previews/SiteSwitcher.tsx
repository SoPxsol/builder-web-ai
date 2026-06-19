import { SiteSwitcher } from "@figma/my-make-file";

const noop = () => {};

// Site mocks: misma forma del tipo Site reusada del array initialSites de App.tsx.
const sites = [
  { id: 1, name: "Hotel Diplomatic", domain: "diplomatic.com", stats: "4.218 visitas · 38 reservas", status: "active" as const, action: "Gestionar →", thumbLeft: "#1a1a2e", thumbRight: "#e84a2b", watermark: "D", pages: 8, language: "es" },
  { id: 2, name: "Posada del Mar", domain: "posadadelmar.com", stats: "5.104 visitas · 52 reservas", status: "active" as const, action: "Gestionar →", thumbLeft: "#0f3361", thumbRight: "#c9a86e", watermark: "P", pages: 6, language: "es" },
  { id: 3, name: "Suite Central", domain: "", stats: "Setup incompleto", status: "pending" as const, action: "Continuar setup →", thumbLeft: "#c9cdd4", thumbRight: "#e2e5ea", watermark: "S", pages: 0, language: "es", wizardStep: 2 as const },
];

// Selector de sitio activo del shell (sidebar oscuro). El trigger usa tokens --shell-*,
// así que lo montamos sobre un contenedor oscuro para que lea con contraste correcto.
// El dropdown es estado interno (open) — se abre al hacer click; la preview muestra
// el trigger en su estado por defecto (cerrado) con el sitio activo.
export const Trigger = () => (
  <div style={{ width: 248, padding: 12, background: "var(--shell-nav-bg)", borderRadius: 8 }}>
    <SiteSwitcher sites={sites} activeSiteId={1} onSelect={noop} onSeeAll={noop} />
  </div>
);
