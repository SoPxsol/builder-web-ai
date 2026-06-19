import { PropiedadesView } from "@figma/my-make-file";

const noop = () => {};

// Formulario de habitaciones y servicios — la vista trae su propio estado inicial
// (Hotel Tamarindo, contacto, operación). Self-contained: siteName + navigate.
export const Formulario = () => (
  <div style={{ height: 720, display: "flex", background: "var(--surface-page)" }}>
    <PropiedadesView siteName="Hotel Diplomatic" navigate={noop} />
  </div>
);
