import { ExitConfirmDialog } from "@figma/my-make-file";

const noop = () => {};

// Confirmación de salida con cambios sin guardar — labels por defecto.
export const Default = () => (
  <div style={{ position: "relative", width: 520, height: 280 }}>
    <ExitConfirmDialog open={true} onCancel={noop} onConfirm={noop} />
  </div>
);

// Labels custom — mismo patrón aplicado a otro contexto de salida.
export const LabelsCustom = () => (
  <div style={{ position: "relative", width: 520, height: 280 }}>
    <ExitConfirmDialog
      open={true}
      title="¿Descartar el borrador?"
      description="El artículo que empezaste no se guardó. Si salís ahora, lo perdés."
      cancelLabel="Seguir editando"
      confirmLabel="Descartar borrador"
      onCancel={noop}
      onConfirm={noop}
    />
  </div>
);
