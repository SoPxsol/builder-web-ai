import { PaginasView } from "@figma/my-make-file";

const noop = () => {};

// La vista trae sus propias páginas mock (DEFAULT_PAGES: Inicio, Habitaciones,
// Contacto, Galería, Servicios, Nosotros). Solo necesita siteName + navigate.
export const Listado = () => (
  <div style={{ height: 640, display: "flex", background: "var(--surface-page)" }}>
    <PaginasView siteName="Hotel Diplomatic" navigate={noop} />
  </div>
);
