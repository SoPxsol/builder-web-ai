import { PagePreview } from "@figma/my-make-file";

// PagePreview es el panel derecho del wizard de creación de página: un mockup de
// navegador que dibuja las secciones elegidas en el paso 2. Solo recibe `state`
// (PageState de types/creation.ts). Lo montamos en un contenedor con fondo de
// superficie y alto, igual que la columna derecha del CreationShell.
const base = {
  currentStep: 2 as const,
  name: "Experiencias en Mendoza",
  slug: "experiencias-en-mendoza",
  template: "blank" as const,
  language: "es",
  seoTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  ogImage: "",
  indexable: true,
  showInNav: true,
  publish: "now" as const,
};

type Section = "hero" | "gallery" | "text-image" | "contact-form" | "rooms" | "cta";

const panel = (children: React.ReactNode) => (
  <div
    style={{
      background: "var(--surface-page)",
      minHeight: 560,
      fontFamily: "var(--font-sans)",
    }}
  >
    {children}
  </div>
);

// Variante principal: página armada con hero, texto+imagen, galería, habitaciones y CTA.
export const PaginaArmada = () =>
  panel(
    <PagePreview
      state={{
        ...base,
        sections: ["hero", "text-image", "gallery", "rooms", "cta"] as Section[],
      }}
    />,
  );

// Variante vacía: placeholder "tu nueva página aparecerá aquí".
export const SinContenido = () =>
  panel(<PagePreview state={{ ...base, sections: [] as Section[] }} />);

// Variante con formulario de contacto incluido.
export const ConContacto = () =>
  panel(
    <PagePreview
      state={{
        ...base,
        sections: ["hero", "contact-form"] as Section[],
      }}
    />,
  );
