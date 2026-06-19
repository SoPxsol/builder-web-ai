import { BlockCanvas } from "@figma/my-make-file";

const noop = () => {};

/* Bloques de un artículo de hotel en edición (forma ArticleBlock). */
const BLOCKS = [
  {
    id: "h1",
    type: "heading" as const,
    level: 2 as const,
    text: "Parrillas de barrio",
    numbered: true,
  },
  {
    id: "p1",
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
  {
    id: "list1",
    type: "list" as const,
    ordered: false,
    items: ["Don Julio — Palermo", "El Preferido de Palermo", "La Brigada — San Telmo"],
  },
];

// Lienzo central del editor con varios bloques y reordenado por drag activo.
export const Canvas = () => (
  <div style={{ width: 720, height: 640, overflow: "auto", background: "var(--surface-page)", padding: 24 }}>
    <BlockCanvas blocks={BLOCKS} onChange={noop} dragEnabled={true} />
  </div>
);

// Mobile: drag desactivado (el reordenado fino se hace con los botones de la toolbar).
export const Mobile = () => (
  <div style={{ width: 380, height: 640, overflow: "auto", background: "var(--surface-page)", padding: 12 }}>
    <BlockCanvas blocks={BLOCKS} onChange={noop} dragEnabled={false} />
  </div>
);
