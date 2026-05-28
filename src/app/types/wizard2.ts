import type { WizardState as W1State } from "./wizard";

export type W2Section =
  | "profile"
  | "languages"
  | "social"
  | "location"
  | "seo"
  | "pages"
  | "policies"
  | "launch"
  | "final";

export type SectionGroup = "launch" | "grow";

export interface SectionMeta {
  id: W2Section;
  label: string;
  /** Nombre lógico del ícono — el componente mapea a lucide. */
  icon: string;
  group: SectionGroup;
  timing: string;
}

/**
 * Orden del sidebar: 4 launch + 3 grow + 1 launch (la sección "Lanzamiento").
 * El último item no muestra el group label arriba (es la sección de publicar).
 */
export const SECTIONS: SectionMeta[] = [
  { id: "profile", label: "Perfil completo", icon: "building", group: "launch", timing: "Semana 1" },
  { id: "social", label: "Redes sociales", icon: "instagram", group: "launch", timing: "Semana 1" },
  { id: "location", label: "Ubicación y POI", icon: "map-pin", group: "launch", timing: "Semana 1" },
  { id: "seo", label: "SEO y Schema.org", icon: "search", group: "launch", timing: "Semana 1" },
  { id: "languages", label: "Idiomas y monedas", icon: "languages", group: "grow", timing: "Mes 1-3" },
  { id: "pages", label: "Páginas adicionales", icon: "files", group: "grow", timing: "Mes 1-3" },
  { id: "policies", label: "Políticas y pagos", icon: "file-text", group: "grow", timing: "Mes 1-3" },
  { id: "launch", label: "Lanzamiento", icon: "rocket", group: "launch", timing: "" },
];

export interface SeoPageData {
  title: string;
  description: string;
}

export interface Poi {
  /** ID estable usado como React key cuando se filtra del medio del array. */
  id?: string;
  icon: string;
  label: string;
  distance: string;
}

export interface W2Profile {
  hotelName: string;
  category: string;
  email: string;
  shortDescription: string;
  longDescription: string;
  phone: string;
  font: string;
}

export interface W2Languages {
  active: string[];
  currency: string;
}

export interface W2Social {
  instagram: string;
  facebook: string;
  whatsapp: string;
  linkedin: string;
  tripadvisor: string;
}

export interface W2Location {
  address: string;
  pois: Poi[];
}

export interface W2Seo {
  pages: {
    inicio: SeoPageData;
    habitaciones: SeoPageData;
    contacto: SeoPageData;
  };
  schemaOrgEnabled: boolean;
  geoEnabled: boolean;
}

export interface W2AdditionalPages {
  experiencias: boolean;
  blog: boolean;
  promociones: boolean;
  spa: boolean;
  eventos: boolean;
}

export interface W2Policies {
  cancellation: {
    type: "flexible" | "moderada" | "estricta";
    hoursInAdvance: string;
    penalty: string;
    text: string;
  };
  payments: {
    transferencia: boolean;
    efectivo: boolean;
    mercadopago: boolean;
    payway: boolean;
  };
}

export interface W2Launch {
  previewChecked: boolean;
  mobileChecked: boolean;
  seoChecked: boolean;
  testReservation: boolean;
  meetingScheduled: boolean;
}

export interface W2State {
  currentSection: W2Section;
  completedSections: Set<W2Section>;
  profile: W2Profile;
  languages: W2Languages;
  social: W2Social;
  location: W2Location;
  seo: W2Seo;
  additionalPages: W2AdditionalPages;
  policies: W2Policies;
  launch: W2Launch;
}

export interface W2Props {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (state: W2State) => void;
  initialState?: Partial<W2State>;
  /** Emite el state actual del wizard cada vez que cambia, para que el padre persista el draft. */
  onChange?: (state: W2State) => void;
}

