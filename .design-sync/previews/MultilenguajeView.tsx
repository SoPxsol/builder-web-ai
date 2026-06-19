import { MultilenguajeView } from "@figma/my-make-file";

const noop = () => {};

// Gestión de idiomas: master toggle (activado), lista de idiomas activos con
// principal/toggle/eliminar, y catálogo de idiomas para agregar. Estado interno,
// arranca con es (principal) + en activos y pt inactivo. Props { siteName, navigate }.
export const Pantalla = () => (
  <div style={{ height: 700, display: "flex", background: "var(--surface-page)" }}>
    <MultilenguajeView siteName="Hotel Diplomatic" navigate={noop} />
  </div>
);
