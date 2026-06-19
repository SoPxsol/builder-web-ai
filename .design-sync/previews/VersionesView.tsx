import { VersionesView } from "@figma/my-make-file";

const noop = () => {};

// Historial de versiones — lista mock interna (versión actual + anteriores
// restaurables). Self-contained, solo siteName + navigate.
export const Historial = () => (
  <div style={{ height: 520, display: "flex", background: "var(--surface-page)" }}>
    <VersionesView siteName="Hotel Diplomatic" navigate={noop} />
  </div>
);
