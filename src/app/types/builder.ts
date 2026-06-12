/**
 * Tipos del CMS Page Builder. Modela los módulos del árbol, las propiedades,
 * los componentes de la palette y el AI assistant.
 */

export type BuilderTab = "header" | "page" | "footer";

export type ModulePropType = "OBJECT" | "STRING" | "ARRAY" | "BOOLEAN" | "NUMBER";

export interface ModuleProperty {
  name: string;
  type: ModulePropType;
}

/**
 * Origen de una sección. Define el distintivo (pill) y, en el caso de IA,
 * el subtítulo de la fila.
 *   - manual : agregada por el hotelero desde el catálogo. Subtítulo "Tipo · Custom".
 *   - ai     : generada por el asistente. Pill "IA", subtítulo "Generada con IA".
 *   - global : header/footer global del sitio. Pill "Global".
 */
export type SectionOrigin = "manual" | "ai" | "global";

export interface BuilderModule {
  id: string;
  /** Nombre técnico del componente (ej. "CustomComponent1"). NO se muestra como título. */
  name: string;
  /**
   * Alias editable: lo que la sección ES para el hotelero ("Sobre nosotros").
   * Si está vacío, la fila deriva un título del primer heading del contenido
   * (ver deriveAlias en sectionMeta) y, en última instancia, del typeLabel —
   * nunca del `name` técnico.
   */
  alias?: string;
  /** Tipo legible del componente para el subtítulo de la fila ("Hero", "Galería"). */
  typeLabel?: string;
  /** Origen de la sección. Default "manual". */
  origin?: SectionOrigin;
  /** Nombre lógico de ícono lucide (clave de SECTION_ICONS en sectionMeta). */
  icon?: string;
  /** Sección oculta: no se renderiza en el canvas y la fila se muestra atenuada. */
  hidden?: boolean;
  /** Si el módulo está expandido en el tree. */
  expanded: boolean;
  /** Propiedades del módulo, en el orden que aparecen. */
  properties: ModuleProperty[];
  /** Hijos anidados (otros módulos). */
  children?: BuilderModule[];
}

export type ComponentCategory = "all" | "layout" | "content" | "code";

export interface ComponentDef {
  id: string;
  name: string;
  /** Sub-tipo o tag mostrado tras el `|` (ej: "Code", "Generic"). */
  tag?: string;
  description: string;
  category: Exclude<ComponentCategory, "all">;
  icon: string; // nombre lógico del ícono lucide
}

export type ViewportMode = "desktop" | "tablet" | "mobile";

/**
 * Datos mock iniciales del árbol de la página "Inicio".
 *
 * Cada sección lleva alias legible, tipo, origen e ícono — el canvas se
 * renderiza a partir de este array (ver Canvas.tsx) y el panel de estructura
 * lo etiqueta. Incluye una sección de origen "ai" para mostrar el flujo de
 * secciones generadas por IA como ciudadanas de primera (arrastrables, no
 * clavadas al pie).
 */
