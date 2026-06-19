import { Toggle } from "@figma/my-make-file";

const noop = () => {};

export const Activo = () => (
  <div style={{ padding: 16, background: "var(--surface-page)" }}>
    <Toggle checked={true} onChange={noop} ariaLabel="Mostrar en navegación" />
  </div>
);

export const Inactivo = () => (
  <div style={{ padding: 16, background: "var(--surface-page)" }}>
    <Toggle checked={false} onChange={noop} ariaLabel="Indexar en buscadores" />
  </div>
);

export const Bloqueado = () => (
  <div style={{ padding: 16, background: "var(--surface-page)" }}>
    <Toggle checked={true} onChange={noop} ariaLabel="Idioma español" disabled />
  </div>
);

export const FilaEjemplo = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: 280,
      padding: 12,
      background: "#fff",
      border: "1px solid var(--border-ui)",
      borderRadius: 6,
    }}
  >
    <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-primary)" }}>
      Mostrar precios con impuestos
    </span>
    <Toggle checked={true} onChange={noop} ariaLabel="Mostrar precios con impuestos" />
  </div>
);
