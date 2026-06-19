import { TemplatesView } from "@figma/my-make-file";

const noop = () => {};

// Marketplace de plantillas — la vista trae su catálogo interno (8 templates,
// destacado + plantilla del mes). Toma navigate + openWizard.
export const Marketplace = () => (
  <div style={{ height: 820, display: "flex", background: "var(--surface-page)" }}>
    <TemplatesView navigate={noop} openWizard={noop} />
  </div>
);
