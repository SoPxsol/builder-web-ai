import { BackButton } from "@figma/my-make-file";

const noop = () => {};

export const Default = () => (
  <div style={{ padding: 16, background: "var(--surface-page)" }}>
    <BackButton to={"dashboard" as never} navigate={noop} />
  </div>
);

export const EnContexto = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      width: 360,
      padding: 12,
      background: "#fff",
      border: "1px solid var(--border-ui)",
      borderRadius: 8,
    }}
  >
    <BackButton to={"paginas" as never} navigate={noop} label="Volver a Páginas" />
    <span style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)" }}>
      Editar promoción de invierno
    </span>
  </div>
);
