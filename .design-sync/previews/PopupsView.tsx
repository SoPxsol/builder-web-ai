import { PopupsView } from "@figma/my-make-file";

const noop = () => {};

// Gestión de pop-ups: fila de stats (activos / impresiones / conversiones) + lista
// de pop-ups con trigger, métricas, badge de estado y acciones (toggle/editar/eliminar).
// Datos y estado internos. Props { siteName, navigate, openCreatePopup }.
export const Pantalla = () => (
  <div style={{ height: 600, display: "flex", background: "var(--surface-page)" }}>
    <PopupsView siteName="Hotel Diplomatic" navigate={noop} openCreatePopup={noop} />
  </div>
);
