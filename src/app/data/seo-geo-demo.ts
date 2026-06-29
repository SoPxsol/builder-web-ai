/**
 * seo-geo-demo.ts — data de demo para la Suite SEO/GEO con IA.
 * Hotel Azul Marino, Cartagena de Indias.
 * Portada desde pxsol-home-mkt-division/src/data/seoGeo.js.
 * Sin cambios de fondo, solo tipado para el entorno TypeScript del Builder.
 *
 * Las cifras de los distintos módulos (Dashboard, GeoTracker, SeoAnalytics,
 * Fuentes, etc.) cuadran entre sí — no modificar valores individuales sin
 * revisar la coherencia global.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * Tipos
 * ──────────────────────────────────────────────────────────────────────────── */

export interface SeriesPoint {
  date: string;
  seo: number;
  geo: number;
}

export interface VisibilityAlert {
  id: string;
  type: "ai_mention" | "new_keyword" | "drop";
  text: string;
  /** Ruta interna usada para navegar a la sub-vista relacionada. */
  link: string;
  tone: "green" | "cool" | "amber" | "brand";
  time: string;
}

export interface VisibilityOverview {
  globalScore: number;
  seoScore: number;
  geoScore: number;
  delta: { global: number; seo: number; geo: number };
  series30d: SeriesPoint[];
  series90d: SeriesPoint[];
  kpis: {
    aiMentionsThisWeek: number;
    avgGooglePosition: number;
    indexedPages: number;
  };
  alerts: VisibilityAlert[];
}

export interface GeoQuery {
  id: string;
  engine: "chatgpt" | "perplexity" | "google_ai";
  query: string;
  category: string;
  mentioned: boolean;
  position?: number;
  excerpt: string | null;
  citedUrl: string | null;
  lastRun: string;
}

export interface Competitor {
  id: string;
  name: string;
  aiVisibilityScore: number;
}

export interface GeoMockResponse {
  engine: "chatgpt" | "perplexity" | "google_ai";
  mentioned: boolean;
  position?: number;
  excerpt: string | null;
  citedUrl: string | null;
}

export interface GscSummary {
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  deltas: { impressions: number; clicks: number; ctr: number; avgPosition: number };
  connected: boolean;
  lastSync: string;
}

export interface Keyword {
  term: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  trend: "up" | "down" | "flat";
  isOpportunity: boolean;
}

export interface OrganicPage {
  url: string;
  clicks: number;
  impressions: number;
}

export interface Source {
  domain: string;
  mentionType: string;
  date: string;
  llmAuthority: "high" | "medium" | "low";
}

export interface SourceRecommendation {
  name: string;
  status: "present" | "pending" | "absent";
  priority: "high" | "medium" | "low";
  why: string;
}

export interface ContentSection {
  heading: string;
  level: 2 | 3;
  body: string;
}

export interface GeneratedDraft {
  contentType: "landing" | "blog" | "faq" | "service";
  h1: string;
  metaDescription: string;
  sections: ContentSection[];
  richSnippetSchema: string;
}

export interface OptimizeExample {
  original: string;
  optimized: string;
  improvements: string[];
}

export interface Suggestion {
  id: string;
  title: string;
  reason: "opportunity_keyword" | "ai_faq" | "seasonality";
  reasonLabel: string;
  topic: string;
  contentType: "landing" | "blog" | "faq" | "service";
  why: string;
}

export interface ReportConfig {
  logoUrl: string | null;
  frequency: "monthly" | "weekly";
  email: string;
  scheduled: boolean;
}

export interface ReportPreview {
  period: string;
  highlights: Array<{ label: string; value: string; delta: string }>;
  topContents: Array<{ title: string; date: string; clicks: number }>;
  recommendations: string[];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────────── */

function buildSeries(days: number, seoBase: number, geoBase: number): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const t = (days - i) / days;
    const noise = (Math.sin(i * 0.6) + Math.cos(i * 0.3)) * 1.6;
    out.push({
      date: `D-${i}`,
      seo: Math.round(seoBase - 8 + t * 12 + noise),
      geo: Math.round(geoBase - 14 + t * 18 + noise * 1.2),
    });
  }
  return out;
}

