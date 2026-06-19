import { ArticlePreviewFull } from "@figma/my-make-file";

/* Artículo de hotel realista (mock inline, forma BlogArticle + ArticleBlock). */
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
  status: "published" as const,
  updatedAt: "2026-06-18T16:42:00.000Z",
};

const BLOCKS = [
  {
    id: "p1",
    type: "paragraph" as const,
    variant: "lead" as const,
    text: "Buenos Aires se come caminando. Reunimos las mesas favoritas de nuestro equipo, todas a menos de quince minutos del hotel, para que cada noche tengas un plan distinto.",
  },
  { id: "h1", type: "heading" as const, level: 2 as const, text: "Parrillas de barrio", numbered: true },
  {
    id: "p2",
    type: "paragraph" as const,
    text: "La parrilla porteña no es solo asado: es un ritual. Buscá las que tienen brasas a la vista y mozos de toda la vida; ahí está el verdadero secreto del punto de la carne.",
  },
  {
    id: "img1",
    type: "image" as const,
    url: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=70&w=1200",
    caption: "Una parrilla clásica de Palermo Viejo al caer la tarde.",
    alt: "Parrilla con cortes de carne sobre las brasas",
  },
  {
    id: "call1",
    type: "callout" as const,
    label: "Consejo del concierge",
    title: "Reservá temprano los fines de semana",
    text: "Las parrillas más buscadas se llenan a partir de las 21 h. Pedile a recepción que reserve por vos: tenemos línea directa con varias.",
  },
  { id: "h2", type: "heading" as const, level: 2 as const, text: "Cafés notables", numbered: true },
  {
    id: "p3",
    type: "paragraph" as const,
    text: "Los Cafés Notables son patrimonio de la ciudad: boiserie, mármol y un cortado que se toma sin apuro. Ideales para una pausa entre museos.",
  },
  {
    id: "data1",
    type: "databox" as const,
    title: "Datos útiles",
    rows: [
      { id: "r1", label: "Distancia media", value: "8 cuadras" },
      { id: "r2", label: "Rango de precio", value: "$$ – $$$" },
      { id: "r3", label: "Mejor horario", value: "20:30 – 23:00" },
    ],
  },
  {
    id: "q1",
    type: "quote" as const,
    text: "En Buenos Aires no se cena: se celebra que terminó el día.",
    author: "Equipo de concierge del hotel",
  },
  {
    id: "cta1",
    type: "cta" as const,
    title: "¿Querés una reserva personalizada?",
    text: "Contanos qué te gusta y armamos tu recorrido gastronómico para toda la estadía.",
    button: "Hablar con el concierge",
  },
  { id: "tags1", type: "tags" as const, tags: ["Gastronomía", "Buenos Aires", "Parrillas", "Cafés"] },
  { id: "share1", type: "share" as const },
];

const LAYOUT = {
  sidebar: true,
  sidebarCta: true,
  sidebarCtaTitle: "Viví Buenos Aires desde adentro",
  sidebarCtaText: "Nuestro equipo diseña recorridos gastronómicos a medida para huéspedes del hotel.",
  sidebarCtaButton: "Consultar ahora",
  related: true,
  newsletter: true,
  moreArticles: true,
};

// Vista previa fiel del artículo publicado — hero + cuerpo por bloques + sidebar.
export const Completa = () => (
  <div style={{ width: 1100, height: 760, overflow: "auto", background: "#fff" }}>
    <ArticlePreviewFull article={ARTICLE} blocks={BLOCKS} layout={LAYOUT} />
  </div>
);

// Sin chrome lateral — el cuerpo ocupa todo el ancho (layout minimal).
export const SinSidebar = () => (
  <div style={{ width: 1100, height: 760, overflow: "auto", background: "#fff" }}>
    <ArticlePreviewFull
      article={ARTICLE}
      blocks={BLOCKS}
      layout={{ ...LAYOUT, sidebar: false, moreArticles: false }}
    />
  </div>
);
