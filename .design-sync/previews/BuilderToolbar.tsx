import { BuilderToolbar } from "@figma/my-make-file";

const noop = () => {};

// Autosave "guardado hace ~2 min" — estable respecto al momento de captura.
const savedAt = new Date(Date.now() - 2 * 60 * 1000).toISOString();

const base = {
  activeTab: "page",
  onTabChange: noop,
  viewport: "desktop",
  onViewportChange: noop,
  canvasWidth: 1268,
  onCanvasWidthChange: noop,
  componentsOpen: false,
  onToggleComponents: noop,
  aiOpen: false,
  onToggleAi: noop,
  onBack: noop,
  onPublish: noop,
  publishStatus: "draft",
  autosaveStatus: { kind: "saved", savedAt },
  onAutosaveRetry: noop,
  previewMode: false,
  onTogglePreview: noop,
  language: "es",
  onLanguageChange: noop,
  onOpenPageSettings: noop,
  onOpenGlobalState: noop,
  onOpenFontSelector: noop,
  onCreateTemplate: noop,
  onOpenCode: noop,
} as const;

// La barra ocupa el ancho del editor (~1268px); en un contenedor angosto sus
// grupos flex (tabs · viewport · acciones) se solapan. La encuadramos a ancho
// de editor para que el layout respire.
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: 1180, border: "0.5px solid var(--border-ui)", borderRadius: 8, overflow: "hidden" }}>
    {children}
  </div>
);

// Barra superior del editor en modo edición: tabs Header/Página/Footer,
// viewport, toggles de paneles, chip de autosave y botón Publicar.
export const Edicion = () => <Frame><BuilderToolbar {...base} /></Frame>;

// Modo vista previa activo.
export const VistaPrevia = () => <Frame><BuilderToolbar {...base} previewMode /></Frame>;

// Entidad ya publicada y sin cambios: botón "Publicado" deshabilitado.
export const Publicado = () => (
  <Frame><BuilderToolbar {...base} publishStatus="published-clean" /></Frame>
);

// Autosave en estado de error, con acción "Reintentar".
export const AutosaveError = () => (
  <Frame><BuilderToolbar {...base} autosaveStatus={{ kind: "error", lastErrorAt: savedAt }} /></Frame>
);
