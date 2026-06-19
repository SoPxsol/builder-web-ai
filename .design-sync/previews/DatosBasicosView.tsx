import { DatosBasicosView } from "@figma/my-make-file";

const noop = () => {};

// Vista de solo lectura con los datos del hotel (lista label/valor + botón "Editar"
// por fila). Recibe { siteName, navigate }. Contenido realista hardcodeado en la fuente.
export const Pantalla = () => (
  <div style={{ height: 560, display: "flex", background: "var(--surface-page)" }}>
    <DatosBasicosView siteName="Hotel Diplomatic" navigate={noop} />
  </div>
);
