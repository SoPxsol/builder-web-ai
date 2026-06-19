import { InfoSitioView } from "@figma/my-make-file";

const noop = () => {};

// Resumen del sitio: lista label/valor (nombre, dominio, plantilla, idioma, zona horaria)
// con un "Editar" por fila que navega al destino correspondiente. Props { siteName, navigate }.
export const Pantalla = () => (
  <div style={{ height: 520, display: "flex", background: "var(--surface-page)" }}>
    <InfoSitioView siteName="Hotel Diplomatic" navigate={noop} />
  </div>
);
