/**
 * social-demo.ts — data hardcodeada de demo para el Gestor de Redes Sociales.
 * Hotel Azul Marino, Cartagena de Indias.
 * Portada desde pxsol-mkt-qa/src/data/hotel.js — sin cambios de fondo,
 * solo renombrado/tipado para el entorno TypeScript del Builder.
 *
 * NOTA: imágenes vía Unsplash CDN. En producción estas vendrían del
 * asset store del cliente (Nexus / CMS media library).
 */

const u = (id: string, w = 1200): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const hotelImages = {
  hero:       u("photo-1571896349842-33c89424de2d", 1600),
  exterior:   u("photo-1566073771259-6a8506099945", 1400),
  pool:       u("photo-1540541338287-41700207dee6", 1200),
  terrace:    u("photo-1582719478250-c89cae4dc85b", 1200),
  restaurant: u("photo-1414235077428-338989a2e8c0", 1200),
  detail:     u("photo-1578683010236-d716f9a3f461", 1000),
  bar:        u("photo-1551918120-9739cb430c6d", 1200),
  spa:        u("photo-1540555700478-4be289fbecef", 1200),
  beach:      u("photo-1507525428034-b723cf961d3e", 1400),
  facade:     u("photo-1568084680786-a84f91d1153c", 1200),
  room1:      u("photo-1631049307264-da0ec9d70304", 1200),
  room2:      u("photo-1611892440504-42a792e24d32", 1200),
  room3:      u("photo-1590490360182-c33d57733427", 1200),
};

/**
 * Capa de tinte (scrim) sobre la imagen del lienzo — resuelve legibilidad del
 * texto superpuesto. Independiente de "aplicar marca": el toggle de marca solo
 * decide el color (marca vs. neutro), pero la capa siempre está disponible.
 */
export interface ScrimConfig {
  enabled: boolean;
  /** Hex. Con marca aplicada = color de marca del sitio; si no, negro neutro. */
  color: string;
  /** 0..100 */
  opacity: number;
  /** "flat" = tinte parejo; "gradient" = degradé desde abajo. */
  type: "flat" | "gradient";
}

export const DEFAULT_SCRIM: ScrimConfig = {
  enabled: true,
  color: "#000000",
  opacity: 55,
  type: "gradient",
};

/**
 * Posiciones predefinidas tipo "slot" para elementos superpuestos a la imagen
 * (Etiqueta, y luego Logo/CTA). A propósito NO es posición libre (x/y) — el
 * hotelero elige de un set cerrado vía mini-grid visual, nunca el pixel exacto.
 * Genérico: lo reusan todos los elementos que se ubican sobre el lienzo.
 */
export type ElementPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

export const ELEMENT_POSITIONS: { id: ElementPosition; label: string }[] = [
  { id: "top-left", label: "Arriba izquierda" },
  { id: "top-right", label: "Arriba derecha" },
  { id: "center", label: "Centro" },
  { id: "bottom-left", label: "Abajo izquierda" },
  { id: "bottom-right", label: "Abajo derecha" },
];

/**
 * Etiqueta (oferta) — primer elemento "slot" real del editor. Logo y CTA van
 * a seguir el mismo patrón (enabled/position + su propio contenido).
 */
export interface TagElement {
  enabled: boolean;
  /** Ej: "20% OFF", "Nueva suite". */
  text: string;
  /** solid = fondo de marca; outline = chip transparente con borde. */
  style: "solid" | "outline";
  position: ElementPosition;
}

export const DEFAULT_TAG: TagElement = {
  enabled: false,
  text: "20% OFF",
  style: "solid",
  // "top-left": no compite con el overlay de título/subtítulo, que vive abajo.
  position: "top-left",
};

/**
 * Logo — origen "Marca del sitio", NO se sube ad-hoc en este editor. En este
 * demo lo tomamos de un mock (no hay draftStore/NavConfig conectado al módulo
 * de Redes Sociales); en producción sale del logo de marca configurado en el
 * header del sitio (ver `LogoConfig`/`NavConfig` en `src/app/types/builder.ts`).
 * Si el sitio no tuviera logo cargado, `SITE_LOGO_URL` sería `null` y el
 * toggle de la card queda disabled (ver `LogoCard` en SocialEditorView).
 */
export const SITE_LOGO_URL: string | null = u("photo-1578683010236-d716f9a3f461", 200);

export interface LogoElement {
  enabled: boolean;
  position: ElementPosition;
  /** sm = discreto (default); md = más presencia, sin tapar la foto. */
  size: "sm" | "md";
}

