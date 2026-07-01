import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { LayoutGrid, Hotel, BarChart2, Bell, Building2, Rocket, Lock, Menu, Share2, MapPin, BedDouble, MessageSquare, Megaphone, ChevronRight, ChevronLeft } from "lucide-react";
import { useMediaQuery } from "./hooks/useMediaQuery";
import type { View, Site } from "./types";
import { DashboardView } from "./components/DashboardView";
import { MisSitiosView } from "./components/MisSitiosView";
import { TemplatesView } from "./components/TemplatesView";
import { InfoSitioView } from "./components/InfoSitioView";
import { AiView } from "./components/AiView";
import { DiscoveryView } from "./components/DiscoveryView";
import { DatosBasicosView } from "./components/DatosBasicosView";
import { VersionesView } from "./components/VersionesView";
import { BlogView } from "./components/BlogView";
import { PopupsView } from "./components/PopupsView";
import { PromocionesView } from "./components/PromocionesView";
import { InternoView } from "./components/InternoView";
import { IdiomaView } from "./components/IdiomaView";
import { MultilenguajeView } from "./components/MultilenguajeView";
import { PropiedadesView } from "./components/PropiedadesView";
import { IntegracionesView } from "./components/IntegracionesView";
import { PaginasView } from "./components/PaginasView";
import { RedesSocialesView } from "./components/social/RedesSocialesView";
import { GoogleBusinessView } from "./components/marketing/GoogleBusinessView";
import { OTAsView } from "./components/marketing/OTAsView";
import { EmailMarketingView } from "./components/marketing/EmailMarketingView";
import { SeoGeoSuiteView } from "./components/seo-geo/SeoGeoSuiteView";
import { CreateArticleDialog } from "./components/blog/CreateArticleDialog";
import { SiteSwitcher } from "./components/SiteSwitcher";
import type { BlogArticle } from "./types/article";
import { INITIAL_ARTICLES, makeArticle } from "./types/article";
import type { StepIndex, WizardState } from "./types/wizard";
import type { W2State } from "./types/wizard2";
import { w1ToW2Initial } from "./types/wizard2";
import type { PopupState } from "./types/creation";

// Modales lazy-loaded — solo se descargan al abrirlos por primera vez.
// Cada uno arrastra steps/sections que no son necesarios en el initial bundle.
const OnboardingWizard = lazy(() =>
  import("./components/wizard/OnboardingWizard").then((m) => ({ default: m.OnboardingWizard })),
);
const PostOnboardingWizard = lazy(() =>
  import("./components/wizard2/PostOnboardingWizard").then((m) => ({ default: m.PostOnboardingWizard })),
);
const BuilderView = lazy(() =>
  import("./components/builder/BuilderView").then((m) => ({ default: m.BuilderView })),
);
const CreatePopupWizard = lazy(() =>
  import("./components/creation/popup/CreatePopupWizard").then((m) => ({ default: m.CreatePopupWizard })),
);
const CreatePageWizard = lazy(() =>
  import("./components/creation/page/CreatePageWizard").then((m) => ({ default: m.CreatePageWizard })),
);
const ArticleEditorView = lazy(() =>
  import("./components/blog/ArticleEditorView").then((m) => ({ default: m.ArticleEditorView })),
);

const initialSites: Site[] = [
  { id: 1, name: "Hotel Tamarindo",            domain: "tamarindo.com",       stats: "4.218 visitas · 38 reservas", status: "active",  action: "Gestionar →",        thumbLeft: "#1a1a2e", thumbRight: "#e84a2b", watermark: "T", pages: 8,  language: "es" },
  { id: 2, name: "Posada del Mar",             domain: "posadadelmar.com",    stats: "5.104 visitas · 52 reservas", status: "active",  action: "Gestionar →",        thumbLeft: "#0f3361", thumbRight: "#c9a86e", watermark: "P", pages: 6,  language: "es" },
  { id: 3, name: "Suite Central",              domain: "",                    stats: "Paso 2/5 — Identidad visual pendiente", status: "pending", action: "Continuar setup →", thumbLeft: "#c9cdd4", thumbRight: "#e2e5ea", watermark: "S", pages: 0,  language: "es", wizardStep: 2 },
  { id: 4, name: "Diplomatic — Template",      domain: "test.com",            stats: "12 páginas",                  status: "active",  action: "Gestionar →",        thumbLeft: "#3d1f20", thumbRight: "#7a3a30", watermark: "D", pages: 12, language: "es" },
  { id: 5, name: "Aurora Stay — Hotel Boutique", domain: "aurorastay.com",   stats: "6 páginas",                   status: "active",  action: "Gestionar →",        thumbLeft: "#1a365d", thumbRight: "#4a90c4", watermark: "A", pages: 6,  language: "es" },
  { id: 6, name: "Aurora Stay — Hotel Boutique", domain: "aurora2.com",      stats: "5 páginas",                   status: "active",  action: "Gestionar →",        thumbLeft: "#4a1a5d", thumbRight: "#9b59b6", watermark: "A", pages: 5,  language: "en" },
  { id: 7, name: "Hotel Patagonia Chica",      domain: "patagoniachica.com",  stats: "8 páginas",                   status: "active",  action: "Gestionar →",        thumbLeft: "#2d3748", thumbRight: "#6b46c1", watermark: "H", pages: 8,  language: "es" },
  { id: 8, name: "Hotel Juli",                 domain: "hoteljuli.com",       stats: "5 páginas",                   status: "active",  action: "Gestionar →",        thumbLeft: "#1a3a52", thumbRight: "#2980b9", watermark: "H", pages: 5,  language: "es" },
  { id: 9, name: "QA for 1",                   domain: "qa1.test.com",        stats: "3 páginas",                   status: "active",  action: "Gestionar →",        thumbLeft: "#1d4a3a", thumbRight: "#27ae60", watermark: "Q", pages: 3,  language: "es" },
  { id: 10, name: "Sitio Test Renderer",       domain: "renderer.test.com",   stats: "2 páginas",                   status: "active",  action: "Gestionar →",        thumbLeft: "#1a3d3d", thumbRight: "#16a085", watermark: "S", pages: 2,  language: "es" },
];


