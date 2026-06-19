import { BlogView } from "@figma/my-make-file";

const noop = () => {};

/* Listado de artículos del blog (forma BlogArticle): publicados, borradores y
 * filas en estado optimista (guardando / error). */
const ARTICLES = [
  {
    kind: "articulo" as const,
    id: "art-1",
    title: "Guía gastronómica de Buenos Aires: dónde comer cerca del hotel",
    slug: "guia-gastronomica-buenos-aires",
    category: "Gastronomía",
    excerpt:
      "De los bodegones de San Telmo a las parrillas de Palermo: nuestra selección de mesas imperdibles a pasos del hotel.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=70&w=800",
    body: "",
    status: "published" as const,
    updatedAt: "2026-06-18T16:42:00.000Z",
  },
  {
    kind: "articulo" as const,
    id: "art-2",
    title: "5 razones para reservar directo con nosotros",
    slug: "5-razones-para-reservar-directo",
    category: "Novedades",
    excerpt:
      "Mejor precio garantizado, upgrades sin costo y atención personalizada: por qué reservar en nuestro sitio conviene más que en las OTAs.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=70&w=800",
    body: "",
    status: "published" as const,
    updatedAt: "2026-05-28T10:00:00.000Z",
  },
  {
    kind: "articulo" as const,
    id: "art-3",
    title: "Menú de otoño en el restaurante",
    slug: "menu-de-otono-restaurante",
    category: "Gastronomía",
    excerpt: "",
    coverImageUrl: "",
    body: "",
    status: "draft" as const,
    updatedAt: "2026-05-15T09:00:00.000Z",
  },
  {
    kind: "articulo" as const,
    id: "art-4",
    title: "Qué hacer en Mendoza en temporada de vendimia",
    slug: "que-hacer-mendoza-vendimia",
    category: "Experiencias",
    excerpt: "Bodegas, festivales y rutas del vino para aprovechar la época más vibrante del año.",
    coverImageUrl: "",
    body: "",
    status: "draft" as const,
    creation: "saving" as const,
    updatedAt: "2026-06-19T12:00:00.000Z",
  },
  {
    kind: "articulo" as const,
    id: "art-5",
    title: "Los mejores miradores de la cordillera",
    slug: "mejores-miradores-cordillera",
    category: "Tips de viaje",
    excerpt: "",
    coverImageUrl: "",
    body: "",
    status: "draft" as const,
    creation: "error" as const,
    updatedAt: "2026-06-19T11:58:00.000Z",
  },
];

// Listado del blog — header con CTA, filtros y filas con sus estados.
export const Listado = () => (
  <div style={{ width: 980, height: 720, display: "flex", background: "var(--surface-page)" }}>
    <BlogView
      siteName="Hotel Diplomatic"
      navigate={noop}
      articles={ARTICLES}
      onCreate={noop}
      onEdit={noop}
      onDelete={noop}
      onRetry={noop}
      onPublishToggle={noop}
    />
  </div>
);

// Estado vacío — sin artículos todavía.
export const Vacio = () => (
  <div style={{ width: 980, height: 720, display: "flex", background: "var(--surface-page)" }}>
    <BlogView
      siteName="Hotel Diplomatic"
      navigate={noop}
      articles={[]}
      onCreate={noop}
      onEdit={noop}
      onDelete={noop}
      onRetry={noop}
      onPublishToggle={noop}
    />
  </div>
);
