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

// ---------------------------------------------------------------------------
// Configuración del Header / Navegación (WEB-686)
// ---------------------------------------------------------------------------

/**
 * Acción discreta de la barra utilitaria o del drawer.
 * `icon` es el nombre lógico del ícono lucide (ej. "key-round").
 * `phone` aplica solo cuando actionType es "whatsapp".
 */
export interface UtilityAction {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  actionType: "link" | "booking-engine" | "whatsapp" | "ai-chat";
  phone?: string;
}

/**
 * Logotipo del hotel en el header.
 * `textFallback` se usa cuando la imagen no está disponible.
 */
export interface LogoConfig {
  type: "image" | "text";
  imageUrl?: string;
  imageAlt?: string;
  textFallback?: string;
}

/**
 * Barra utilitaria superior (encima del logo).
 * `leftSlot` y `rightSlot` son acciones opcionales en cada extremo.
 */
export interface UtilityBarConfig {
  visible: boolean;
  leftSlot?: UtilityAction;
  rightSlot?: UtilityAction;
}

/** Barra principal con el logotipo y menú de navegación. */
export interface MainBarConfig {
  sticky: boolean;
  showBookingButton: boolean;
  bookingButtonLabel?: string;
}

/** Sección de navegación en el drawer móvil. */
export interface NavSection {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  order: number;
}

/** Slot de acción en la barra inferior móvil. */
export interface BottomBarSlot {
  id: string;
  action: UtilityAction;
  order: number;
}

/**
 * Barra de acciones fijada al pie en mobile.
 * `backdropBlur` aplica el efecto de desenfoque al fondo.
 */
export interface BottomBarConfig {
  visible: boolean;
  slots: BottomBarSlot[];
  backdropBlur: boolean;
}

/** Opción de idioma del selector de lenguaje. */
export interface LanguageOption {
  code: string;
  label: string;
  enabled: boolean;
}

/** Opción de moneda del selector de divisas. */
export interface CurrencyOption {
  code: string;
  symbol: string;
  enabled: boolean;
}

/**
 * Configuración raíz del header/navegación del sitio.
 *
 * `mobileLayout`:
 *   - "top"    → solo barra superior en mobile.
 *   - "both"   → barra superior + barra inferior (Diplomatic default).
 *   - "bottom" → solo barra inferior en mobile.
 *
 * `desktopLayout`:
 *   - "single-row" → logo + nav en una sola fila.
 *   - "two-rows"   → barra utilitaria encima, logo + nav debajo.
 */
export interface NavConfig {
  logo: LogoConfig;
  hotelTagline?: string;
  mobileLayout: "top" | "both" | "bottom";
  desktopLayout: "single-row" | "two-rows";
  utilityBar: UtilityBarConfig;
  mainBar: MainBarConfig;
  bottomBar: BottomBarConfig;
  drawerSections: NavSection[];
  drawerUtility: UtilityAction[];
  languages: LanguageOption[];
  currencies: CurrencyOption[];
}

/**
 * Configuración default del header. Refleja el wireframe del hotel Diplomatic
 * en disposición "Ambas" (barra superior + bottom bar en mobile).
 *
 * NOTA: Esta constante no está conectada a EntitySlice ni a draftStore.
 * La decisión de persistencia (JSON en propertyValues vs campo tipado `navConfig`
 * en EntitySlice) queda PENDIENTE de aprobación de Sofía.
 */
export const DEFAULT_NAV_CONFIG: NavConfig = {
  logo: {
    type: "image",
    imageAlt: "Logo del hotel",
    textFallback: "Diplomatic",
  },
  hotelTagline: undefined,
  mobileLayout: "both",
  desktopLayout: "two-rows",
  utilityBar: {
    visible: true,
    leftSlot: {
      id: "utility-checkin",
      label: "Check-in",
      icon: "key-round",
      actionType: "booking-engine",
    },
    rightSlot: {
      id: "utility-login",
      label: "Inicio de sesión",
      icon: "user",
      actionType: "link",
    },
  },
  mainBar: {
    sticky: true,
    showBookingButton: true,
    bookingButtonLabel: "Reservar",
  },
  bottomBar: {
    visible: true,
    backdropBlur: true,
    slots: [
      {
        id: "bottom-reservar",
        action: {
          id: "action-reservar",
          label: "Reservar",
          icon: "calendar-check",
          actionType: "booking-engine",
        },
        order: 0,
      },
      {
        id: "bottom-whatsapp",
        action: {
          id: "action-whatsapp",
          label: "WhatsApp",
          icon: "message-circle",
          actionType: "whatsapp",
        },
        order: 1,
      },
      {
        id: "bottom-ai",
        action: {
          id: "action-ai",
          label: "Asistente AI",
          icon: "sparkles",
          actionType: "ai-chat",
        },
        order: 2,
      },
    ],
  },
  drawerSections: [
    { id: "nav-habitaciones", label: "Habitaciones", href: "#habitaciones", visible: true, order: 0 },
    { id: "nav-eventos",      label: "Eventos",      href: "#eventos",      visible: true, order: 1 },
    { id: "nav-gastronomia",  label: "Gastronomía",  href: "#gastronomia",  visible: true, order: 2 },
    { id: "nav-experiencia",  label: "Experiencia",  href: "#experiencia",  visible: true, order: 3 },
    { id: "nav-promociones",  label: "Promociones",  href: "#promociones",  visible: true, order: 4 },
    { id: "nav-contacto",     label: "Contacto",     href: "#contacto",     visible: true, order: 5 },
  ],
  drawerUtility: [
    { id: "drawer-checkin", label: "Check-in",       icon: "key-round",      actionType: "booking-engine" },
    { id: "drawer-login",   label: "Inicio de sesión", icon: "user",         actionType: "link" },
    { id: "drawer-ai",      label: "Asistente AI",   icon: "sparkles",       actionType: "ai-chat" },
    { id: "drawer-wp",      label: "WhatsApp",       icon: "message-circle", actionType: "whatsapp" },
  ],
  languages: [
    { code: "es", label: "Español",   enabled: true  },
    { code: "en", label: "English",   enabled: false },
    { code: "pt", label: "Português", enabled: false },
  ],
  currencies: [
    { code: "ARS", symbol: "$", enabled: true  },
    { code: "USD", symbol: "U$S", enabled: false },
  ],
};
