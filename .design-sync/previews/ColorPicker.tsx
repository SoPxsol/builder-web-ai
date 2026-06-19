import { ColorPicker } from "@figma/my-make-file";

const noop = () => {};

// Color primario de marca del hotel.
export const ColorPrimario = () => (
  <div style={{ width: 280, padding: 16, background: "#fff" }}>
    <ColorPicker
      label="Color principal"
      value="#1f3a5f"
      onChange={noop}
      hint="Se usa en botones y encabezados del sitio."
    />
  </div>
);

// Color de acento, sin hint.
export const ColorAcento = () => (
  <div style={{ width: 280, padding: 16, background: "#fff" }}>
    <ColorPicker label="Color de acento" value="#c9a24b" onChange={noop} />
  </div>
);

// Dos selectores juntos, como en el panel de marca.
export const Paleta = () => (
  <div style={{ width: 280, padding: 16, background: "#fff", display: "flex", flexDirection: "column", gap: 14 }}>
    <ColorPicker
      label="Color principal"
      value="#1f3a5f"
      onChange={noop}
      hint="Identidad visual del Hotel Diplomatic."
    />
    <ColorPicker label="Color de acento" value="#c9a24b" onChange={noop} />
  </div>
);