export const DEFAULT_LOGO: LogoElement = {
  enabled: false,
  // "top-right": no compite con el overlay de título/subtítulo, que vive abajo.
  position: "top-right",
  size: "sm",
};

/**
 * CTA — solo visual/persuasivo dentro de la pieza (ej. "Reservá ahora"). v1 NO
 * lleva URL/tracking: el link real vive en la bio del perfil de la red social.
 */
export type CtaStyle = "button" | "text-link";
/** El CTA no ofrece posiciones "top-*": no es su lugar semántico. */
export type CtaPosition = "bottom-left" | "bottom-right" | "center";

export interface CtaElement {
  enabled: boolean;
  label: string;
  style: CtaStyle;
  position: CtaPosition;
}

/** Slots habilitados para el CTA — subconjunto de ELEMENT_POSITIONS. */
export const CTA_POSITIONS: { id: CtaPosition; label: string }[] = ELEMENT_POSITIONS.filter(
  (p): p is { id: CtaPosition; label: string } => p.id === "bottom-left" || p.id === "bottom-right" || p.id === "center",
);

export const DEFAULT_CTA: CtaElement = {
  enabled: false,
  label: "Reservá ahora",
  style: "button",
  position: "bottom-right",
};

export interface SocialPost {
  type: string;
  size: string;
  image: string;
  overlay: string;
  sub: string;
  /** Epígrafe del posteo (va debajo de la imagen al publicar). Solo Post, no Historia. */
  caption?: string;
  /** Ej: "#hotel #cartagena". */
  hashtags?: string;
  /** Si el editor aplicó la marca del hotel sobre la pieza (define el color del scrim). */
  brandApplied?: boolean;
  /** Capa de tinte sobre la imagen. Opcional/retrocompatible — si falta, se usa DEFAULT_SCRIM. */
  scrim?: ScrimConfig;
  /** Etiqueta (oferta) sobre el lienzo. Opcional/retrocompatible — si falta, se usa DEFAULT_TAG (enabled: false). */
  tag?: TagElement;
  /** Logo de marca del sitio sobre el lienzo. Opcional/retrocompatible — si falta, se usa DEFAULT_LOGO (enabled: false). */
  logo?: LogoElement;
  /** CTA visual (sin URL/tracking) sobre el lienzo. Opcional/retrocompatible — si falta, se usa DEFAULT_CTA (enabled: false). */
  cta?: CtaElement;
  status?: "draft" | "published" | "scheduled";
  /** ISO, presente cuando status === "scheduled". */
  scheduledAt?: string;
}

const igPosts: SocialPost[] = [
  { type: "Post",       size: "1080×1080", image: hotelImages.pool,       overlay: "Mañanas que no se apuran.",          sub: "Hotel Azul Marino · Cartagena" },
  { type: "Post",       size: "1080×1080", image: hotelImages.terrace,    overlay: "Terraza propia. Cielo prestado.",     sub: "Suite Master" },
  { type: "Post",       size: "1080×1080", image: hotelImages.restaurant, overlay: "La cena de hoy:",                    sub: "Pargo, plátano maduro, ají dulce." },
  { type: "Post",       size: "1080×1080", image: hotelImages.detail,     overlay: "Cada detalle, elegido a mano.",       sub: "Diseño de autor" },
  { type: "Story",      size: "1080×1920", image: hotelImages.beach,      overlay: "A 40 pasos del mar.",                 sub: "Deslizá ↑" },
  { type: "Story",      size: "1080×1920", image: hotelImages.bar,        overlay: "Happy hour, 6 a 8 PM",               sub: "Bar de la terraza" },
  { type: "Story",      size: "1080×1920", image: hotelImages.spa,        overlay: "Reservá tu masaje",                  sub: "Spa Azul" },
  { type: "Reel cover", size: "1080×1920", image: hotelImages.facade,     overlay: "Un día en Azul Marino",              sub: "▶ 0:47" },
  { type: "Reel cover", size: "1080×1920", image: hotelImages.pool,       overlay: "¿Y si te tomás 3 días?",             sub: "▶ 0:30" },
  { type: "Ad banner",  size: "1080×1350", image: hotelImages.hero,       overlay: "Verano 2026 — 15% off",              sub: "Reservá antes del 30/06" },
];

