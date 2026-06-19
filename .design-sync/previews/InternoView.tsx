import { InternoView } from "@figma/my-make-file";

const noop = () => {};

// Vista interna PXSOL: otorgar/revocar permiso de "Administrador de diseño" a
// usuarios externos (input de email + Button primario, tabla de usuarios con permiso,
// dialog destructivo al revocar). OJO: recibe SOLO { navigate } (no siteName).
export const Pantalla = () => (
  <div style={{ height: 560, display: "flex", background: "var(--surface-page)" }}>
    <InternoView navigate={noop} />
  </div>
);