/* ────────────────────────────────────────────────────────────────────────────
 * F-01 Dashboard de visibilidad
 * ──────────────────────────────────────────────────────────────────────────── */

export const visibilityOverview: VisibilityOverview = {
  globalScore: 71,
  seoScore: 78,
  geoScore: 64,
  delta: { global: +6, seo: +4, geo: +11 },
  series30d: buildSeries(30, 78, 64),
  series90d: buildSeries(90, 78, 64),
  kpis: {
    aiMentionsThisWeek: 14,
    avgGooglePosition: 8.4,
    indexedPages: 47,
  },
  alerts: [
    {
      id: "a1",
      type: "ai_mention",
      text: 'Nueva mención en ChatGPT — "hoteles boutique en Cartagena"',
      link: "geo-tracker",
      tone: "green",
      time: "hace 12 min",
    },
    {
      id: "a2",
      type: "new_keyword",
      text: '"spa en Cartagena de Indias" entró al top 10 (#9)',
      link: "seo",
      tone: "cool",
      time: "hace 2 h",
    },
    {
      id: "a3",
      type: "drop",
      text: "Caída de visibilidad en Perplexity (-3% esta semana)",
      link: "geo-tracker",
      tone: "amber",
      time: "hace 1 día",
    },
    {
      id: "a4",
      type: "ai_mention",
      text: 'Google AI Overviews te citó en "dónde hospedarse en la ciudad amurallada"',
      link: "geo-tracker",
      tone: "green",
      time: "hace 1 día",
    },
    {
      id: "a5",
      type: "new_keyword",
      text: "3 keywords nuevas con potencial detectadas en GSC",
      link: "seo",
      tone: "brand",
      time: "hace 2 días",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * F-02 GEO Tracker
 * ──────────────────────────────────────────────────────────────────────────── */

export const initialGeoQueries: GeoQuery[] = [
  {
    id: "q1", engine: "chatgpt",
    query: "¿Cuáles son los mejores hoteles boutique en Cartagena de Indias?",
    category: "Cartagena · Boutique", mentioned: true, position: 2,
    excerpt: "Entre las opciones más recomendadas se encuentra Hotel Azul Marino, un boutique de 18 habitaciones dentro de la ciudad amurallada, conocido por su diseño de autor y gastronomía local.",
    citedUrl: "hotelazulmarino.presence.io", lastRun: "hace 12 min",
  },
  {
    id: "q2", engine: "perplexity",
    query: "dónde hospedarse en la ciudad amurallada de Cartagena",
    category: "Cartagena · Ubicación", mentioned: true, position: 3,
    excerpt: "Hotel Azul Marino destaca por estar literalmente dentro de la muralla, frente al mar Caribe, con un patio interior y servicio personalizado.",
    citedUrl: "tripadvisor.com / hotelazulmarino.presence.io", lastRun: "hace 12 min",
  },
  {
    id: "q3", engine: "google_ai",
    query: "hoteles con jacuzzi privado en Cartagena",
    category: "Cartagena · Amenidades", mentioned: true, position: 4,
    excerpt: "La Suite Master del Hotel Azul Marino incluye terraza privada con jacuzzi al aire libre — una de las opciones más mencionadas en este segmento.",
    citedUrl: "hotelazulmarino.presence.io/suite-master", lastRun: "hace 12 min",
  },
  {
    id: "q4", engine: "chatgpt",
    query: "mejores restaurantes de hotel en Cartagena",
    category: "Cartagena · Gastronomía", mentioned: false,
    excerpt: null, citedUrl: null, lastRun: "hace 12 min",
  },
  {
    id: "q5", engine: "perplexity",
    query: "hoteles 4 estrellas frente al mar en Colombia",
    category: "Colombia · 4★", mentioned: true, position: 7,
    excerpt: "Para quien busca categoría 4 estrellas frente al Caribe colombiano, se mencionan opciones como Hotel Azul Marino en Cartagena, con habitaciones desde USD 180.",
    citedUrl: "booking.com / hotelazulmarino.presence.io", lastRun: "hace 12 min",
  },
  {
    id: "q6", engine: "chatgpt",
    query: "qué hotel elegir para luna de miel en Cartagena",
    category: "Cartagena · Parejas", mentioned: false,
    excerpt: null, citedUrl: null, lastRun: "hace 12 min",
  },
  {
    id: "q7", engine: "google_ai",
    query: "spa en Cartagena de Indias",
    category: "Cartagena · Spa", mentioned: true, position: 5,
    excerpt: "Algunos hoteles boutique de Cartagena ofrecen spa en sitio. Hotel Azul Marino incluye tratamientos con coco, café y arcillas del Caribe.",
    citedUrl: "hotelazulmarino.presence.io/spa", lastRun: "hace 12 min",
  },
  {
    id: "q8", engine: "perplexity",
    query: "hoteles para trabajar remoto en Cartagena",
    category: "Cartagena · Remoto", mentioned: false,
    excerpt: null, citedUrl: null, lastRun: "hace 12 min",
  },
  {
    id: "q9", engine: "chatgpt",
    query: "hoteles que aceptan mascotas en Cartagena de Indias",
    category: "Cartagena · Pet-friendly", mentioned: true, position: 6,
    excerpt: "Entre los hoteles boutique que admiten mascotas se menciona Hotel Azul Marino, que las recibe sin costo adicional.",
    citedUrl: "hotelazulmarino.presence.io", lastRun: "hace 12 min",
  },
  {
    id: "q10", engine: "google_ai",
    query: "qué hacer en Cartagena en 3 días",
    category: "Cartagena · Itinerarios", mentioned: false,
    excerpt: null, citedUrl: null, lastRun: "hace 12 min",
  },
  {
    id: "q11", engine: "chatgpt",
    query: "hoteles con vista al mar dentro de la muralla",
    category: "Cartagena · Vista mar", mentioned: true, position: 1,
    excerpt: "Hotel Azul Marino es uno de los pocos boutique que combina ubicación dentro de la muralla con habitaciones que dan al Caribe — la Suite Junior Vista Mar tiene ventanal panorámico.",
    citedUrl: "hotelazulmarino.presence.io/suite-junior", lastRun: "hace 12 min",
  },
  {
    id: "q12", engine: "perplexity",
    query: "hoteles boutique con experiencia gastronómica local",
    category: "Gastronomía · Boutique", mentioned: true, position: 8,
    excerpt: "En Cartagena, Hotel Azul Marino destaca su menú de degustación de 7 pasos con productos de pescadores de Bocachica.",
    citedUrl: "hotelazulmarino.presence.io/restaurante", lastRun: "hace 12 min",
  },
];

export const initialCompetitors: Competitor[] = [
  { id: "c1", name: "Casa San Agustín",  aiVisibilityScore: 71 },
  { id: "c2", name: "Casa Pestagua",     aiVisibilityScore: 58 },
];

export const newQueryMockResponses: GeoMockResponse[] = [
  {
    engine: "chatgpt", mentioned: true, position: 4,
    excerpt: "Entre las propiedades mencionadas para este perfil, Hotel Azul Marino aparece como una opción curada en el segmento boutique de la ciudad amurallada.",
    citedUrl: "hotelazulmarino.presence.io",
  },
  {
    engine: "perplexity", mentioned: false,
    excerpt: null, citedUrl: null,
  },
  {
    engine: "google_ai", mentioned: true, position: 6,
    excerpt: "Hotel Azul Marino se cita entre opciones recomendadas, destacando su gastronomía local y diseño de autor.",
    citedUrl: "tripadvisor.com",
  },
];

/* ────────────────────────────────────────────────────────────────────────────
 * F-03 SEO Analytics
 * ──────────────────────────────────────────────────────────────────────────── */

export const gscSummary: GscSummary = {
  impressions: 124_580,
  clicks: 8_320,
  ctr: 6.68,
  avgPosition: 8.4,
  deltas: { impressions: +14, clicks: +21, ctr: +0.8, avgPosition: -1.2 },
  connected: true,
  lastSync: "hace 1 hora",
};

export const keywords: Keyword[] = [
  { term: "hotel boutique cartagena",              impressions: 18_400, clicks: 1_640, ctr: 8.9,  position: 3.2,  trend: "up",   isOpportunity: false },
  { term: "hotel cartagena dentro muralla",         impressions: 12_780, clicks:   980, ctr: 7.7,  position: 4.1,  trend: "up",   isOpportunity: true  },
  { term: "hotel boutique frente al mar colombia",  impressions:  9_240, clicks:   620, ctr: 6.7,  position: 6.5,  trend: "flat", isOpportunity: true  },
  { term: "hoteles cartagena con jacuzzi",          impressions:  7_100, clicks:   410, ctr: 5.8,  position: 8.2,  trend: "up",   isOpportunity: true  },
  { term: "donde hospedarse cartagena de indias",   impressions: 14_320, clicks: 1_120, ctr: 7.8,  position: 5.4,  trend: "up",   isOpportunity: true  },
  { term: "restaurante hotel cartagena",            impressions:  4_800, clicks:   210, ctr: 4.4,  position: 11.3, trend: "down", isOpportunity: true  },
  { term: "spa cartagena de indias",                impressions:  6_540, clicks:   280, ctr: 4.3,  position: 9.1,  trend: "up",   isOpportunity: true  },
  { term: "luna de miel cartagena hotel",           impressions:  3_200, clicks:    95, ctr: 3.0,  position: 14.6, trend: "flat", isOpportunity: true  },
  { term: "azul marino cartagena",                  impressions:  5_400, clicks: 2_180, ctr: 40.4, position: 1.1,  trend: "flat", isOpportunity: false },
  { term: "hoteles 4 estrellas cartagena",          impressions:  8_900, clicks:   380, ctr: 4.3,  position: 12.4, trend: "down", isOpportunity: true  },
  { term: "mejor hotel cartagena 2026",             impressions:  6_100, clicks:   290, ctr: 4.8,  position: 7.8,  trend: "up",   isOpportunity: true  },
  { term: "hotel pet friendly cartagena",           impressions:  2_400, clicks:   120, ctr: 5.0,  position: 9.3,  trend: "up",   isOpportunity: true  },
];

export const organicPages: OrganicPage[] = [
  { url: "/",                                       clicks: 3_120, impressions: 38_400 },
  { url: "/habitaciones/suite-master",              clicks: 1_840, impressions: 19_200 },
  { url: "/restaurante",                            clicks:   980, impressions: 14_320 },
  { url: "/habitaciones/suite-junior-vista-mar",    clicks:   820, impressions: 11_800 },
  { url: "/experiencias",                           clicks:   640, impressions:  9_240 },
  { url: "/spa",                                    clicks:   410, impressions:  6_540 },
  { url: "/ubicacion",                              clicks:   360, impressions:  7_100 },
];

/* ────────────────────────────────────────────────────────────────────────────
 * F-04 Citas y fuentes
 * ──────────────────────────────────────────────────────────────────────────── */

export const sources: Source[] = [
  { domain: "tripadvisor.com",          mentionType: "Listing + reseñas",              date: "2026-05-12", llmAuthority: "high"   },
  { domain: "booking.com",              mentionType: "Ficha de propiedad",              date: "2026-05-08", llmAuthority: "high"   },
  { domain: "cntraveler.com",           mentionType: "Artículo editorial",              date: "2026-04-22", llmAuthority: "high"   },
  { domain: "expedia.com",              mentionType: "Ficha de propiedad",              date: "2026-04-18", llmAuthority: "high"   },
  { domain: "travelandleisure.com",     mentionType: "Lista \"Best of Cartagena 2026\"", date: "2026-04-02", llmAuthority: "high"   },
  { domain: "airbnb.com",               mentionType: "Listing boutique",                date: "2026-03-29", llmAuthority: "medium" },
  { domain: "theguardian.com",          mentionType: "Mención en artículo de viaje",    date: "2026-03-14", llmAuthority: "high"   },
  { domain: "culturatravel.co",         mentionType: "Reseña local",                    date: "2026-03-05", llmAuthority: "medium" },
  { domain: "reddit.com/r/colombia",    mentionType: "Hilo de recomendación",           date: "2026-02-28", llmAuthority: "low"    },
  { domain: "blog.viajaporcolombia.com",mentionType: "Post de blog",                    date: "2026-02-20", llmAuthority: "low"    },
  { domain: "forbes.com.co",            mentionType: "Top boutique 2026",               date: "2026-02-12", llmAuthority: "medium" },
  { domain: "guiadelviajero.es",        mentionType: "Guía de Cartagena",               date: "2026-01-30", llmAuthority: "medium" },
];

export const sourceRecommendations: SourceRecommendation[] = [
  { name: "Condé Nast Hot List",           status: "pending", priority: "high",   why: "Citada por ChatGPT y Perplexity para consultas de hotelería boutique en LATAM." },
  { name: "New York Times — Travel section",status: "absent",  priority: "high",   why: "Una mención aquí pesa más que cualquier campaña SEO. Buscar pitch editorial." },
  { name: "Booking.com Travel Sustainable",status: "pending", priority: "medium", why: "Tu propiedad cumple criterios y todavía no está badge-eada." },
  { name: "Lonely Planet — Colombia 2026", status: "absent",  priority: "medium", why: "LP es fuente frecuente de Google AI Overviews para destinos." },
  { name: "Hotels.com / Vrbo Premier",     status: "absent",  priority: "low",    why: "Audiencia transaccional, baja autoridad para LLM pero alto volumen." },
  { name: "TripAdvisor Travelers' Choice", status: "present", priority: "high",   why: "Ya presente — mantener score >4.5 para que se siga citando." },
];

/* ────────────────────────────────────────────────────────────────────────────
 * F-05 Generador
 * ──────────────────────────────────────────────────────────────────────────── */

export const generatedDrafts: Record<string, GeneratedDraft> = {
  landing: {
    contentType: "landing",
    h1: "Cartagena dentro de la muralla, frente al mar.",
    metaDescription:
      "Hotel boutique de 18 habitaciones en la ciudad amurallada de Cartagena. Diseño de autor, gastronomía local y servicio personalizado a metros del Caribe.",
    sections: [
      { heading: "Quiénes somos", level: 2, body: "Hotel Azul Marino es una casona colonial restaurada en el corazón del Centro Histórico de Cartagena. 18 habitaciones, cada una distinta, todas con la misma idea: que te sientas en una casa, no en un hotel." },
      { heading: "Por qué elegirnos", level: 2, body: "Dentro de la muralla, frente al mar Caribe, con patio interior con piscina, restaurante de cocina local y spa propio. Premiados como uno de los 10 mejores boutiques de Cartagena en 2025." },
      { heading: "Nuestras habitaciones", level: 2, body: "Tres categorías — Superior Vista Ciudad, Suite Junior Vista Mar y Suite Master con Terraza — todas con diseño de autor, baño en mármol y servicio 24h." },
      { heading: "Restaurante Azul", level: 3, body: "Menú de degustación de 7 pasos con producto de pescadores de Bocachica y huerta del Mercado de Bazurto." },
      { heading: "Spa frente al mar", level: 3, body: "Tratamientos con coco, café y arcillas del Caribe. Cabinas individuales y para parejas, con vista al patio." },
    ],
    richSnippetSchema: '{\n  "@context": "https://schema.org",\n  "@type": "Hotel",\n  "name": "Hotel Azul Marino",\n  "starRating": { "@type": "Rating", "ratingValue": "4" },\n  "address": "Calle del Curato 38-42, Cartagena de Indias"\n}',
  },
  blog: {
    contentType: "blog",
    h1: "Dónde hospedarse en Cartagena: la guía honesta de quien vive en la muralla",
    metaDescription:
      "Cómo elegir hotel en Cartagena según el tipo de viaje. Zonas, categorías, qué evitar y por qué dormir dentro de la muralla cambia tu experiencia.",
    sections: [
      { heading: "Las tres zonas que importan", level: 2, body: "Centro Histórico (dentro de la muralla), Getsemaní y Bocagrande. Tres viajes distintos. Si venís por la experiencia cultural, la primera es no negociable." },
      { heading: "Por qué dentro de la muralla", level: 2, body: "Cuando se cierra la puerta del Reloj a las 8 PM, la ciudad cambia. Salís del hotel y estás en la postal, sin tomar taxi. Es la diferencia entre visitar Cartagena y vivirla cuatro días." },
      { heading: "Boutique vs. cadena", level: 3, body: "Una cadena en Bocagrande te da playa privada. Un boutique en el Centro te da contexto. Para un viaje primera vez en Cartagena, recomendamos boutique." },
      { heading: "Qué preguntar antes de reservar", level: 3, body: "¿La habitación da a la calle o al patio? (calle = ruido los viernes), ¿incluye desayuno? (los locales son mejores), ¿hay piscina? (en julio importa), ¿están dentro o fuera del Centro?" },
      { heading: "Nuestra recomendación", level: 2, body: "Si querés probar lo que decimos, Hotel Azul Marino es un boutique de 18 habitaciones dentro de la muralla, con patio y piscina, y un equipo que conoce la ciudad como suya." },
    ],
    richSnippetSchema: '{\n  "@context": "https://schema.org",\n  "@type": "BlogPosting",\n  "headline": "Dónde hospedarse en Cartagena: la guía honesta...",\n  "author": { "@type": "Organization", "name": "Hotel Azul Marino" }\n}',
  },
  faq: {
    contentType: "faq",
    h1: "Preguntas frecuentes sobre tu estadía",
    metaDescription:
      "Todo lo que necesitás saber antes de venir: check-in, política de mascotas, desayuno, traslados desde el aeropuerto y más.",
    sections: [
      { heading: "¿A qué hora es el check-in?", level: 3, body: "15:00. Si llegás antes guardamos tu equipaje y te ofrecemos algo fresco en la terraza mientras esperás." },
      { heading: "¿Aceptan mascotas?", level: 3, body: "Sí, sin costo adicional. Te dejamos cama, plato y un mapa con los lugares pet-friendly del barrio." },
      { heading: "¿Incluye desayuno?", level: 3, body: "Sí, desayuno tropical local servido entre 7:00 y 11:00 en el patio o en tu habitación. Frutas de temporada, jugos recién hechos, panadería del día y opciones saladas." },
      { heading: "¿Cómo llego desde el aeropuerto?", level: 3, body: "Estamos a 15 minutos en taxi (~USD 8) o podemos organizarte transfer privado por USD 25. Avisanos al confirmar tu reserva." },
      { heading: "¿Hay estacionamiento?", level: 3, body: "Sí, gratuito para huéspedes en convenio con el parking del barrio (a 80 metros del hotel). Reservamos el espacio al saber tu llegada." },
    ],
    richSnippetSchema: '{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n    {"@type": "Question", "name": "¿A qué hora es el check-in?", "acceptedAnswer": {"@type": "Answer", "text": "15:00"}}\n  ]\n}',
  },
  service: {
    contentType: "service",
    h1: "Suite Master con Terraza Privada",
    metaDescription:
      "Suite insignia del Hotel Azul Marino — 65 m², terraza privada con jacuzzi al aire libre, mayordomo asignado y vista al mar Caribe.",
    sections: [
      { heading: "La habitación", level: 2, body: "Sesenta y cinco metros cuadrados pensados para parejas que quieren un cuarto que parezca un departamento. Cama king de 200×200, sala con vista, baño en mármol con bañera profunda separada de la ducha." },
      { heading: "La terraza", level: 2, body: "Veinte metros cuadrados privados, con jacuzzi al aire libre, dos reposeras, sombrilla y vista frontal al Caribe. Pedida la noche anterior, podemos servirte el desayuno acá." },
      { heading: "Mayordomo asignado", level: 3, body: "Tu mayordomo personal se presenta al check-in. Te ayuda con reservas de restaurantes, recomendaciones del barrio y cualquier pedido durante la estadía." },
      { heading: "Amenities", level: 3, body: 'Smart TV 55", aire dual, caja fuerte, espresso machine, agua y vino de bienvenida, amenities de baño de autor con coco y café del Caribe.' },
    ],
    richSnippetSchema: '{\n  "@context": "https://schema.org",\n  "@type": "Product",\n  "name": "Suite Master con Terraza Privada",\n  "offers": { "@type": "Offer", "price": "480", "priceCurrency": "USD" }\n}',
  },
};

export const optimizeExample: OptimizeExample = {
  original:
    "Bienvenido al Hotel Azul Marino. Somos un hotel ubicado en Cartagena de Indias, Colombia. Tenemos habitaciones cómodas, un restaurante con comida local y una piscina. El hotel es ideal para parejas y familias que buscan una experiencia inolvidable. Contamos con personal capacitado y atención de calidad.",
  optimized:
    "Hotel Azul Marino es un boutique de 18 habitaciones dentro de la ciudad amurallada de Cartagena, frente al mar Caribe. Diseño de autor en una casona colonial restaurada, restaurante con menú de degustación local de 7 pasos, patio interior con piscina y spa propio. Ideal para parejas, viajes de aniversario y escapadas culturales en el Centro Histórico.",
  improvements: [
    "Reemplazado \"Bienvenido\" genérico por gancho con propuesta de valor concreta",
    "Agregada palabra clave principal: \"dentro de la ciudad amurallada\"",
    "Sustituido \"cómodas\" / \"calidad\" (vacías) por specs verificables (18 habitaciones, casona colonial, 7 pasos)",
    "Incluida intención de búsqueda: \"parejas, aniversario, escapadas culturales\"",
    "Añadida la geo-keyword \"Caribe\" + \"Centro Histórico\" para captura local",
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * F-06 Sugerencias proactivas
 * ──────────────────────────────────────────────────────────────────────────── */

export const initialSuggestions: Suggestion[] = [
  {
    id: "s1",
    title: "Post de blog: \"Cartagena en diciembre — qué esperar y qué llevar\"",
    reason: "seasonality", reasonLabel: "Estacionalidad",
    topic: "cartagena en diciembre qué esperar", contentType: "blog",
    why: "Volumen de búsqueda x3 en los últimos 21 días para queries de diciembre en Cartagena. Tenés disponibilidad en alta temporada.",
  },
  {
    id: "s2",
    title: "FAQ: \"¿Aceptan mascotas en el Hotel Azul Marino?\"",
    reason: "ai_faq", reasonLabel: "Pregunta frecuente en IA",
    topic: "políticas de mascotas hotel azul marino", contentType: "faq",
    why: "ChatGPT y Perplexity recibieron esta pregunta 12 veces este mes — tu ficha actual no responde directamente.",
  },
  {
    id: "s3",
    title: "Landing: \"Hotel con jacuzzi privado en Cartagena\"",
    reason: "opportunity_keyword", reasonLabel: "Keyword de oportunidad",
    topic: "hotel con jacuzzi privado cartagena", contentType: "landing",
    why: "Keyword en posición #8 en GSC con CTR bajo. Una landing dedicada puede subirla al top 3 en 4-6 semanas.",
  },
];

export const suggestionVariants: Record<string, string[]> = {
  s1: [
    "Post de blog: \"5 razones para venir a Cartagena en diciembre (y 2 para no venir)\"",
    "Post de blog: \"Diciembre en Cartagena: clima, eventos y la mejor playa cada día\"",
  ],
  s2: [
    "FAQ: \"Viajar con mascota a Cartagena — la guía completa de Azul Marino\"",
    "FAQ ampliado: \"Mascotas, niños y dietas especiales — políticas de Hotel Azul Marino\"",
  ],
  s3: [
    "Landing: \"Suites con jacuzzi privado — Hotel Azul Marino\"",
    "Landing: \"Escapada de pareja con jacuzzi en la muralla de Cartagena\"",
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * F-07 Reportes
 * ──────────────────────────────────────────────────────────────────────────── */

export const initialReportConfig: ReportConfig = {
  logoUrl: null,
  frequency: "monthly",
  email: "camila@hotelazulmarino.com",
  scheduled: false,
};

export const reportPreview: ReportPreview = {
  period: "Mayo 2026",
  highlights: [
    { label: "Score de visibilidad global", value: "71/100", delta: "+6" },
    { label: "Menciones en IA detectadas",  value: "14",     delta: "+4" },
    { label: "Clics orgánicos",             value: "8.320",  delta: "+21%" },
    { label: "Posición media en Google",    value: "8.4",    delta: "-1.2" },
  ],
  topContents: [
    { title: "Landing: Suite Master con Terraza",       date: "12 may", clicks: 1_840 },
    { title: "Blog: Dónde hospedarse en Cartagena",     date: "04 may", clicks: 1_240 },
    { title: "FAQ: Política de mascotas",               date: "22 may", clicks:   380 },
  ],
  recommendations: [
    "Lanzar landing de \"jacuzzi privado\" para capturar keyword en posición 8",
    "Pitch editorial a Condé Nast — listado de boutiques LATAM 2026",
    "Responder 3 reseñas pendientes en TripAdvisor para mantener autoridad",
  ],
};