export const ASESOR_TEXTS_W2: Record<W2Section, { text: string; cierre?: string }> = {
  profile: {
    text:
      "Sin el email corporativo, las notificaciones del sistema no llegan. Es lo primero. La descripción la genera la IA en un click.",
  },
  languages: {
    text:
      "Si el hotel recibe turismo extranjero, activar inglés es alta prioridad. Cada idioma activado suma posiciones en búsquedas internacionales.",
  },
  social: {
    text:
      "Instagram y WhatsApp son los canales más relevantes para hoteles boutique en LATAM. TripAdvisor mejora el SEO local si ya tienen reseñas.",
  },
  location: {
    text:
      "El aeropuerto más cercano es obligatorio. Luego la terminal y 1-2 atracciones. 3+ puntos de interés tienen muy buen retorno en SEO local.",
  },
  seo: {
    text:
      "Schema.org Hotel es la diferencia entre aparecer o no en los resultados de IA (ChatGPT, Perplexity). Si hay que priorizar una sola acción de SEO, es esta.",
  },
  pages: {
    text:
      "Experiencias es la página con mayor tiempo de permanencia en hoteles boutique. Si el hotel tiene algo diferencial, esta es la página para contarlo.",
  },
  policies: {
    text:
      "La política flexible aumenta la conversión. Los huéspedes reservan más cuando pueden cancelar sin cargo.",
  },
  launch: {
    text:
      "Que el hotelero vea el sitio en su propio celular antes de publicar. Ese momento es el que consolida la relación.",
    cierre:
      "[Nombre], tu sitio está listo para publicar. ¿Querés que veamos juntos cómo activar el plan para que siga activo después del trial? Si pregunta por precio: ¿Cuántas reservas recibís por mes? Con 3 reservas directas que antes iban a Booking.com, el plan ya se paga.",
  },
  final: {
    text:
      "Publicá desde el toolbar del editor. Después agendá la revisión de 30 días para ver métricas y activar lo que quedó pendiente.",
  },
};

export const POI_OPTIONS: Poi[] = [
  { icon: "building", label: "Centro histórico", distance: "500 m" },
  { icon: "shopping-bag", label: "Shopping local", distance: "1.2 km" },
  { icon: "trees", label: "Parque central", distance: "3 km" },
  { icon: "palmtree", label: "Playa Paraíso", distance: "800 m" },
];

export const AI_SEO: Record<keyof W2Seo["pages"], SeoPageData> = {
  inicio: {
    title: "Hotel Plaza Mayor · Córdoba · Mejor precio en reserva directa",
    description:
      "Hotel boutique en el centro histórico de Córdoba. Reservá directo y obtené desayuno incluido y la mejor tarifa garantizada.",
  },
  habitaciones: {
    title: "Habitaciones · Hotel Plaza Mayor Córdoba · Suites y habitaciones boutique",
    description:
      "Habitaciones de diseño en el centro de Córdoba. Suites, estándar y familiares con las mejores vistas.",
  },
  contacto: {
    title: "Contacto · Hotel Plaza Mayor · Córdoba",
    description:
      "Contactate con nosotros. Teléfono, email y formulario de consulta disponibles.",
  },
};

export const POLICY_AI_TEXT =
  "Cancelación gratuita hasta 72 horas antes del check-in. En caso de no-show se aplica una penalidad de 1 noche de estadía.";

export const INITIAL_W2_STATE: W2State = {
  currentSection: "profile",
  completedSections: new Set<W2Section>(),
  profile: {
    hotelName: "",
    category: "",
    email: "",
    shortDescription: "",
    longDescription: "",
    phone: "",
    font: "Inter",
  },
  languages: {
    active: ["es"],
    currency: "ARS",
  },
  social: {
    instagram: "",
    facebook: "",
    whatsapp: "",
    linkedin: "",
    tripadvisor: "",
  },
  location: {
    address: "",
    pois: [],
  },
  seo: {
    pages: {
      inicio: { title: "", description: "" },
      habitaciones: { title: "", description: "" },
      contacto: { title: "", description: "" },
    },
    schemaOrgEnabled: false,
    geoEnabled: false,
  },
  additionalPages: {
    experiencias: false,
    blog: false,
    promociones: false,
    spa: false,
    eventos: false,
  },
  policies: {
    cancellation: {
      type: "flexible",
      hoursInAdvance: "72",
      penalty: "1 noche",
      text: "",
    },
    payments: {
      transferencia: false,
      efectivo: false,
      mercadopago: false,
      payway: false,
    },
  },
  launch: {
    previewChecked: false,
    mobileChecked: false,
    seoChecked: false,
    testReservation: false,
    meetingScheduled: false,
  },
};

/** Mapea state del W1 a initialState parcial del W2 (pre-llenado tras onboarding). */
export function w1ToW2Initial(w1: W1State): Partial<W2State> {
  return {
    profile: {
      ...INITIAL_W2_STATE.profile,
      hotelName: w1.info.hotelName,
      email: w1.info.email,
      phone: w1.info.phone,
    },
    social: {
      ...INITIAL_W2_STATE.social,
      instagram: w1.info.instagram,
      facebook: w1.info.facebook,
      whatsapp: w1.info.whatsapp,
    },
  };
}
