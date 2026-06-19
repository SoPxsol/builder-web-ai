import { Badge } from "@figma/my-make-file";

export const Tones = () => (
  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
    <Badge tone="success">Publicado</Badge>
    <Badge tone="info">Principal</Badge>
    <Badge tone="warning">Borrador</Badge>
    <Badge tone="neutral">Inactivo</Badge>
    <Badge tone="destructive">Error</Badge>
  </div>
);

export const EnContexto = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 320 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-primary)" }}>Inicio</span>
      <Badge tone="info">Principal</Badge>
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-primary)" }}>Promociones de verano</span>
      <Badge tone="warning">Borrador</Badge>
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-primary)" }}>Habitaciones</span>
      <Badge tone="success">Publicado</Badge>
    </div>
  </div>
);