const fbPosts: SocialPost[] = [
  { type: "Post",         size: "1200×630",  image: hotelImages.hero,       overlay: "Tu próximo fin de semana, en Cartagena.", sub: "Hotel Azul Marino · Reservas abiertas" },
  { type: "Post",         size: "1200×630",  image: hotelImages.restaurant, overlay: "Gastronomía local, con vista al Caribe.",  sub: "Restaurante Azul" },
  { type: "Post",         size: "1200×630",  image: hotelImages.terrace,    overlay: "Suite Master — terraza privada con jacuzzi.", sub: "Desde USD 480 / noche" },
  { type: "Event cover",  size: "1920×1080", image: hotelImages.bar,        overlay: "Cena maridada — 14 de julio",              sub: "Cupos limitados" },
  { type: "Event cover",  size: "1920×1080", image: hotelImages.spa,        overlay: "Semana de bienestar — agosto",             sub: "Yoga, spa y silencio" },
  { type: "Page banner",  size: "1640×624",  image: hotelImages.beach,      overlay: "Hotel Azul Marino",                       sub: "Cartagena de Indias" },
  { type: "Ad creative",  size: "1200×1200", image: hotelImages.pool,       overlay: "Última oportunidad — junio",               sub: "20% off · Reservá ahora" },
];

const ttPosts: SocialPost[] = [
  { type: "Video thumb",    size: "1080×1920", image: hotelImages.pool,    overlay: "POV: te despertaste en Cartagena",    sub: "▶ 0:22" },
  { type: "Video thumb",    size: "1080×1920", image: hotelImages.restaurant, overlay: "Probamos los 7 pasos",             sub: "▶ 0:38" },
  { type: "Profile banner", size: "1080×1080", image: hotelImages.facade,  overlay: "@hotelazulmarino",                    sub: "Cartagena de Indias 🌊" },
];

export const socialPosts: Record<string, SocialPost[]> = {
  Instagram: igPosts,
  Facebook:  fbPosts,
  TikTok:    ttPosts,
};

/**
 * Label en español de cada `type` interno — el id (`post.type`) queda en
 * inglés porque de él depende lógica existente (`isStory`, filtros del
 * phone preview, formato de la pieza); lo que ve el hotelero se traduce acá.
 * WEB-737 Tier 2 (T2.3/T2.4): "Story"/"Historia" se unifican a "Historia" en
 * todo el copy visible.
 */
export const POST_TYPE_LABEL: Record<string, string> = {
  "Post":           "Post",
  "Story":          "Historia",
  "Historia":       "Historia",
  "Reel cover":     "Portada de reel",
  "Ad banner":      "Anuncio",
  "Ad creative":    "Anuncio",
  "Event cover":    "Portada de evento",
  "Page banner":    "Portada de página",
  "Profile banner": "Portada de perfil",
  "Video thumb":    "Miniatura de video",
};

/** Traduce un `type` interno a su label visible; si no está mapeado, lo devuelve tal cual. */
export function postTypeLabel(type: string): string {
  return POST_TYPE_LABEL[type] ?? type;
}

/**
 * Intención de comunicación — reemplaza al viejo `campaignOptions` (lista fija
 * de strings decorativos). El hotelero elige QUÉ quiere comunicar mediante
 * cards guiadas + una opción de texto libre ("custom"), y ese brief real
 * alimenta la generación de piezas (ver CampaignBrief más abajo).
 */
export type IntentId =
  | "promo"
  | "new-room"
  | "gastronomy"
  | "event"
  | "season"
  | "wellness"
  | "custom";

export interface IntentOption {
  id: IntentId;
  /** Label corto para la card. */
  label: string;
  /** Placeholder contextual del campo "Dato clave" — solo intents guiados (no custom). */
  keyDataPlaceholder?: string;
  /** Placeholder contextual del campo "Detalle" — solo intents guiados (no custom). */
  detailPlaceholder?: string;
}

export const INTENT_OPTIONS: IntentOption[] = [
  {
    id: "promo",
    label: "Promo/Oferta",
    detailPlaceholder: "Ej: Descuento por reserva anticipada",
    keyDataPlaceholder: "Ej: 20% off hasta el 30/06",
  },
  {
    id: "new-room",
    label: "Nueva habitación",
    detailPlaceholder: "Ej: Suite Master con terraza y jacuzzi",
    keyDataPlaceholder: "Ej: Disponible desde agosto",
  },
  {
    id: "gastronomy",
    label: "Gastronomía",
    detailPlaceholder: "Ej: Nuevo menú de temporada",
    keyDataPlaceholder: "Ej: Todos los días desde las 19h",
  },
  {
    id: "event",
    label: "Evento",
    detailPlaceholder: "Ej: Cena maridada con vinos locales",
    keyDataPlaceholder: "Ej: 14 de julio, cupos limitados",
  },
  {
    id: "season",
    label: "Temporada",
    detailPlaceholder: "Ej: Verano 2026 en Cartagena",
    keyDataPlaceholder: "Ej: Válido hasta el 15/09",
  },
  {
    id: "wellness",
    label: "Bienestar",
    detailPlaceholder: "Ej: Semana de yoga y spa",
    keyDataPlaceholder: "Ej: Cupos limitados, agosto",
  },
  {
    id: "custom",
    label: "Escribir lo mío",
  },
];

