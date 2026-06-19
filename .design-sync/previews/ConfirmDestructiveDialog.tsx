import { ConfirmDestructiveDialog } from "@figma/my-make-file";

const noop = () => {};

export const Abierto = () => (
  <div style={{ position: "relative", width: 460, height: 240 }}>
    <ConfirmDestructiveDialog
      open={true}
      title="Eliminar página"
      description="Vas a eliminar la página"
      resourceName="Promociones de verano"
      onCancel={noop}
      onConfirm={noop}
    />
  </div>
);

export const ConLabelsCustom = () => (
  <div style={{ position: "relative", width: 460, height: 240 }}>
    <ConfirmDestructiveDialog
      open={true}
      title="Despublicar artículo"
      description="El artículo dejará de ser visible para los huéspedes."
      cancelLabel="Mantener publicado"
      confirmLabel="Despublicar"
      onCancel={noop}
      onConfirm={noop}
    />
  </div>
);
