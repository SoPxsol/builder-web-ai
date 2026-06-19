import { ChecklistItem } from "@figma/my-make-file";

const noop = () => {};

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 380, padding: 16, background: "var(--surface-page)" }}>{children}</div>
);

export const Requerido = () =>
  wrap(
    <ChecklistItem
      label="Cargar email corporativo"
      sublabel="Sin el email las notificaciones de reservas no llegan."
      badge="required"
      checked={false}
      onChange={noop}
    />,
  );

export const Recomendado = () =>
  wrap(
    <ChecklistItem
      label="Conectar Instagram"
      sublabel="El canal más relevante para hoteles boutique en LATAM."
      badge="recommended"
      checked={false}
      onChange={noop}
    />,
  );

export const Completado = () =>
  wrap(
    <ChecklistItem
      label="Ver el sitio en el celular"
      sublabel="Revisá la versión mobile antes de publicar."
      badge="recommended"
      checked={true}
      onChange={noop}
    />,
  );
