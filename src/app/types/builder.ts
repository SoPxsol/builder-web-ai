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

export interface BuilderModule {
  id: string;
  name: string;
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

/** Datos mock iniciales del árbol — replica el screenshot del brief. */
export const INITIAL_TREE: BuilderModule[] = [
  {
    id: "custom-component-1",
    name: "CustomComponent1",
    expanded: true,
    properties: [
      { name: "__template", type: "OBJECT" },
      { name: "__variables", type: "OBJECT" },
      { name: "__renderMode", type: "STRING" },
      { name: "titulo", type: "OBJECT" },
      { name: "texto", type: "OBJECT" },
      { name: "boton", type: "OBJECT" },
      { name: "kicker", type: "STRING" },
      { name: "headline1", type: "STRING" },
      { name: "headline2", type: "STRING" },
      { name: "headline3", type: "STRING" },
      { name: "subtitle", type: "STRING" },
      { name: "verticalWord", type: "STRING" },
      { name: "imagen", type: "OBJECT" },
      { name: "imagenAlt", type: "STRING" },
    ],
  },
  {
    id: "hero",
    name: "HeroSection",
    expanded: false,
    properties: [
      { name: "headline", type: "STRING" },
      { name: "ctaText", type: "STRING" },
      { name: "backgroundImage", type: "OBJECT" },
    ],
  },
  {
    id: "rooms",
    name: "RoomsGrid",
    expanded: false,
    properties: [
      { name: "rooms", type: "ARRAY" },
      { name: "showPrices", type: "BOOLEAN" },
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