/**
 * Menú interno — ARQUITECTURA CONCEPTUAL del producto (WEB-737, iteración 01-jul).
 * Modelo flat centrado en Sitio: la app "Sitio" contiene su edición (Generador IA,
 * Plantillas, SEO/GEO, Blog, Popups, Formatos que abren el Editor, Configuración);
 * el resto son canales hermanos (Redes+Linktree, Google My Business, Perfiles OTAs, CRM, ADS).
 *   - Naranja del diagrama = "app con edición" (abre el Editor compartido).
 *   - Gris = para después (Perfiles OTAs, CRM, ADS) → deshabilitado en el nav.
 * ⚠ PROTOTIPO para la discusión de IA con Fernanda/Santi — pendiente card-sort de validación.
 */
type SiteNavItem = { id?: string; label: string; nav?: string; addon?: boolean; disabled?: boolean; app?: boolean; subheader?: boolean; children?: SiteNavItem[] };

/** Hub del rail (nivel 1). `defaultView` = vista a la que navega el clic en el hub.
 *  `children` = sub-nav que aparece en la 2da columna cuando el hub está activo.
 *  Sin children → la 2da columna muestra solo el header del hub (sin saltar el layout). */
type Hub = {
  id: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  defaultView?: View;
  children?: SiteNavItem[];
  disabled?: boolean;
  /** Si true, muestra el selector de sitio activo en la 2da columna */
  showSiteSwitcher?: boolean;
};

// ── Hubs primarios del rail (nivel 1) ────────────────────────────────────────
// Iteración 01-jul (WEB-737): cada hub expone su sub-nav en la 2da columna.
// Hubs grises = "Próximamente" (disabled).
const hubs: Hub[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    Icon: LayoutGrid,
    defaultView: "dashboard",
    // Sin children → no abre 2da columna
  },
  {
    id: "sitios",
    label: "Sitios",
    Icon: Hotel,
    defaultView: "paginas",
    showSiteSwitcher: true,
    children: [
      // Leaf directo (sin grupo)
      { id: "ai", label: "Generador sitios IA" },
      // Grupos con children — actúan como agrupadores que abren el nivel 3
      { id: "grp-formatos", label: "Formatos", children: [
          { id: "fmt-onepage", label: "Sitio one-page", disabled: true },
          { id: "paginas",     label: "Sitio www" },
      ]},
      { id: "grp-contenido", label: "Contenido", children: [
          { id: "templates", label: "Plantillas" },
          { id: "seo",       label: "SEO / GEO" },
          { id: "blog",      label: "Blog" },
          { id: "popups",    label: "Pop-ups" },
      ]},
      { id: "grp-config", label: "Configuración", children: [
          { id: "integraciones", label: "Integración PX" },
          { id: "datos-basicos", label: "Datos del hotel" },
          { id: "dns",           label: "DNS", disabled: true },
      ]},
    ],
  },
  {
    id: "redes",
    label: "Redes Sociales",
    Icon: Share2,
    defaultView: "redes",
    children: [
      { id: "linktree",  label: "Linktree",  disabled: true },
      { id: "instagram", label: "Instagram", nav: "redes" },
      { id: "tiktok",    label: "TikTok",    nav: "redes" },
      { id: "facebook",  label: "Facebook",  nav: "redes" },
    ],
  },
  {
    id: "gmb",
    label: "Google Business",
    Icon: MapPin,
    defaultView: "google-business",
    // Sin children → no abre 2da columna
  },
  {
    id: "perfiles",
    label: "Perfiles OTAs",
    Icon: BedDouble,
    defaultView: "otas",
    disabled: true,
  },
  {
    id: "crm",
    label: "CRM",
    Icon: MessageSquare,
    disabled: true,
    children: [
      { id: "resenas",  label: "Reseñas",          nav: "resenas",  disabled: true },
      { id: "email",    label: "Email Marketing",   nav: "email",    disabled: true },
    ],
  },
  {
    id: "ads",
    label: "ADS",
    Icon: Megaphone,
    defaultView: "ads",
    disabled: true,
  },
];