/** Label legible de cada intención — usado para armar el brief y el modal de éxito. */
export const INTENT_LABEL: Record<IntentId, string> = Object.fromEntries(
  INTENT_OPTIONS.map((opt) => [opt.id, opt.label])
) as Record<IntentId, string>;

/**
 * Brief real que "alimenta la IA" al generar piezas — reemplaza al viejo
 * `campaign: string` decorativo. Retrocompatible: intent vacío ("" as IntentId)
 * representa el estado inicial sin selección (ninguna card preseleccionada).
 */
export interface CampaignBrief {
  /** "" = sin selección (estado default, ninguna card preseleccionada). */
  intent: IntentId | "";
  /** Afina la intención elegida. Solo aplica si intent !== "custom". Opcional. */
  detail?: string;
  /** Único texto libre cuando intent === "custom". */
  customText?: string;
  /** Dato estructurado corto opcional (fechas, % descuento, etc). Solo si intent !== "custom". */
  keyData?: string;
}

export const EMPTY_BRIEF: CampaignBrief = { intent: "" };

/**
 * Arma el prompt de texto que efectivamente se envía a la IA / se muestra
 * como transparencia en el modal de éxito. Devuelve "" si el brief está
 * incompleto (sin intent, o custom sin texto).
 */
export function briefToPrompt(brief: CampaignBrief): string {
  if (brief.intent === "custom") {
    return (brief.customText ?? "").trim();
  }
  if (!brief.intent) return "";
  const label = INTENT_LABEL[brief.intent];
  const detail = brief.detail?.trim();
  const keyData = brief.keyData?.trim();
  return `${label}${detail ? `: ${detail}` : ""}${keyData ? ` — ${keyData}` : ""}`;
}

/**
 * Versión HUMANA del brief — para mostrarle al hotelero (modal de éxito,
 * overlay de las piezas recién generadas). A diferencia de `briefToPrompt`
 * (que arma la sintaxis "Label: detalle — dato clave" para "enviar a la IA"),
 * esta nunca expone esa sintaxis cruda. Si hay texto propio (detail/customText)
 * lo usa tal cual; si no, cae a la intención en lenguaje natural.
 * WEB-737 T1.6.
 */
export function briefToHumanText(brief: CampaignBrief): string {
  if (brief.intent === "custom") {
    return (brief.customText ?? "").trim();
  }
  if (!brief.intent) return "";
  const detail = brief.detail?.trim();
  if (detail) return detail;
  return INTENT_LABEL[brief.intent];
}

/** Plantilla de tipo/tamaño de pieza nueva, por red — mismo shape que ya usan igPosts/fbPosts/ttPosts. */
const GENERATE_TEMPLATE_BY_NETWORK: Record<string, { type: string; size: string }> = {
  Instagram: { type: "Post", size: "1080×1080" },
  Facebook:  { type: "Post", size: "1200×630" },
  TikTok:    { type: "Video thumb", size: "1080×1920" },
};

/** Pool de imágenes para ciclar al generar piezas nuevas — cualquier foto del hotel sirve de punto de partida. */
const GENERATE_IMAGE_POOL = Object.values(hotelImages);

/**
 * Genera `count` piezas nuevas para `network` a partir del brief humano — usado
 * por "Generar piezas nuevas" en RedesSocialesView (WEB-737 T1.2). Antes el
 * botón solo abría un modal sin tocar el estado; ahora las piezas quedan
 * reales en la grilla, en el contador de la tab y en el phone preview.
 * Mock determinístico: cicla imágenes del hotel + arma overlay/sub con el
 * texto humano del brief (nunca la sintaxis cruda de `briefToPrompt`).
 */
export function generatePosts(network: string, brief: CampaignBrief, count = 6): SocialPost[] {
  const template = GENERATE_TEMPLATE_BY_NETWORK[network] ?? GENERATE_TEMPLATE_BY_NETWORK.Instagram;
  const humanText = briefToHumanText(brief) || "Nueva publicación";
  const keyData = brief.intent !== "custom" ? brief.keyData?.trim() : undefined;

  return Array.from({ length: count }, (_, i) => ({
    type: template.type,
    size: template.size,
    image: GENERATE_IMAGE_POOL[i % GENERATE_IMAGE_POOL.length],
    overlay: humanText,
    sub: keyData || "Hotel Azul Marino · Cartagena",
    status: "draft",
  }));
}
