/**
 * Modelo de contenido del Blog.
 *
 * Regla base (ver brief "Editor de blog"): un artículo es su PROPIO tipo de
 * contenido, distinto de una página. Se crea, edita, lista y borra únicamente
 * desde Blog y nunca aparece en la sección "Páginas".
 *
 * Single source of truth: un solo objeto `BlogArticle`, gestionado en App y
 * compartido entre el listado (BlogView) y el editor unificado
 * (ArticleEditorView). No hay copia paralela en "Páginas".
 */

import type { ArticleBlock, ArticleLayout } from "./articleBlocks";
import { DEFAULT_LAYOUT, newBlockId } from "./articleBlocks";

/** Estado de publicación. Borrador y publicar son acciones separadas. */
export type ArticleStatus = "draft" | "published";

/**
 * Snapshot de una versión del artículo. Se crea al publicar/actualizar y
 * permite restaurar el estado anterior desde el historial.
 */
export interface ArticleVersion {
  id: string;
  /** ISO timestamp del guardado de la versión. */
  savedAt: string;
  /** Etiqueta legible: "Publicación", "Actualización", etc. */
  label: string;
  snapshot: {
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    coverImageUrl: string;
    blocks: ArticleBlock[];
    layout: ArticleLayout;
  };
}

/**
 * Estado transitorio de la fila en el listado mientras se persiste la creación
 * optimista. `undefined` = fila asentada (creación confirmada por el backend
 * mockeado).
 *   - "saving" : optimistic update en curso (skeleton / "Guardando…").
 *   - "error"  : el guardado falló, la fila ofrece "Reintentar".
 */
export type ArticleCreationState = "saving" | "error" | undefined;

export interface BlogArticle {
  /** Tipado explícito: nace y vive como artículo, anclado a Blog. */
  readonly kind: "articulo";
  id: string;
  title: string;
  /** Slug autogenerado desde el título, editable. Sin el prefijo /blog/. */
  slug: string;
  category: string;
  /** Descripción corta — SEO + card del listado. Límite recomendado 160. */
  excerpt: string;
  coverImageUrl: string;
  /**
   * Cuerpo del artículo como texto plano (modelo legacy). Se conserva por
   * compatibilidad y como espejo plano de `blocks` para SEO/migración. El
   * editor real trabaja sobre `blocks`.
   */
  body: string;
  /**
   * Cuerpo por bloques — fuente de verdad del editor. Si falta (artículo
   * legacy), el editor lo deriva de `body` vía bodyToBlocks().
   */
  blocks?: ArticleBlock[];
  /** Plantilla / chrome del artículo (columna sticky, related, etc.). */
  layout?: ArticleLayout;
  /** Historial de versiones (se agrega una al publicar/actualizar). */
  versions?: ArticleVersion[];
  status: ArticleStatus;
  /** Estado de la creación optimista; ver ArticleCreationState. */
  creation?: ArticleCreationState;
  /** ISO timestamp del último guardado. Alimenta "Guardado hace X". */
  updatedAt: string;
}

/** Límite de caracteres de la descripción corta (SEO meta description). */
export const EXCERPT_LIMIT = 160;

/** Categorías disponibles para los artículos del blog. */
export const ARTICLE_CATEGORIES = [
  "Experiencias",
  "Gastronomía",
  "Eventos",
  "Novedades",
  "Tips de viaje",
  "Cultura local",
] as const;

/** Prefijo de URL mostrado antes del slug en el editor. */
export const BLOG_URL_PREFIX = "/blog/";

/**
 * Genera un slug URL-safe desde un texto libre.
 * Quita acentos, pasa a minúsculas, colapsa espacios en guiones y descarta
 * cualquier carácter que no sea [a-z0-9-].
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita diacríticos (á → a)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Crea un artículo nuevo en borrador a partir de un título. */
export function makeArticle(id: string, title: string, now: string): BlogArticle {
  const clean = title.trim();
  return {
    kind: "articulo",
    id,
    title: clean,
    slug: slugify(clean),
    category: "",
    excerpt: "",
    coverImageUrl: "",
    body: "",
    blocks: [{ id: newBlockId(), type: "paragraph", text: "" }],
    layout: { ...DEFAULT_LAYOUT },
    status: "draft",
    creation: "saving",
    updatedAt: now,
  };
}

/** Seed inicial del prototipo. Mezcla publicados y borradores ya asentados. */
export const INITIAL_ARTICLES: BlogArticle[] = [
  {
    kind: "articulo",
    id: "art-seed-1",
    title: "5 razones para reservar directo con nosotros",
    slug: "5-razones-para-reservar-directo",
    category: "Novedades",
    excerpt:
      "Mejor precio garantizado, upgrades sin costo y atención personalizada: por qué reservar en nuestro sitio conviene más que en las OTAs.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=70&w=1200",
    body: "Reservar directo con el hotel tiene ventajas concretas que las plataformas de terceros no pueden igualar…",
    blocks: [
      {
        id: "b1-1",
        type: "paragraph",
        text: "Reservar directo con el hotel tiene ventajas concretas que las plataformas de terceros no pueden igualar. Repasamos las cinco más importantes para que tu próxima estadía empiece de la mejor manera.",
      },
      { id: "b1-2", type: "heading", level: 2, text: "Mejor precio garantizado", numbered: true },
      {
        id: "b1-3",
        type: "paragraph",
        text: "Cuando reservás en nuestro sitio oficial accedés siempre a la mejor tarifa disponible, sin comisiones de intermediarios. Si encontrás un precio más bajo, lo igualamos.",
      },
      {
        id: "b1-4",
        type: "callout",
        label: "Consejo del concierge",
        title: "Reservá con anticipación",
        text: "Las mejores habitaciones se agotan primero. Reservar con tiempo te asegura el cuarto que querés al mejor precio.",
      },
      { id: "b1-5", type: "heading", level: 2, text: "Upgrades sin costo", numbered: true },
      {
        id: "b1-6",
        type: "paragraph",
        text: "Los huéspedes que reservan directo entran a nuestro programa de cortesías: según disponibilidad, mejoramos tu categoría de habitación sin cargo.",
      },
      {
        id: "b1-7",
        type: "tags",
        tags: ["Reservas", "Beneficios", "Tarifas", "Programa de huéspedes"],
      },
      { id: "b1-8", type: "share" },
    ],
    layout: { ...DEFAULT_LAYOUT },
    status: "published",
    updatedAt: "2026-05-28T10:00:00.000Z",
  },
  {
    kind: "articulo",
    id: "art-seed-2",
    title: "Qué hacer en Playa del Carmen en temporada alta",
    slug: "que-hacer-playa-del-carmen-temporada-alta",
    category: "Experiencias",
    excerpt:
      "Guía rápida de cenotes, playas y gastronomía para aprovechar al máximo tu estadía cuando la ciudad está en su punto más vibrante.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?auto=format&fit=crop&q=70&w=1200",
    body: "La temporada alta llena de vida a Playa del Carmen. Estos son nuestros lugares favoritos…",
    status: "published",
    updatedAt: "2026-05-20T15:30:00.000Z",
  },
  {
    kind: "articulo",
    id: "art-seed-3",
    title: "Menú de otoño en el restaurante",
    slug: "menu-de-otono-restaurante",
    category: "Gastronomía",
    excerpt: "",
    coverImageUrl: "",
    body: "",
    status: "draft",
    updatedAt: "2026-05-15T09:00:00.000Z",
  },
];
