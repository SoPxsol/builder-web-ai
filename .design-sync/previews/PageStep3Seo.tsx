import { PageStep3Seo } from "@figma/my-make-file";

const noop = () => {};

// Estado fiel a PageState (types/creation.ts) — paso 3 (SEO y publicación), con
// metadatos realistas de una página del hotel Diplomatic. update → noop.
// El step es el panel izquierdo del wizard (~42%), lo envolvemos en una columna blanca.
const state = {
  currentStep: 3 as const,
  name: "Experiencias en Mendoza",
  slug: "experiencias-en-mendoza",
  template: "blank" as const,
  language: "es",
  sections: ["hero", "gallery", "rooms", "cta"] as (
    | "hero"
    | "gallery"
    | "text-image"
    | "contact-form"
    | "rooms"
    | "cta"
  )[],
  seoTitle: "Experiencias en Mendoza | Hotel Diplomatic",
  metaDescription:
    "Descubrí degustaciones de vino, cabalgatas y excursiones en alta montaña a pasos del Hotel Diplomatic. Reservá tu estadía boutique en Mendoza.",
  canonicalUrl: "hoteldiplomatic.com/experiencias-en-mendoza",
  ogImage:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=70&w=800",
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

// Variante principal: SEO completo, imagen OG cargada, publicar ahora.
export const SeoCompleto = () => col(<PageStep3Seo state={state} update={noop} />);

// Variante "Programar publicación" con OG todavía sin cargar.
export const Programada = () =>
  col(
    <PageStep3Seo
      state={{ ...state, publish: "scheduled", ogImage: "" }}
      update={noop}
    />,
  );
