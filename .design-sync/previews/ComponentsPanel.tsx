import { ComponentsPanel } from "@figma/my-make-file";

const noop = () => {};

// Catálogo de componentes del builder: buscador, tabs por categoría y grid de
// tarjetas. Se nutre del COMPONENT_LIBRARY interno; los handlers son no-op.
// El panel se posiciona en absolute (top:56/left:8) y su alto es calc(100% - 64px),
// así que necesita un contenedor posicionado y con alto para resolver su layout.
export const Catalogo = () => (
  <div style={{ position: "relative", width: 380, height: 600, background: "var(--surface-page)" }}>
    <ComponentsPanel onClose={noop} onSelectComponent={noop} />
  </div>
);
