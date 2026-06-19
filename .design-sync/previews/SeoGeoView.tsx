import { SeoGeoView } from "@figma/my-make-file";

const noop = () => {};

// Vista de visibilidad SEO/GEO — secciones internas (SEO, GEO AI Discovery,
// Google Places "próximamente"). Self-contained, solo siteName + navigate.
export const Pantalla = () => (
  <div style={{ height: 520, display: "flex", background: "var(--surface-page)" }}>
    <SeoGeoView siteName="Hotel Diplomatic" navigate={noop} />
  </div>
);
