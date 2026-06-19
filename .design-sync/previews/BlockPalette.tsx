import { BlockPalette } from "@figma/my-make-file";

const noop = () => {};

// Paleta del editor de artículo — ancho fijo 232px, grupos completos.
export const Canonical = () => (
  <div style={{ height: 600, display: "flex", background: "var(--surface-page)" }}>
    <BlockPalette onAdd={noop} dragEnabled={true} />
  </div>
);

// Variante mobile (dragEnabled=false) — ancho 100%, items con más padding.
export const Mobile = () => (
  <div style={{ width: 360, height: 600, display: "flex", background: "var(--surface-page)" }}>
    <BlockPalette onAdd={noop} dragEnabled={false} />
  </div>
);
