import { CreatePageWizard } from "@figma/my-make-file";

const noop = () => {};

// El wizard maneja su PageState internamente (arranca de INITIAL_PAGE_STATE),
// así que no recibe `state` por props. Se monta full-screen vía CreationShell
// (createPortal sobre document.body, position:fixed inset:0) con isOpen:true,
// por eso solo hace falta reservar alto en el contenedor para verlo centrado.
// Paso 1 (Info básica): columna izquierda con el form, derecha con la preview viva.
const frame = (children: React.ReactNode) => (
  <div style={{ position: "relative", minHeight: 760, background: "var(--surface-page)" }}>
    {children}
  </div>
);

// Variante principal: wizard abierto en el contexto del sitio del hotel Diplomatic.
export const Abierto = () =>
  frame(
    <CreatePageWizard
      isOpen
      contextLabel="hoteldiplomatic.com"
      onClose={noop}
      onPublish={noop}
    />,
  );