export const INITIAL_TREE: BuilderModule[] = [
  {
    id: "hero",
    name: "HeroSection",
    alias: "Portada",
    typeLabel: "Hero",
    origin: "manual",
    icon: "layout",
    expanded: false,
    properties: [
      { name: "kicker", type: "STRING" },
      { name: "headline", type: "STRING" },
      { name: "subtitle", type: "STRING" },
      { name: "ctaText", type: "STRING" },
      { name: "backgroundImage", type: "OBJECT" },
    ],
  },
  {
    id: "rooms",
    name: "RoomsGrid",
    alias: "Habitaciones",
    typeLabel: "Habitaciones",
    origin: "manual",
    icon: "layout-grid",
    expanded: false,
    properties: [
      { name: "titulo", type: "STRING" },
      { name: "rooms", type: "ARRAY" },
      { name: "showPrices", type: "BOOLEAN" },
    ],
  },
  {
    id: "promos-ai",
    name: "CustomComponent1",
    alias: "Promociones",
    typeLabel: "Texto destacado",
    origin: "ai",
    icon: "sparkles",
    expanded: false,
    properties: [
      { name: "kicker", type: "STRING" },
      { name: "headline", type: "STRING" },
      { name: "texto", type: "OBJECT" },
      { name: "boton", type: "OBJECT" },
    ],
  },
  {
    id: "about",
    name: "TextImage",
    alias: "Sobre nosotros",
    typeLabel: "Texto e imagen",
    origin: "manual",
    icon: "columns",
    expanded: false,
    properties: [
      { name: "titulo", type: "STRING" },
      { name: "texto", type: "OBJECT" },
      { name: "imagen", type: "OBJECT" },
      { name: "imagenAlt", type: "STRING" },
    ],
  },
  {
    id: "gallery",
    name: "Gallery",
    alias: "Galería",
    typeLabel: "Galería",
    origin: "manual",
    icon: "images",
    expanded: false,
    properties: [
      { name: "images", type: "ARRAY" },
      { name: "columns", type: "NUMBER" },
    ],
  },
];

/** Catálogo de componentes mock para el palette. */
export const COMPONENT_LIBRARY: ComponentDef[] = [
  {
    id: "custom-component-1",
    name: "CustomComponent1",
    tag: "Code",
    description: "Componente custom con props editables",
    category: "code",
    icon: "code",
  },
  {
    id: "custom-module",
    name: "Custom Module",
    tag: "Code",
    description: "Módulo personalizado con lógica propia",
    category: "code",
    icon: "package",
  },
  {
    id: "custom-html",
    name: "Custom HTML",
    tag: "Code",
    description: "Bloque HTML embebido sin restricciones",
    category: "code",
    icon: "file-code",
  },
  {
    id: "custom-css",
    name: "Custom CSS",
    tag: "Code",
    description: "Hoja de estilos inline para la página",
    category: "code",
    icon: "paint-bucket",
  },
  {
    id: "custom-js",
    name: "Custom JavaScript",
    tag: "Code",
    description: "Script JS embebido (uso con cuidado)",
    category: "code",
    icon: "braces",
  },
  {
    id: "hero",
    name: "Hero",
    tag: "Generic",
    description: "Encabezado principal con imagen + CTA",
    category: "layout",
    icon: "layout",
  },
  {
    id: "gallery",
    name: "Gallery",
    tag: "Generic",
    description: "Grilla de imágenes responsiva",
    category: "layout",
    icon: "images",
  },
  {
    id: "rooms-grid",
    name: "Rooms Grid",
    tag: "Generic",
    description: "Listado de habitaciones con foto + precio",
    category: "layout",
    icon: "layout-grid",
  },
  {
    id: "text-image",
    name: "Text & Image",
    tag: "Generic",
    description: "Bloque editorial dos columnas",
    category: "layout",
    icon: "columns",
  },
  {
    id: "contact-form",
    name: "Contact Form",
    tag: "Generic",
    description: "Formulario de contacto con email + mensaje",
    category: "layout",
    icon: "mail",
  },
  {
    id: "rich-text",
    name: "Rich Text",
    tag: "Generic",
    description: "Bloque de texto con formato (h1, ul, etc.)",
    category: "content",
    icon: "type",
  },
  {
    id: "quote",
    name: "Pull Quote",
    tag: "Generic",
    description: "Cita destacada con autor",
    category: "content",
    icon: "quote",
  },
];

export const COMPONENT_CATEGORY_COUNTS: Record<ComponentCategory, number> = {
  all: 57,
  layout: 43,
  content: 2,
  code: 14,
};

export const AI_SUGGESTION_CHIPS = [
  "Proponé variantes del bloque principal de esta página",
  "Revisá el texto y las props del módulo citado",
  "Sugerí mejoras de accesibilidad y contraste",
];
