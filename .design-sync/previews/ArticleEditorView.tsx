import { ArticleEditorView } from "@figma/my-make-file";

const noop = () => {};

/* Artículo de hotel en edición (forma BlogArticle + ArticleBlock). El editor es
 * una sola pantalla full-screen: paleta + lienzo de bloques + ajustes a la derecha. */
const ARTICLE = {
  kind: "articulo" as const,
  id: "art-demo",
  title: "Guía gastronómica de Buenos Aires: dónde comer cerca del hotel",
  slug: "guia-gastronomica-buenos-aires",
  category: "Gastronomía",
  excerpt:
    "De los bodegones de San Telmo a las parrillas de Palermo: nuestra selección de mesas imperdibles a pasos del hotel.",
  coverImageUrl:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=70&w=1600",
  body: "",
  blocks: [
    {
      id: "p1",
      type: "paragraph" as const,
      variant: "lead" as const,
      text: "Buenos Aires se come caminando. Reunimos las mesas favoritas de nuestro equipo, todas a pasos del hotel.",
    },
    { id: "h1", type: "heading" as const, level: 2 as const, text: "Parrillas de barrio", numbered: true },
    {
      id: "p2",
      type: "paragraph" as const,
      text: "La parrilla porteña no es solo asado: es un ritual. Buscá las que tienen brasas a la vista y mozos de toda la vida.",
    },
    {
      id: "img1",
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=70&w=1200",
      caption: "Una parrilla clásica de Palermo Viejo al caer la tarde.",
      alt: "Cortes de carne sobre las brasas",
    },
    {
      id: "call1",
      type: "callout" as const,
      label: "Consejo del concierge",
      title: "Reservá temprano los fines de semana",
      text: "Las parrillas más buscadas se llenan a partir de las 21 h. Pedile a recepción que reserve por vos.",
    },
  ],
  layout: {
    sidebar: true,
    sidebarCta: true,
    sidebarCtaTitle: "Viví Buenos Aires desde adentro",
    sidebarCtaText: "Recorridos gastronómicos a medida para huéspedes del hotel.",
    sidebarCtaButton: "Consultar ahora",
    related: true,
    newsletter: true,
    moreArticles: true,
  },
  status: "published" as const,
  updatedAt: "2026-06-18T16:42:00.000Z",
};

// Editor unificado del artículo — pantalla completa (paleta + lienzo + ajustes).
// Renderiza un overlay full-screen vía portal; el contenedor solo aporta tamaño.
export const Editor = () => (
  <div style={{ position: "relative", width: 1240, height: 780 }}>
    <ArticleEditorView
      article={ARTICLE}
      contextLabel="hoteldiplomatic.com"
      onPatch={noop}
      onPublish={noop}
      onUnpublish={noop}
      onClose={noop}
    />
  </div>
);
