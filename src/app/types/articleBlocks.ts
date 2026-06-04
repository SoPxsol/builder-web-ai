/**
 * Modelo de BLOQUES del cuerpo de un artículo.
 *
 * El cuerpo de un artículo dejó de ser un único string de texto: ahora es una
 * lista ordenada de bloques tipados que el hotelero arma arrastrando
 * componentes desde la paleta del editor (ver ArticleEditorView / BlockCanvas).
 *
 * Cada bloque es un objeto con `id` (estable, para DnD y React keys) y `type`
 * discriminante. La data específica de cada tipo vive en el mismo objeto.
 *
 * El "chrome" del artículo (columna derecha sticky, sección "Más artículos",
 * newsletter, tags + compartir) NO son bloques del cuerpo: son parte de la
 * plantilla del artículo y se controlan con toggles (ver ArticleLayout). Eso
 * mantiene la paleta enfocada en CONTENIDO y evita que el hotelero pueda
 * "romper" la estructura fija del template.
 */

import {
  Heading2,
  Pilcrow,
  List as ListIcon,
  Quote,
  Image as ImageIcon,
  Images,
  Video,
  HelpCircle,
  Lightbulb,
  Table2,
  MousePointerClick,
  RectangleHorizontal,
  Minus,
  Tags as TagsIcon,
  Share2,
  type LucideIcon,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════════════
 * Tipos de bloque
 * ════════════════════════════════════════════════════════════════════════ */

export type BlockType =
  | "heading"
  | "paragraph"
  | "list"
  | "quote"
  | "image"
  | "gallery"
  | "video"
  | "callout"
  | "databox"
  | "faq"
  | "cta"
  | "button"
  | "divider"
  | "tags"
  | "share";

interface BlockBase {
  id: string;
}

export type TextAlign = "left" | "center";

export interface HeadingBlock extends BlockBase {
  type: "heading";
  level: 2 | 3;
  text: string;
  /** Numeración automática estilo "1. …", "2. …" (como en el ejemplo). */
  numbered: boolean;
  align?: TextAlign;
}
export interface ParagraphBlock extends BlockBase {
  type: "paragraph";
  text: string;
  align?: TextAlign;
  /** Estilo de texto: normal, destacado (lead) o pequeño. */
  variant?: "normal" | "lead" | "small";
}
export interface ListBlock extends BlockBase {
  type: "list";
  ordered: boolean;
  items: string[];
}
export interface QuoteBlock extends BlockBase {
  type: "quote";
  text: string;
  author: string;
}
export interface ImageBlock extends BlockBase {
  type: "image";
  url: string;
  caption: string;
  alt: string;
}
export interface GalleryBlock extends BlockBase {
  type: "gallery";
  images: { id: string; url: string; caption: string }[];
}
export interface VideoBlock extends BlockBase {
  type: "video";
  /** URL de YouTube/Vimeo o archivo. En el prototipo solo se previsualiza. */
  url: string;
  caption: string;
}
export interface CalloutBlock extends BlockBase {
  type: "callout";
  /** Rótulo superior (ej. "Consejo del concierge"). */
  label: string;
  title: string;
  text: string;
  /** Color de fondo (hex). Si falta, usa el oscuro del tema. */
  bg?: string;
}
export interface DataBoxBlock extends BlockBase {
  type: "databox";
  title: string;
  rows: { id: string; label: string; value: string }[];
}
export interface FaqBlock extends BlockBase {
  type: "faq";
  title: string;
  items: { id: string; q: string; a: string }[];
}
export interface CtaBlock extends BlockBase {
  type: "cta";
  title: string;
  text: string;
  button: string;
  /** Color de fondo (hex). Si falta, usa el oscuro del tema. */
  bg?: string;
}
export interface ButtonBlock extends BlockBase {
  type: "button";
  label: string;
  href: string;
  align: "left" | "center" | "right";
}
export interface DividerBlock extends BlockBase {
  type: "divider";
}
export interface TagsBlock extends BlockBase {
  type: "tags";
  tags: string[];
}
export interface ShareBlock extends BlockBase {
  type: "share";
}

export type ArticleBlock =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | QuoteBlock
  | ImageBlock
  | GalleryBlock
  | VideoBlock
  | CalloutBlock
  | DataBoxBlock
  | FaqBlock
  | CtaBlock
  | ButtonBlock
  | DividerBlock
  | TagsBlock
  | ShareBlock;

/* ════════════════════════════════════════════════════════════════════════
 * Chrome / plantilla del artículo (no son bloques del cuerpo)
 * ════════════════════════════════════════════════════════════════════════ */

export interface ArticleLayout {
  /** Columna derecha sticky. */
  sidebar: boolean;
  /** Tarjeta CTA dentro de la columna derecha (ej. "Viví Mendoza desde adentro"). */
  sidebarCta: boolean;
  sidebarCtaTitle: string;
  sidebarCtaText: string;
  sidebarCtaButton: string;
  /** Lista "También te puede interesar" en la columna derecha. */
  related: boolean;
  /** Bloque de suscripción al newsletter en la columna derecha. */
  newsletter: boolean;
  /** Grilla "Más artículos para vos" al pie del artículo. */
  moreArticles: boolean;
}

export const DEFAULT_LAYOUT: ArticleLayout = {
  sidebar: true,
  sidebarCta: true,
  sidebarCtaTitle: "Viví la experiencia desde adentro",
  sidebarCtaText:
    "Nuestro equipo diseña experiencias personalizadas para huéspedes del hotel.",
  sidebarCtaButton: "Consultar ahora",
  related: true,
  newsletter: true,
  moreArticles: true,
};

/* ════════════════════════════════════════════════════════════════════════
 * IDs
 * ════════════════════════════════════════════════════════════════════════ */

let _seq = 0;
/** ID estable para bloques nuevos (suficiente para el prototipo client-side). */
export function newBlockId(): string {
  _seq += 1;
  return `blk-${Date.now().toString(36)}-${_seq}`;
}

/* ════════════════════════════════════════════════════════════════════════
 * Factory — bloque por defecto según tipo
 * ════════════════════════════════════════════════════════════════════════ */

const DEMO_IMG =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=70&w=1200";

export function createBlock(type: BlockType): ArticleBlock {
  const id = newBlockId();
  switch (type) {
    case "heading":
      return { id, type, level: 2, text: "", numbered: false };
    case "paragraph":
      return { id, type, text: "" };
    case "list":
      return { id, type, ordered: false, items: ["", ""] };
    case "quote":
      return { id, type, text: "", author: "" };
    case "image":
      return { id, type, url: "", caption: "", alt: "" };
    case "gallery":
      return {
        id,
        type,
        images: [
          { id: newBlockId(), url: "", caption: "" },
          { id: newBlockId(), url: "", caption: "" },
        ],
      };
    case "video":
      return { id, type, url: "", caption: "" };
    case "callout":
      return {
        id,
        type,
        label: "Consejo del concierge",
        title: "",
        text: "",
      };
    case "databox":
      return {
        id,
        type,
        title: "Datos útiles",
        rows: [
          { id: newBlockId(), label: "", value: "" },
          { id: newBlockId(), label: "", value: "" },
        ],
      };
    case "faq":
      return {
        id,
        type,
        title: "Preguntas frecuentes",
        items: [
          { id: newBlockId(), q: "", a: "" },
          { id: newBlockId(), q: "", a: "" },
        ],
      };
    case "cta":
      return {
        id,
        type,
        title: "Reservá directo y pagá menos",
        text: "Mejor precio garantizado y atención personalizada al reservar en nuestro sitio.",
        button: "Reservar ahora",
      };
    case "button":
      return { id, type, label: "Reservar ahora", href: "", align: "left" };
    case "divider":
      return { id, type };
    case "tags":
      return { id, type, tags: [] };
    case "share":
      return { id, type };
  }
}

/* ════════════════════════════════════════════════════════════════════════
 * Catálogo de la paleta (agrupado)
 * ════════════════════════════════════════════════════════════════════════ */

export interface BlockDef {
  type: BlockType;
  name: string;
  description: string;
  Icon: LucideIcon;
}

export interface BlockGroup {
  id: string;
  label: string;
  blocks: BlockDef[];
}

export const BLOCK_GROUPS: BlockGroup[] = [
  {
    id: "text",
    label: "Texto",
    blocks: [
      { type: "heading", name: "Encabezado", description: "Título de sección (H2 / H3)", Icon: Heading2 },
      { type: "paragraph", name: "Párrafo", description: "Bloque de texto corrido", Icon: Pilcrow },
      { type: "list", name: "Lista", description: "Viñetas o numerada", Icon: ListIcon },
      { type: "quote", name: "Cita", description: "Frase destacada con autor", Icon: Quote },
    ],
  },
  {
    id: "media",
    label: "Media",
    blocks: [
      { type: "image", name: "Imagen", description: "Foto con epígrafe", Icon: ImageIcon },
      { type: "gallery", name: "Galería", description: "Varias imágenes en grilla", Icon: Images },
      { type: "video", name: "Video", description: "Embed de YouTube o Vimeo", Icon: Video },
    ],
  },
  {
    id: "highlight",
    label: "Destacados",
    blocks: [
      { type: "callout", name: "Consejo", description: "Caja destacada del concierge", Icon: Lightbulb },
      { type: "databox", name: "Caja de datos", description: "Pares de dato y valor", Icon: Table2 },
      { type: "faq", name: "Preguntas frecuentes", description: "Acordeón de preguntas y respuestas", Icon: HelpCircle },
      { type: "cta", name: "Llamada a la acción", description: "Bloque con título, texto y botón", Icon: MousePointerClick },
    ],
  },
  {
    id: "structure",
    label: "Estructura",
    blocks: [
      { type: "button", name: "Botón", description: "Botón de reserva o enlace", Icon: RectangleHorizontal },
      { type: "divider", name: "Separador", description: "Línea divisoria", Icon: Minus },
      { type: "tags", name: "Etiquetas", description: "Chips de temas del artículo", Icon: TagsIcon },
      { type: "share", name: "Compartir", description: "Barra de redes sociales", Icon: Share2 },
    ],
  },
];

/** Lookup type → def (para íconos y labels en el canvas). */
export const BLOCK_DEF_BY_TYPE: Record<BlockType, BlockDef> = BLOCK_GROUPS.reduce(
  (acc, g) => {
    for (const b of g.blocks) acc[b.type] = b;
    return acc;
  },
  {} as Record<BlockType, BlockDef>,
);

/** MIME types para el drag-and-drop (consistentes con el builder). */
export const MIME_BLOCK_TYPE = "application/x-article-block-type";
export const MIME_BLOCK_ID = "application/x-article-block-id";

/* ════════════════════════════════════════════════════════════════════════
 * Estilo por bloque — color de fondo + contraste automático
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * Paleta de fondos sugeridos para bloques destacados (CTA, Consejo).
 * `value: undefined` = usar el default del tema (oscuro). El resto se acomoda
 * automáticamente: el texto y el botón eligen su color según el contraste.
 */
export const BLOCK_BG_PRESETS: { label: string; value: string | undefined }[] = [
  { label: "Por defecto", value: undefined },
  { label: "Oscuro", value: "#1c1a17" },
  { label: "Crema", value: "#efe9dc" },
  { label: "Arena", value: "#d8cdb5" },
  { label: "Dorado", value: "#9a8a5f" },
  { label: "Verde", value: "#2e3d34" },
  { label: "Blanco", value: "#ffffff" },
];

/**
 * Devuelve un color de texto legible (claro u oscuro) sobre el fondo dado,
 * usando luminancia relativa. Permite que al cambiar el fondo de un CTA, el
 * texto y el botón se acomoden solos (y viceversa).
 */
export function readableInk(hex: string): string {
  const c = hex.replace("#", "");
  const full = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  // luminancia perceptual (sRGB aproximado)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#1c1a17" : "#ffffff";
}

/* ════════════════════════════════════════════════════════════════════════
 * Migración desde el cuerpo plano (body string → bloques)
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * Convierte un `body` de texto plano (modelo viejo) en bloques de párrafo,
 * separando por líneas en blanco. Se usa una sola vez al abrir un artículo que
 * todavía no tiene `blocks`.
 */
export function bodyToBlocks(body: string): ArticleBlock[] {
  const text = body.trim();
  if (!text) return [{ ...createBlock("paragraph") }];
  return text
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => ({ id: newBlockId(), type: "paragraph" as const, text: chunk }));
}

/** Resumen de texto plano de los bloques (para excerpt/SEO/migración inversa). */
export function blocksToPlainText(blocks: ArticleBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "heading":
          return b.text;
        case "paragraph":
          return b.text;
        case "list":
          return b.items.filter(Boolean).join("\n");
        case "quote":
          return b.author ? `"${b.text}" — ${b.author}` : b.text;
        case "callout":
          return [b.label, b.title, b.text].filter(Boolean).join(" · ");
        case "databox":
          return b.rows.map((r) => `${r.label}: ${r.value}`).join("\n");
        case "faq":
          return [b.title, ...b.items.map((it) => `${it.q} ${it.a}`)].filter(Boolean).join("\n");
        case "cta":
          return [b.title, b.text].filter(Boolean).join(" ");
        case "button":
          return b.label;
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}
