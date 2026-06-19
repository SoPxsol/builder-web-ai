import { PageStep1Basic } from "@figma/my-make-file";

const noop = () => {};

// Estado fiel a INITIAL_PAGE_STATE (types/creation.ts → PageState), poblado con
// datos realistas de una página nueva del hotel Diplomatic. update → noop.
// El step es el panel izquierdo del wizard (padding interno, ~42% del modal),
// así que lo envolvemos en una columna blanca con ancho fijo para emular esa franja.
const state = {
  currentStep: 1 as const,
  name: "Experiencias en Mendoza",
  slug: "experiencias-en-mendoza",
  template: "blank" as const,
  language: "es",
  sections: [],
  seoTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  ogImage: "",
  indexable: true,
  showInNav: true,
  publish: "now" as const,
};

const col = (children: React.ReactNode) => (
  <div
    style={{
      width: 440,
      maxWidth: "100%",
      background: "#fff",
      borderRight: "1px solid var(--border-ui)",
      fontFamily: "var(--font-sans)",
    }}
  >
    {children}
  </div>
);

// Variante principal: nombre + URL cargados, template "En blanco" seleccionado.
export const InfoBasica = () => col(<PageStep1Basic state={state} update={noop} />);

// Variante con plantilla profesional elegida (resalta la opción "Desde template").
export const DesdeTemplate = () =>
  col(<PageStep1Basic state={{ ...state, template: "from-template" }} update={noop} />);
