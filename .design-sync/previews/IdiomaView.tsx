import { IdiomaView } from "@figma/my-make-file";

const noop = () => {};

// Selector de idioma del sitio + formato de fecha + cross-link a Multilenguaje.
// Tiene estado interno (idioma/fecha seleccionados, "Guardado"); arranca en es / DD-MM-AAAA.
// Props { siteName, navigate }.
export const Pantalla = () => (
  <div style={{ height: 700, display: "flex", background: "var(--surface-page)" }}>
    <IdiomaView siteName="Hotel Diplomatic" navigate={noop} />
  </div>
);
