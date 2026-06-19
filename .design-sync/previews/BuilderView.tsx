import { BuilderView } from "@figma/my-make-file";

const noop = () => {};

// El builder completo. Con isOpen=true monta el editor entero: toolbar,
// árbol de módulos (se auto-siembra con la página "Inicio"), canvas y paneles.
export const Editor = () => <BuilderView isOpen onClose={noop} siteId="demo" />;
