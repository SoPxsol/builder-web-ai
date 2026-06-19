import { CodeView } from "@figma/my-make-file";

/* Mismo artículo de hotel (forma BlogArticle + ArticleBlock), exportado a HTML. */
const ARTICLE = {
  kind: "articulo" as const,
  id: "art-demo",
  title: "Guía gastronómica de Buenos Aires",
  slug: "guia-gastronomica-buenos-aires",
  category: "Gastronomía",
  excerpt: "Bodegones, parrillas y cafés notables: dónde comer mejor cerca del hotel.",
  coverImageUrl:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=70&w=1600",
  body: "",
  status: "published" as const,
  updatedAt: "2026-06-18T16:42:00.000Z",
};

const BLOCKS = [
  {
    id: "p1",
    type: "paragraph" as const,
    variant: "lead" as const,
    text: "Buenos Aires se come caminando. Estas son las mesas favoritas de nuestro equipo, a pasos del hotel.",
  },
  { id: "h1", type: "heading" as const, level: 2 as const, text: "Parrillas de barrio", numbered: true },
  {
    id: "p2",
    type: "paragraph" as const,
    text: "La parrilla porteña es un ritual: brasas a la vista y el punto justo de la carne.",
  },
  {
    id: "img1",
    type: "image" as const,
    url: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=70&w=1200",
    caption: "Una parrilla clásica de Palermo Viejo.",
    alt: "Cortes de carne sobre las brasas",
  },
  {
    id: "list1",
    type: "list" as const,
    ordered: false,
    items: ["Don Julio — Palermo", "El Preferido de Palermo", "La Brigada — San Telmo"],
  },
  { id: "tags1", type: "tags" as const, tags: ["Gastronomía", "Buenos Aires", "Parrillas"] },
];

const LAYOUT = {
  sidebar: true,
  sidebarCta: true,
  sidebarCtaTitle: "Viví Buenos Aires desde adentro",
  sidebarCtaText: "Recorridos gastronómicos a medida para huéspedes.",
  sidebarCtaButton: "Consultar ahora",
  related: true,
  newsletter: true,
  moreArticles: true,
};

// Vista de código — el artículo renderizado como HTML semántico (solo lectura),
// con barra superior y botón de copiar. Tema oscuro tipo editor.
export const Codigo = () => (
  <div style={{ width: 720, height: 560, display: "flex" }}>
    <CodeView article={ARTICLE} blocks={BLOCKS} layout={LAYOUT} />
  </div>
);
