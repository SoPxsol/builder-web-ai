import { IntegracionesView } from "@figma/my-make-file";

const noop = () => {};

// Listado de integraciones (GA4, Meta Pixel, WhatsApp, Mailchimp, Booking…) con
// filtro por categoría, badges, toggles de conexión y dialog de confirmación al
// desactivar una integración crítica. Datos y estado internos. Props { siteName, navigate }.
export const Pantalla = () => (
  <div style={{ height: 720, display: "flex", background: "var(--surface-page)" }}>
    <IntegracionesView siteName="Hotel Diplomatic" navigate={noop} />
  </div>
);
