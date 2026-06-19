import { AddModulePicker } from "@figma/my-make-file";

const noop = () => {};

// Cabecera del panel lateral del editor. Por diseño (progressive disclosure)
// el catálogo se despliega al enfocar el input — en estado de reposo se ve
// solo el buscador "Buscar módulo o componente".
export const Canonical = () => (
  <div
    style={{
      width: 280,
      background: "var(--surface-page)",
      border: "0.5px solid var(--border-ui)",
      borderRadius: "var(--radius-card)",
      overflow: "hidden",
    }}
  >
    <AddModulePicker onAddComponent={noop} onCreateWithAi={noop} />
  </div>
);