/** Render de un item hoja del nav. `indent` para las herramientas anidadas dentro de una app. */
function renderNavItem(item: SiteNavItem, indent: boolean, view: View, navigate: (v: View) => void) {
  const padClass = indent ? "pl-6 pr-3" : "px-3";
  if (item.subheader) {
    return (
      <span
        key={item.label}
        className={`block ${indent ? "px-6" : "px-3"} mt-2 mb-0.5 uppercase tracking-wider`}
        style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--site-nav-add)", letterSpacing: "0.06em" }}
      >
        {item.label}
      </span>
    );
  }
  if (item.disabled) {
    const tooltip = item.addon ? "Disponible como módulo adicional" : "Próximamente";
    return (
      <button
        key={item.id}
        type="button"
        disabled
        aria-disabled="true"
        title={tooltip}
        className={`focus-ring-dark flex items-center justify-between ${padClass} h-8 mb-0.5 w-full text-left cursor-not-allowed`}
        style={{ background: "transparent", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", color: "var(--shell-label-inactive)" }}
      >
        <span>{item.label}</span>
        {item.addon && <Lock size={11} aria-hidden="true" style={{ color: "var(--site-nav-add)", flexShrink: 0 }} />}
      </button>
    );
  }
  const target = (item.nav ?? item.id) as View;
  // M2: si el item es un "lanzador" (nav apunta a otra vista, no a su propio id),
  // no lo marcamos activo — así IG/TikTok/Facebook no se resaltan los 3 a la vez.
  const isLauncher = item.nav != null && item.nav !== item.id;
  const active = !isLauncher && view === target;
  return (
    <button
      key={item.id}
      onClick={() => navigate(target)}
      aria-current={active ? "page" : undefined}
      className={`focus-ring-dark flex items-center justify-between ${padClass} h-8 mb-0.5 w-full text-left transition-colors`}
      style={{ background: active ? "var(--shell-item-active-bg)" : "transparent", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: active ? 500 : 400, color: active ? "var(--shell-label-active)" : "var(--shell-label-inactive)" }}
    >
      <span>{item.label}</span>
    </button>
  );
}

// ── Ítems secundarios del rail (abajo del divider, fuera de los 7 hubs) ──────
const railSecondary = [
  { id: "interno",  Icon: Building2, label: "Interno" },
];

/** Mapea la vista activa al id del hub del rail que debe mostrarse activo. */
function getIconActive(view: View): string {
  // Hub Sitios
  if (["ai", "paginas", "editor", "info-sitio", "seo", "discovery", "datos-basicos",
       "versiones", "blog", "popups", "promociones", "idioma", "multilenguaje",
       "propiedades", "integraciones", "templates", "mis-sitios"].includes(view)) return "sitios";
  // Hub Redes Sociales
  if (view === "redes") return "redes";
  // Hub Google My Business
  if (view === "google-business") return "gmb";
  // Hub Perfiles
  if (view === "otas") return "perfiles";
  // Hub CRM
  if (["email", "resenas"].includes(view)) return "crm";
  // Hub ADS
  if (view === "ads") return "ads";
  // Interno (secundario)
  if (view === "interno") return "interno";
  // Default: Dashboard
  return "dashboard";
}

const SITE_VIEWS: View[] = ["paginas", "editor", "info-sitio", "seo", "ai", "discovery", "datos-basicos", "versiones", "blog", "popups", "promociones", "idioma", "multilenguaje", "propiedades", "integraciones", "redes", "google-business", "otas", "email", "resenas", "ads", "templates"];

function isSiteContext(view: View): boolean {
  return SITE_VIEWS.includes(view);
}

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  // Toggle de demo: ?empty=true arranca sin sitios para probar el empty state.
  const [sites] = useState<Site[]>(() => {
    if (typeof window === "undefined") return initialSites;
    const params = new URLSearchParams(window.location.search);
    return params.get("empty") === "true" ? [] : initialSites;
  });
  const [activeSiteId, setActiveSiteId] = useState<number>(initialSites[0]?.id ?? 0);
  // navHovered eliminado en WEB-737 QA. Reintroducido como railHovered para el peek del L1
  // cuando hay un nivel 3 abierto (el rail colapsa a 48px y se expande al hover/focus).
  const [railHovered, setRailHovered] = useState(false);

  // activeGroupId: grupo activo en el nivel 2 del hub Sitios.
  // null → no hay nivel 3 abierto (rail expandido 184px).
  // "grp-formatos" | "grp-contenido" | "grp-config" → hay nivel 3.
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // suppressedGroupRef: cuando el usuario cierra manualmente el L3 (toggle o botón Volver)
  // mientras la vista activa sigue perteneciendo a ese grupo, el useEffect de sincronización
  // lo reabriría. Este ref guarda el id del grupo que debe suprimirse hasta que la view
  // cambie a algo de OTRO grupo (o a un leaf/hub distinto), momento en que se limpia solo.
  const suppressedGroupRef = useRef<string | null>(null);

  // Demo del Wizard 1: ?wizard=true abre el modal de onboarding sobre el shell.
  const [wizardOpen, setWizardOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("wizard") === "true";
  });
  // Permite que un sitio pending retome el W1 en su paso correspondiente.
  const [wizardInitialStep, setWizardInitialStep] = useState<StepIndex | undefined>(undefined);
  const [wizardInitialState, setWizardInitialState] = useState<Partial<WizardState> | undefined>(
    undefined,
  );

  function openWizardAt(step: StepIndex, site?: Site) {
    setWizardInitialStep(step);
    setWizardInitialState(
      site
        ? {
            info: {
              hotelName: site.name,
              domain: site.domain,
              phone: "",
              email: "",
              instagram: "",
              facebook: "",
              whatsapp: "",
              importedFromOTA: false,
            },
          }
        : undefined,
    );
    setWizardOpen(true);
  }
  // Demo del Wizard 2: ?wizard2=true abre el post-onboarding directo.
  const [wizard2Open, setWizard2Open] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("wizard2") === "true";
  });
  // Draft del W2: persiste entre cierres del modal para que el hotelero retome donde dejó.
  const [wizard2Draft, setWizard2Draft] = useState<W2State | null>(null);
  const [wizard2Initial, setWizard2Initial] = useState<Partial<W2State> | undefined>(undefined);
  // Módulo de Creación
  const [createPopupOpen, setCreatePopupOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("createPopup") === "true";
  });
  // Preset opcional para el CreatePopupWizard — usado por el Calendario Comercial
  // para abrir el wizard pre-cargado con countdown / lead capture / exit-intent.
  const [createPopupInitial, setCreatePopupInitial] = useState<Partial<PopupState> | undefined>(undefined);
  function openCreatePopupWith(preset: Partial<PopupState>) {
    setCreatePopupInitial(preset);
    setCreatePopupOpen(true);
  }
  // Abre un wizard de creación directamente en el sitio elegido (acciones
  // rápidas del Dashboard). Setea el sitio activo para que el wizard tome el
  // contexto correcto (dominio, etc.) y luego abre el flujo.
  function openCreateInSite(kind: "article" | "popup" | "page", siteId: number) {
    setActiveSiteId(siteId);
    if (kind === "article") setCreateArticleOpen(true);
    else if (kind === "popup") setCreatePopupOpen(true);
    else setCreatePageOpen(true);
  }
  const [createPageOpen, setCreatePageOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("createPage") === "true";
  });
  const [createArticleOpen, setCreateArticleOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("createArticle") === "true";
  });

  // ── Blog: store de artículos (single source of truth, mockeado en memoria) ──
  // Vive acá para compartirse entre el listado (BlogView) y el editor unificado.
  const [articles, setArticles] = useState<BlogArticle[]>(INITIAL_ARTICLES);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const editingArticle = articles.find((a) => a.id === editingArticleId) ?? null;

  // Simula la persistencia de la creación optimista. En el prototipo, un título
  // que contenga "error" falla a propósito para poder demostrar el estado de
  // error + reintentar de la fila.
  function persistCreation(id: string, title: string) {
    const shouldFail = title.toLowerCase().includes("error");
    window.setTimeout(() => {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, creation: shouldFail ? "error" : undefined } : a,
        ),
      );
    }, 1200);
  }

  function createArticle(title: string) {
    const id = `art-${Date.now()}`;
    const article = makeArticle(id, title, new Date().toISOString());
    // 1) Optimistic update: aparece en la lista al instante, en estado "saving".
    setArticles((prev) => [article, ...prev]);
    // 2) Cerramos el diálogo y ruteamos directo al editor del artículo nuevo.
    setCreateArticleOpen(false);
    setEditingArticleId(id);
    // 3) Disparamos la persistencia (resuelve la fila a asentada o error).
    persistCreation(id, title);
  }

  function retryArticle(id: string) {
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, creation: "saving" } : a)));
    const article = articles.find((a) => a.id === id);
    // Al reintentar quitamos el "error" del título demo para que ahora sí asiente.
    persistCreation(id, (article?.title ?? "").replace(/error/gi, "ok"));
  }

  function patchArticle(id: string, patch: Partial<BlogArticle>) {
    setArticles((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a,
      ),
    );
  }

  function setArticleStatus(id: string, status: BlogArticle["status"]) {
    patchArticle(id, { status });
  }

  function deleteArticle(id: string) {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    if (editingArticleId === id) setEditingArticleId(null);
  }
  // El Builder es un modal full-screen, no una vista del shell.
  const [builderOpen, setBuilderOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("builder") === "true";
  });

  // Responsive: en pantallas <1024px el sidebar secundario se vuelve drawer abrible.
  const isCompact = useMediaQuery("(max-width: 1023px)");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // openSection eliminado en WEB-737: el rail es nivel 1, la 2da col muestra los children del hub activo directo.

  // Cualquier modal abierto debe ocultar el shell del árbol de accesibilidad y de tab order.
  // Los modales se renderizan vía createPortal a document.body — quedan fuera de este ref.
  const shellRef = useRef<HTMLDivElement>(null);
  const anyModalOpen =
    wizardOpen ||
    wizard2Open ||
    createPopupOpen ||
    createPageOpen ||
    createArticleOpen ||
    editingArticleId !== null ||
    builderOpen;
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    if (anyModalOpen) {
      el.setAttribute("inert", "");
      el.setAttribute("aria-hidden", "true");
    } else {
      el.removeAttribute("inert");
      el.removeAttribute("aria-hidden");
    }
  }, [anyModalOpen]);

  // WCAG 3.1.1 — el <html lang> debe reflejar el idioma del sitio activo.
  // Si no hay sitio activo o el código es corto/desconocido, dejamos el del index.html.
  const activeLang = sites.find((s) => s.id === activeSiteId)?.language;
  useEffect(() => {
    if (!activeLang) return;
    const prev = document.documentElement.lang;
    document.documentElement.lang = activeLang;
    return () => { document.documentElement.lang = prev; };
  }, [activeLang]);

  // Sincroniza activeGroupId con la vista activa: si la vista pertenece a un grupo
  // del hub Sitios, abre ese grupo. Si es un leaf directo (ai) o no pertenece a
  // ningún grupo, cierra el nivel 3. Así el deep-link y el back funcionan solos.
  // Respeta suppressedGroupRef: si el usuario cerró manualmente el L3 mientras
  // sigue en una vista de ese grupo, no lo reabre hasta que cambie de contexto.
  useEffect(() => {
    if (iconActive !== "sitios") {
      // Cambio de hub: cerramos L3, limpiamos la supresión y el rail vuelve a 184px.
      suppressedGroupRef.current = null;
      setActiveGroupId(null);
      return;
    }
    const sitiosHub = hubs.find((h) => h.id === "sitios");
    if (!sitiosHub?.children) return;
    let found: string | null = null;
    for (const item of sitiosHub.children) {
      if (item.children) {
        // Es un grupo — buscar si la vista activa es uno de sus hijos
        const match = item.children.find((child) => {
          const target = (child.nav ?? child.id) as string;
          return target === view;
        });
        if (match && item.id) {
          found = item.id;
          break;
        }
      }
    }
    // Si la vista cambió a un grupo DISTINTO al suprimido (o a un leaf sin grupo),
    // el cierre manual ya no aplica: limpiamos la supresión.
    if (found !== suppressedGroupRef.current) {
      suppressedGroupRef.current = null;
    }
    // Si el grupo derivado está suprimido por cierre manual, no reabrimos L3.
    if (found !== null && found === suppressedGroupRef.current) return;
    // Solo actualizamos si cambia (evita loops innecesarios).
    setActiveGroupId((prev) => (prev !== found ? found : prev));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, iconActive]);

  // Datos del trial — TODO: cuando exista el endpoint de subscription, derivar
  // trialDay de (now - trialStartedAt) en días. Mientras, valor fijo de demo.
  const trialDay = 1;
  const trialTotalDays = 14;

  // Handler estable para el draft del W2. Inline `(s) => setWizard2Draft(s)` crearía
  // una referencia nueva en cada render de App, lo que dispararía el useEffect de
  // onChange dentro del W2 → loop → flicker visible al navegar.
  const handleWizard2Change = useCallback((state: W2State) => {
    setWizard2Draft(state);
  }, []);

  // El initialState efectivo: si hay draft, usarlo. Sino, el initial del trigger (W1).
  const effectiveWizard2Initial = wizard2Draft ?? wizard2Initial;

  const hasSites = sites.length > 0;
  const activeSite: Site | undefined = sites.find((s) => s.id === activeSiteId) ?? sites[0];
  // En site-context sin sitios no hay nada que mostrar — caemos al dashboard,
  // que ya tiene su empty state propio.
  const iconActive = getIconActive(view);

  // Hub activo y visibilidad de la 2da columna.
  // A3: cualquier hub primario no-Dashboard muestra la 2da columna (con header del hub),
  // así el layout no salta cuando el hub activo no tiene children.
  // Dashboard queda sin 2da columna (es una vista global, no de sitio).
  const activeHub = hubs.find((h) => h.id === iconActive);
  const showSideNav = !!(activeHub && activeHub.id !== "dashboard" && (activeHub.id !== "sitios" || hasSites));

  // Cierra el nivel 3 manualmente y suprime la reapertura automática mientras
  // la view siga dentro de ese grupo. El useEffect la limpia cuando cambia el contexto.
  function closeLevel3() {
    if (activeGroupId !== null) {
      suppressedGroupRef.current = activeGroupId;
    }
    setActiveGroupId(null);
  }

  function navigate(v: View, siteId?: number) {
    // El editor de página se abre como modal full-screen, no como vista del shell.
    if (v === "editor") {
      if (siteId != null) setActiveSiteId(siteId);
      setBuilderOpen(true);
      return;
    }
    if (isSiteContext(v) && !hasSites) {
      setView("dashboard");
      return;
    }
    setView(v);
    if (siteId != null) setActiveSiteId(siteId);
    // En compact, navegar cierra el drawer mobile.
    if (isCompact && mobileNavOpen) setMobileNavOpen(false);
  }

  function handleIconNav(navId: string) {
    // Ítems secundarios del rail
    if (navId === "interno") {
      setActiveGroupId(null);
      navigate("interno");
      return;
    }
    // Hubs primarios
    const hub = hubs.find((h) => h.id === navId);
    if (!hub || hub.disabled) return;
    // Cambiar a un hub distinto de Sitios cierra el nivel 3 y expande el rail.
    if (navId !== "sitios") setActiveGroupId(null);
    if (hub.defaultView) {
      navigate(hub.defaultView as View);
    } else if (hub.children) {
      // Para hubs con grupos (Sitios), buscar el primer leaf navegable dentro del
      // primer grupo, o el primer leaf directo.
      const firstLeaf = hub.children.reduce<SiteNavItem | null>((acc, item) => {
        if (acc) return acc;
        if (item.children) {
          return item.children.find((c) => c.id && !c.disabled) ?? null;
        }
        return (item.id && !item.disabled) ? item : null;
      }, null);
      if (firstLeaf) navigate((firstLeaf.nav ?? firstLeaf.id) as View);
    }
  }

  return (
    <>
    <div ref={shellRef} className="flex flex-col h-screen w-full overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between h-10 flex-shrink-0 px-3 border-b" style={{ background: "var(--surface-topbar)", borderColor: "var(--border-ui)" }}>
        <div className="flex items-center gap-2">
          {isCompact && showSideNav && (
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Abrir navegación del sitio"
              aria-expanded={mobileNavOpen}
              className="relative flex items-center justify-center transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
              style={{
                width: 44,
                height: 44,
                marginLeft: -8,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                outlineColor: "var(--ring)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: mobileNavOpen ? "var(--surface-page)" : "transparent",
                  borderRadius: 5,
                }}
              >
                <Menu size={14} style={{ color: "var(--text-primary)" }} aria-hidden="true" />
              </span>
            </button>
          )}
          <div className="w-5 h-5 flex-shrink-0" style={{ background: "var(--brand)", borderRadius: "var(--radius-dot)" }} />
          {/* A2: nombre del sitio activo en la topbar — da orientación en cualquier hub */}
          <span className="whitespace-nowrap" style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)" }}>
            PXSOL Web
          </span>
          {activeSite && (
            <span
              className="whitespace-nowrap truncate"
              style={{ fontSize: "var(--font-size-md)", fontWeight: 400, color: "var(--text-secondary)" }}
              aria-label={`Sitio activo: ${activeSite.name}`}
            >
              · {activeSite.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center" style={{ background: "var(--surface-page)", borderRadius: "var(--radius-icon)" }}>
            <Bell size={9} style={{ color: "var(--text-secondary)" }} />
          </div>
          <div className="w-[26px] h-[26px] flex items-center justify-center flex-shrink-0" style={{ background: "var(--avatar-bg)", borderRadius: "var(--radius-badge)" }}>
            <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--avatar-text)" }}>SG</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Rail de hubs (Nivel 1) ────────────────────────────────────────────────
            Desktop: expandido a 184px cuando NO hay nivel 3 abierto.
            Con nivel 3 abierto: colapsa a 48px (solo íconos); al hover/focus-within
            hace "peek" expandiendo a 184px temporalmente.
            Mobile: el rail siempre está visible y expandido (el drawer cubre L2+L3). */}
        <aside
          className="flex flex-col pt-[10px] flex-shrink-0 overflow-hidden"
          onMouseEnter={() => setRailHovered(true)}
          onMouseLeave={() => setRailHovered(false)}
          onFocus={() => setRailHovered(true)}
          onBlur={() => setRailHovered(false)}
          style={{
            background: "var(--shell-icon-bg)",
            // Colapsado a 48px (solo íconos) cuando hay L3 activo en desktop y no hay hover/foco.
            // En mobile siempre expandido: el drawer ya overlay-ea el nav.
            width: (!isCompact && activeGroupId !== null && !railHovered) ? 48 : 184,
            transition: "width 0.18s ease",
            zIndex: 10,
          }}
        >
          {/* ── Hubs primarios (nivel 1) ── */}
          {hubs.map(({ id, Icon, label, disabled }) => {
            const active = iconActive === id;
            // Rail colapsado: ocultamos labels visualmente pero los conservamos para SR.
            const labelsVisible = isCompact || activeGroupId === null || railHovered;
            if (disabled) {
              return (
                // M4: hubs disabled muestran ícono Lock + "· próx." cuando el rail está expandido.
                <button
                  key={id}
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-label={label}
                  title="Próximamente"
                  className="focus-ring-dark flex items-center justify-between mb-1 mx-1.5 cursor-not-allowed"
                  style={{ height: 36, paddingLeft: 10, paddingRight: 10, gap: 10, background: "transparent", borderRadius: "var(--radius-icon)", border: "1.5px solid transparent" }}
                >
                  <span className="flex items-center gap-[10px] min-w-0">
                    <Icon size={15} style={{ color: "var(--shell-label-muted)", flexShrink: 0 }} />
                    <span
                      aria-hidden="true"
                      className="whitespace-nowrap truncate"
                      style={{
                        fontSize: "var(--font-size-md)",
                        color: "var(--shell-label-muted)",
                        opacity: labelsVisible ? 1 : 0,
                        transition: "opacity 0.15s ease",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </span>
                  </span>
                  {labelsVisible && (
                    <span className="flex items-center gap-1 flex-shrink-0" aria-hidden="true">
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--shell-label-muted)" }}>· próx.</span>
                      <Lock size={11} style={{ color: "var(--shell-label-muted)" }} />
                    </span>
                  )}
                </button>
              );
            }
            return (
              <button
                key={id}
                onClick={() => handleIconNav(id)}
                aria-current={active ? "page" : undefined}
                aria-label={label}
                className="focus-ring-dark flex items-center mb-1 mx-1.5 transition-colors"
                style={{
                  height: 36,
                  paddingLeft: 10,
                  paddingRight: 10,
                  gap: 10,
                  background: active ? "var(--shell-item-active-bg)" : "transparent",
                  border: active ? "1.5px solid var(--shell-item-active-border)" : "1.5px solid transparent",
                  borderRadius: "var(--radius-icon)",
                  minWidth: 0,
                }}
              >
                <Icon size={15} style={{ color: active ? "var(--shell-icon-active)" : "var(--shell-icon-inactive)", flexShrink: 0 }} />
                <span
                  aria-hidden="true"
                  className="whitespace-nowrap truncate"
                  style={{
                    fontSize: "var(--font-size-md)",
                    fontWeight: active ? 500 : 400,
                    color: active ? "var(--shell-label-active)" : "var(--shell-label-inactive)",
                    opacity: labelsVisible ? 1 : 0,
                    transition: "opacity 0.15s ease",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}

          {/* ── Divider + ítems secundarios (Interno, Métricas) ── */}
          <div className="mx-3 my-1" style={{ height: 1, background: "var(--shell-separator)" }} />

          {railSecondary.map(({ id, Icon, label }) => {
            const active = iconActive === id;
            const labelsVisible = isCompact || activeGroupId === null || railHovered;
            return (
              <button
                key={id}
                onClick={() => handleIconNav(id)}
                aria-current={active ? "page" : undefined}
                aria-label={label}
                className="focus-ring-dark flex items-center mb-1 mx-1.5 transition-colors"
                style={{
                  height: 36,
                  paddingLeft: 10,
                  paddingRight: 10,
                  gap: 10,
                  background: active ? "var(--shell-item-active-bg)" : "transparent",
                  border: active ? "1.5px solid var(--shell-item-active-border)" : "1.5px solid transparent",
                  borderRadius: "var(--radius-icon)",
                  minWidth: 0,
                }}
              >
                <Icon size={15} style={{ color: active ? "var(--shell-icon-active)" : "var(--shell-icon-inactive)", flexShrink: 0 }} />
                <span
                  aria-hidden="true"
                  className="whitespace-nowrap truncate"
                  style={{
                    fontSize: "var(--font-size-md)",
                    fontWeight: active ? 500 : 400,
                    color: active ? "var(--shell-label-active)" : "var(--shell-label-inactive)",
                    opacity: labelsVisible ? 1 : 0,
                    transition: "opacity 0.15s ease",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}

          {(() => {
            const labelsVisible = isCompact || activeGroupId === null || railHovered;
            return (
              <button
                type="button"
                disabled
                aria-disabled="true"
                aria-label="Métricas"
                title="Próximamente"
                className="focus-ring-dark flex items-center justify-between mx-1.5 cursor-not-allowed"
                style={{ height: 36, paddingLeft: 10, paddingRight: 10, gap: 10, background: "transparent", borderRadius: "var(--radius-icon)", border: "1.5px solid transparent" }}
              >
                <span className="flex items-center gap-[10px] min-w-0">
                  <BarChart2 size={15} style={{ color: "var(--shell-label-muted)", flexShrink: 0 }} />
                  <span
                    aria-hidden="true"
                    className="whitespace-nowrap truncate"
                    style={{
                      fontSize: "var(--font-size-md)",
                      color: "var(--shell-label-muted)",
                      opacity: labelsVisible ? 1 : 0,
                      transition: "opacity 0.15s ease",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Métricas
                  </span>
                </span>
                {labelsVisible && (
                  <span className="flex items-center gap-1 flex-shrink-0" aria-hidden="true">
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--shell-label-muted)" }}>· próx.</span>
                    <Lock size={11} style={{ color: "var(--shell-label-muted)" }} />
                  </span>
                )}
              </button>
            );
          })()}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actualizar plan */}
          <div className="mx-1.5 mb-3">
            <div className="mx-2 mb-2" style={{ height: 1, background: "var(--shell-separator)" }} />
            {(() => {
              const labelsVisible = isCompact || activeGroupId === null || railHovered;
              return (
                <button
                  aria-label="Actualizar plan"
                  className="focus-ring-dark flex items-center w-full overflow-hidden transition-opacity hover:opacity-85"
                  style={{
                    height: 36,
                    paddingLeft: 10,
                    gap: 10,
                    background: "var(--brand)",
                    borderRadius: "var(--radius-icon)",
                    border: "none",
                    minWidth: 0,
                  }}
                >
                  <Rocket size={14} style={{ color: "var(--shell-label-active)", flexShrink: 0 }} />
                  <span
                    aria-hidden="true"
                    className="whitespace-nowrap truncate"
                    style={{
                      fontSize: "var(--font-size-md)",
                      fontWeight: 500,
                      color: "var(--shell-label-active)",
                      opacity: labelsVisible ? 1 : 0,
                      transition: "opacity 0.15s ease",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Actualizar plan
                  </span>
                </button>
              );
            })()}
          </div>
        </aside>

        {/* Backdrop del drawer mobile */}
        {isCompact && showSideNav && mobileNavOpen && (
          <div
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
            style={{
              position: "fixed",
              top: 40,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.3)",
              zIndex: 39,
            }}
          />
        )}

        {/* ── Nivel 2 — sub-nav del hub activo ────────────────────────────────────
            Desktop: columna fija a la derecha del rail.
            Mobile: drawer deslizable (position fixed, overlay del rail).
            Si el hub activo tiene grupos (Sitios), cada grupo se renderiza como
            fila de grupo con chevron. Al hacer click abre el Nivel 3.
            En mobile, los grupos se expanden como acordeón inline. */}
        {showSideNav && (
          <aside
            className="flex flex-col flex-shrink-0 overflow-y-auto"
            style={{
              background: "var(--shell-nav-bg)",
              width: isCompact ? 240 : 192,
              padding: "12px 8px 0",
              ...(isCompact
                ? {
                    position: "fixed",
                    top: 40,
                    left: 0,
                    bottom: 0,
                    zIndex: 40,
                    boxShadow: "4px 0 12px rgba(0,0,0,0.24)",
                    transform: mobileNavOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.2s ease",
                  }
                : {}),
            }}
          >
            {/* Header del hub activo — <h2> para jerarquía semántica */}
            {activeHub && (
              <h2
                style={{
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  margin: 0,
                  marginBottom: 8,
                  paddingLeft: 12,
                  paddingRight: 12,
                }}
              >
                {activeHub.label}
              </h2>
            )}

            {/* Selector de sitio activo — solo hub Sitios */}
            {activeHub?.showSiteSwitcher && (
              <SiteSwitcher
                sites={sites}
                activeSiteId={activeSiteId}
                onSelect={(id) => setActiveSiteId(id)}
                onSeeAll={() => navigate("mis-sitios")}
              />
            )}

            {/* Items del nivel 2.
                Si el item tiene children → es un GRUPO: renderizar como fila de grupo.
                  Desktop: click en grupo cerrado → abre L3 + navega al primer hijo.
                           click en grupo ya abierto → toggle cierre (closeLevel3).
                  Mobile:  click siempre → toggle del acordeón inline.
                Si no tiene children → leaf: renderNavItem como siempre. */}
            {activeHub?.children?.map((item) => {
              if (item.children) {
                // Ítem de grupo
                const isOpen = activeGroupId === item.id;
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!item.id) return;
                        if (isOpen) {
                          // Toggle cierre: aplica en desktop Y en mobile (acordeón).
                          closeLevel3();
                        } else {
                          // Abrir: setear grupo y navegar al primer hijo no-disabled.
                          // Limpiar la supresión del grupo anterior si existía.
                          suppressedGroupRef.current = null;
                          const firstChild = item.children!.find((c) => c.id && !c.disabled);
                          setActiveGroupId(item.id);
                          if (firstChild) navigate((firstChild.nav ?? firstChild.id) as View);
                        }
                      }}
                      aria-expanded={isOpen}
                      aria-label={item.label}
                      className="focus-ring-dark flex items-center justify-between px-3 h-8 mb-0.5 w-full text-left transition-colors"
                      style={{
                        background: isOpen ? "var(--shell-item-active-bg)" : "transparent",
                        borderRadius: "var(--radius-nav)",
                        fontSize: "var(--font-size-md)",
                        fontWeight: isOpen ? 500 : 400,
                        color: isOpen ? "var(--shell-label-active)" : "var(--shell-label-inactive)",
                      }}
                    >
                      <span>{item.label}</span>
                      <ChevronRight
                        size={13}
                        aria-hidden="true"
                        style={{
                          color: isOpen ? "var(--shell-label-active)" : "var(--shell-label-inactive)",
                          flexShrink: 0,
                          // Rota el chevron: en mobile 90° cuando abierto (acordeón);
                          // en desktop siempre apunta a la derecha (indica L3 lateral).
                          transform: isCompact && isOpen ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.15s ease",
                        }}
                      />
                    </button>
                    {/* Mobile: acordeón — ítems del grupo visibles cuando está abierto */}
                    {isCompact && isOpen && (
                      <div style={{ paddingLeft: 8 }}>
                        {item.children.map((child) => renderNavItem(child, true, view, navigate))}
                      </div>
                    )}
                  </div>
                );
              }
              // Leaf directo
              return renderNavItem(item, false, view, navigate);
            })}
          </aside>
        )}

        {/* ── Nivel 3 — detalle del grupo activo (solo desktop, solo hub Sitios) ──
            Se muestra cuando activeGroupId != null y el hub activo es Sitios.
            En mobile el acordeón del Nivel 2 ya muestra los ítems inline. */}
        {!isCompact && activeGroupId !== null && activeHub?.id === "sitios" && (() => {
          const activeGroup = activeHub.children?.find((g) => g.id === activeGroupId);
          if (!activeGroup?.children) return null;
          return (
            <aside
              className="flex flex-col flex-shrink-0 overflow-y-auto"
              style={{
                background: "var(--shell-nav-bg)",
                width: 192,
                padding: "12px 8px 0",
                borderLeft: "1px solid var(--shell-separator)",
              }}
            >
              {/* Botón Volver — cierra el L3 con supresión de reapertura automática */}
              <button
                type="button"
                onClick={closeLevel3}
                aria-label="Volver al nivel anterior"
                className="focus-ring-dark flex items-center gap-1 mb-2 px-3 h-7 w-full text-left transition-colors hover:opacity-80"
                style={{
                  background: "transparent",
                  border: "none",
                  borderRadius: "var(--radius-nav)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--shell-label-inactive)",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={12} aria-hidden="true" style={{ flexShrink: 0 }} />
                <span>Volver</span>
              </button>

              {/* Header del grupo — mismo estilo que el header del Nivel 2 */}
              <h2
                style={{
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  margin: 0,
                  marginBottom: 8,
                  paddingLeft: 12,
                  paddingRight: 12,
                }}
              >
                {activeGroup.label}
              </h2>
              {/* Ítems hoja del grupo */}
              {activeGroup.children.map((child) => renderNavItem(child, false, view, navigate))}
            </aside>
          );
        })()}

        {/* ── Main content ── */}
        {view === "interno"       && <InternoView navigate={navigate} />}
        {view === "dashboard"     && (
          <DashboardView
            sites={sites}
            navigate={navigate}
            openWizard={() => setWizardOpen(true)}
            openWizardAt={openWizardAt}
            wizard2Draft={wizard2Draft}
            openWizard2={() => setWizard2Open(true)}
            openCreatePopupWith={openCreatePopupWith}
            onCreateInSite={openCreateInSite}
            trialDay={trialDay}
            trialTotalDays={trialTotalDays}
          />
        )}
        {view === "mis-sitios"    && (
          <MisSitiosView
            sites={sites}
            navigate={navigate}
            openWizard={() => setWizardOpen(true)}
            openWizardAt={openWizardAt}
          />
        )}
        {view === "templates"     && <TemplatesView navigate={navigate} openWizard={() => setWizardOpen(true)} />}
        {view === "paginas"       && (
          <PaginasView
            siteName={activeSite?.name ?? ""}
            navigate={navigate}
          />
        )}
        {/* view === "editor" → se abre como modal a nivel root (ver más abajo) */}
        {view === "info-sitio"    && <InfoSitioView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "seo"           && <SeoGeoSuiteView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "ai"            && <AiView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "discovery"     && <DiscoveryView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "datos-basicos" && <DatosBasicosView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "versiones"     && <VersionesView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "blog"          && (
          <BlogView
            siteName={activeSite?.name ?? ""}
            navigate={navigate}
            articles={articles}
            onCreate={() => setCreateArticleOpen(true)}
            onEdit={(id) => setEditingArticleId(id)}
            onDelete={deleteArticle}
            onRetry={retryArticle}
            onPublishToggle={(id) => {
              const a = articles.find((x) => x.id === id);
              if (a) setArticleStatus(id, a.status === "published" ? "draft" : "published");
            }}
          />
        )}
        {view === "popups"        && <PopupsView siteName={activeSite?.name ?? ""} navigate={navigate} openCreatePopup={() => setCreatePopupOpen(true)} />}
        {view === "promociones"   && <PromocionesView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "idioma"        && <IdiomaView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "multilenguaje" && <MultilenguajeView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "propiedades"   && <PropiedadesView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "integraciones" && <IntegracionesView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "redes"          && <RedesSocialesView   siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "google-business"&& <GoogleBusinessView  siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "otas"           && <OTAsView            siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "email"          && <EmailMarketingView  siteName={activeSite?.name ?? ""} navigate={navigate} />}
      </div>
    </div>

      {/* Modales lazy: el componente solo se monta (y descarga su chunk) al abrir. */}
      <Suspense fallback={null}>
        {wizardOpen && (
          <OnboardingWizard
            isOpen={wizardOpen}
            initialStep={wizardInitialStep}
            initialState={wizardInitialState}
            onClose={() => {
              setWizardOpen(false);
              setWizardInitialStep(undefined);
              setWizardInitialState(undefined);
            }}
            onComplete={(state) => {
              // Apertura automática del W2 al finalizar W1, pasando los datos ya cargados.
              setWizard2Initial(w1ToW2Initial(state));
              setWizard2Open(true);
            }}
            onGoToWizard2={(state) => {
              // Trigger manual desde el botón "Ir a configuración completa" del Step 5.
              setWizard2Initial(w1ToW2Initial(state));
              setWizard2Open(true);
            }}
          />
        )}

        {wizard2Open && (
          <PostOnboardingWizard
            isOpen={wizard2Open}
            initialState={effectiveWizard2Initial}
            onChange={handleWizard2Change}
            onClose={() => setWizard2Open(false)}
            onPublish={(state) => {
              console.log("Wizard 2 — publicado", state);
              // Tras publicar, limpiamos el draft.
              setWizard2Draft(null);
            }}
          />
        )}

        {createPopupOpen && (
          <CreatePopupWizard
            isOpen={createPopupOpen}
            contextLabel={activeSite?.domain ?? "academiapx.com"}
            initialState={createPopupInitial}
            onClose={() => {
              setCreatePopupOpen(false);
              setCreatePopupInitial(undefined);
            }}
            onPublish={(state) => {
              console.log("Popup creado", state);
            }}
          />
        )}

        {createPageOpen && (
          <CreatePageWizard
            isOpen={createPageOpen}
            contextLabel={activeSite?.domain ?? "academiapx.com"}
            onClose={() => setCreatePageOpen(false)}
            onPublish={(state) => {
              console.log("Página creada", state);
            }}
          />
        )}

        <CreateArticleDialog
          open={createArticleOpen}
          contextLabel={activeSite?.domain ?? "academiapx.com"}
          onCancel={() => setCreateArticleOpen(false)}
          onCreate={createArticle}
        />

        {editingArticle && (
          <ArticleEditorView
            article={editingArticle}
            contextLabel={activeSite?.domain ?? "academiapx.com"}
            onPatch={(patch) => patchArticle(editingArticle.id, patch)}
            onPublish={() => setArticleStatus(editingArticle.id, "published")}
            onUnpublish={() => setArticleStatus(editingArticle.id, "draft")}
            onClose={() => setEditingArticleId(null)}
          />
        )}

        {builderOpen && (
          <BuilderView
            isOpen={builderOpen}
            onClose={() => setBuilderOpen(false)}
          />
        )}
      </Suspense>
    </>
  );
}
