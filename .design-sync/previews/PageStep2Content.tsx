import { PageStep2Content } from "@figma/my-make-file";

const noop = () => {};

// Estado fiel a PageState (types/creation.ts) — paso 2 (Contenido). Las secciones
// ya elegidas para una página de la home del hotel Diplomatic. update → noop.
// El step es el panel izquierdo del wizard (~42%), lo envolvemos en una columna blanca.
const state = {
  currentStep: 2 as const,
  name: "Experiencias en Mendoza",
  slug: "experiencias-en-mendoza",
  template: "blank" as const,
  language: "es",
  sections: ["hero", "text-image", "gallery", "rooms", "cta"] as (
    | "hero"
    | "gallery"
    | "text-image"
    | "contact-form"
    | "rooms"
    | "cta"
  )[],
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

// Variante principal: catálogo de secciones + lista ordenada con 5 bloques agregados.
export const ConSecciones = () => col(<PageStep2Content state={state} update={noop} />);

// Variante vacía: muestra el estado "agregá secciones con el botón +".
export const SinSecciones = () =>
  col(<PageStep2Content state={{ ...state, sections: [] }} update={noop} />);
