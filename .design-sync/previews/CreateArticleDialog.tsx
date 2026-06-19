import { CreateArticleDialog } from "@figma/my-make-file";

const noop = () => {};

// Diálogo de creación abierto — mínima fricción, solo pide el título.
// Usa createPortal (position:fixed inset:0), por eso el contenedor solo
// necesita alto para que el overlay tenga dónde resolverse.
export const Abierto = () => (
  <div style={{ position: "relative", width: 720, height: 460 }}>
    <CreateArticleDialog
      open={true}
      contextLabel="hoteldiplomatic.com"
      onCancel={noop}
      onCreate={noop}
    />
  </div>
);

// Sin contextLabel: oculta la línea "Se publicará en …/blog/…".
export const SinContexto = () => (
  <div style={{ position: "relative", width: 720, height: 460 }}>
    <CreateArticleDialog open={true} onCancel={noop} onCreate={noop} />
  </div>
);
