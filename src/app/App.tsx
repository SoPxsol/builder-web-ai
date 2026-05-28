import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { LayoutGrid, Hotel, BarChart2, Bell, Building2, Rocket, Lock, Menu } from "lucide-react";
import { useMediaQuery } from "./hooks/useMediaQuery";
import type { View, Site } from "./types";
import { DashboardView } from "./components/DashboardView";
import { MisSitiosView } from "./components/MisSitiosView";
import { TemplatesView } from "./components/TemplatesView";
import { InfoSitioView } from "./components/InfoSitioView";
import { SeoGeoView } from "./components/SeoGeoView";
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
import { SiteSwitcher } from "./components/SiteSwitcher";
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
const CreateArticleWizard = lazy(() =>
  import("./components/creation/article/CreateArticleWizard").then((m) => ({ default: m.CreateArticleWizard })),
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


// Group 1: content tools (most used)
const siteNavPrimary = [
  { id: "paginas",     label: "Páginas",        addon: false, disabled: false },
  { id: "blog",        label: "Blog",           addon: false, disabled: false },
  { id: "popups",      label: "Pop-ups",        addon: false, disabled: false },
  { id: "promociones", label: "Promociones",    addon: false, disabled: false },
  { id: "redes",       label: "Redes Sociales", addon: true,  disabled: true  },
] as const;

// Group 2: site configuration
const siteNavSettings = [
  { id: "seo",            label: "SEO",                    badge: null, disabled: false },
  { id: "info-sitio",     label: "Información del sitio",  badge: null, disabled: false },
  { id: "ai",             label: "AI",                     badge: null, disabled: false },
  { id: "discovery",      label: "Discovery",              badge: null, disabled: false },
  { id: "datos-basicos",  label: "Datos básicos",          badge: null, disabled: false },
  { id: "idioma",         label: "Idioma",                 badge: null, disabled: false },
  { id: "multilenguaje",  label: "Multilenguaje",          badge: null, disabled: false },
  { id: "propiedades",    label: "Propiedades",            badge: null, disabled: false },
  { id: "integraciones",  label: "Integraciones",          badge: null, disabled: false },
] as const;

// Group 3: least used
const siteNavBottom = [
  { id: "versiones", label: "Versiones", badge: null, disabled: false },
] as const;

const iconNavItems = [
  { id: "dashboard", Icon: LayoutGrid, label: "Dashboard", views: ["dashboard", "onboarding"] as View[] },
  { id: "hotel",     Icon: Hotel,      label: "Mis Sitios", views: ["mis-sitios", "paginas", "editor", "seo", "blog"] as View[] },
  { id: "interno",   Icon: Building2,  label: "Interno",    views: ["interno"] as View[] },
];

function getIconActive(view: View): string {
  if (SITE_VIEWS.includes(view) || view === "mis-sitios") return "hotel";
  if (view === "interno") return "interno";
  return "dashboard";
}

const SITE_VIEWS: View[] = ["paginas", "editor", "info-sitio", "seo", "ai", "discovery", "datos-basicos", "versiones", "blog", "popups", "promociones", "idioma", "multilenguaje", "propiedades", "integraciones"];

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
  const [navHovered, setNavHovered] = useState(false);
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
  const [createPageOpen, setCreatePageOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("createPage") === "true";
  });
  const [createArticleOpen, setCreateArticleOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("createArticle") === "true";
  });
  // El Builder es un modal full-screen, no una vista del shell.
  const [builderOpen, setBuilderOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("builder") === "true";
  });

  // Responsive: en pantallas <1024px el sidebar secundario se vuelve drawer abrible.
  const isCompact = useMediaQuery("(max-width: 1023px)");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Cualquier modal abierto debe ocultar el shell del árbol de accesibilidad y de tab order.
  // Los modales se renderizan vía createPortal a document.body — quedan fuera de este ref.
  const shellRef = useRef<HTMLDivElement>(null);
  const anyModalOpen =
    wizardOpen || wizard2Open || createPopupOpen || createPageOpen || createArticleOpen || builderOpen;
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
  const siteContext = isSiteContext(view) && hasSites;
  const iconActive = getIconActive(view);

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
    if (navId === "dashboard") navigate("dashboard");
    else if (navId === "hotel") navigate("mis-sitios");
    else if (navId === "interno") navigate("interno");
  }

  return (
    <>
    <div ref={shellRef} className="flex flex-col h-screen w-full overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between h-10 flex-shrink-0 px-3 border-b" style={{ background: "var(--surface-topbar)", borderColor: "var(--border-ui)" }}>
        <div className="flex items-center gap-2">
          {isCompact && siteContext && (
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
          <span className="whitespace-nowrap" style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)" }}>
            PXSOL Web
          </span>
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
        {/* ── Icon sidebar (expands on hover to reveal labels) ── */}
        <aside
          onMouseEnter={() => setNavHovered(true)}
          onMouseLeave={() => setNavHovered(false)}
          className="flex flex-col pt-[10px] flex-shrink-0 overflow-hidden"
          style={{
            background: "var(--shell-icon-bg)",
            width: navHovered ? 152 : 48,
            transition: "width 0.2s ease",
            zIndex: 10,
          }}
        >
          {iconNavItems.map(({ id, Icon, label }) => {
            const active = iconActive === id;
            return (
              <button
                key={id}
                onClick={() => handleIconNav(id)}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className="focus-ring-dark flex items-center mb-1 mx-1.5 transition-colors"
                style={{
                  height: 36,
                  paddingLeft: 10,
                  gap: 10,
                  background: active ? "var(--shell-item-active-bg)" : "transparent",
                  border: active ? "1.5px solid var(--shell-item-active-border)" : "1.5px solid transparent",
                  borderRadius: "var(--radius-icon)",
                  minWidth: 0,
                }}
              >
                <Icon size={15} style={{ color: active ? "var(--shell-icon-active)" : "var(--shell-icon-inactive)", flexShrink: 0 }} />
                <span
                  className="whitespace-nowrap"
                  style={{
                    fontSize: "var(--font-size-md)",
                    fontWeight: active ? 500 : 400,
                    color: active ? "var(--shell-label-active)" : "var(--shell-label-inactive)",
                    opacity: navHovered ? 1 : 0,
                    transition: navHovered ? "opacity 0.15s ease 0.08s" : "opacity 0.08s ease",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}

          <div className="mx-3 my-1" style={{ height: 1, background: "var(--shell-separator)" }} />

          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Próximamente"
            className="focus-ring-dark flex items-center mx-1.5 cursor-not-allowed"
            style={{ height: 36, paddingLeft: 10, gap: 10, background: "transparent", borderRadius: "var(--radius-icon)", border: "1.5px solid transparent" }}
          >
            <BarChart2 size={15} style={{ color: "var(--shell-label-muted)", flexShrink: 0 }} />
            <span
              className="whitespace-nowrap"
              style={{
                fontSize: "var(--font-size-md)",
                color: "var(--shell-label-muted)",
                opacity: navHovered ? 1 : 0,
                transition: navHovered ? "opacity 0.15s ease 0.08s" : "opacity 0.08s ease",
              }}
            >
              Métricas <span style={{ fontSize: "var(--font-size-xs)" }}>· próx.</span>
            </span>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actualizar plan */}
          <div className="mx-1.5 mb-3">
            <div className="mx-2 mb-2" style={{ height: 1, background: "var(--shell-separator)" }} />
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
                className="whitespace-nowrap"
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: 500,
                  color: "var(--shell-label-active)",
                  opacity: navHovered ? 1 : 0,
                  transition: navHovered ? "opacity 0.15s ease 0.08s" : "opacity 0.08s ease",
                }}
              >
                Actualizar plan
              </span>
            </button>
          </div>
        </aside>

        {/* Backdrop del drawer mobile */}
        {isCompact && siteContext && mobileNavOpen && (
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

        {/* ── Secondary sidebar — site-context views only ── */}
        {siteContext && (
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
            {/* Site selector */}
            <span className="uppercase tracking-wider px-1 mb-1.5" style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--site-nav-section)", letterSpacing: "0.06em" }}>
              Sitio activo
            </span>
            <SiteSwitcher
              sites={sites}
              activeSiteId={activeSiteId}
              onSelect={(id) => setActiveSiteId(id)}
              onSeeAll={() => navigate("mis-sitios")}
            />

            {/* Group 1: content tools */}
            {siteNavPrimary.map((item) => {
              if (item.disabled) {
                const tooltip = item.addon
                  ? "Disponible como módulo adicional"
                  : "No disponible";
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled
                    aria-disabled="true"
                    title={tooltip}
                    className="focus-ring-dark flex items-center justify-between px-3 h-8 mb-0.5 w-full text-left cursor-not-allowed"
                    style={{ background: "transparent", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", color: "var(--shell-label-inactive)" }}
                  >
                    <span>{item.label}</span>
                    {item.addon && (
                      <Lock
                        size={11}
                        aria-hidden="true"
                        style={{ color: "var(--site-nav-add)", flexShrink: 0 }}
                      />
                    )}
                  </button>
                );
              }
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id as View)}
                  aria-current={active ? "page" : undefined}
                  className="focus-ring-dark flex items-center justify-between px-3 h-8 mb-0.5 w-full text-left transition-colors"
                  style={{ background: active ? "var(--shell-item-active-bg)" : "transparent", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: active ? 500 : 400, color: active ? "var(--shell-label-active)" : "var(--shell-label-inactive)" }}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Divider */}
            <div className="mx-1 my-2" style={{ height: 1, background: "var(--site-nav-separator)" }} />

            {/* Group 2: site configuration */}
            {siteNavSettings.map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id as View)}
                  aria-current={active ? "page" : undefined}
                  className="focus-ring-dark w-full text-left px-3 h-8 mb-0.5 transition-colors"
                  style={{ background: active ? "var(--shell-item-active-bg)" : "transparent", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: active ? 500 : 400, color: active ? "var(--shell-label-active)" : "var(--shell-label-inactive)" }}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Divider */}
            <div className="mx-1 my-2" style={{ height: 1, background: "var(--site-nav-separator)" }} />

            {/* Group 3: versiones */}
            {siteNavBottom.map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id as View)}
                  aria-current={active ? "page" : undefined}
                  className="focus-ring-dark w-full text-left px-3 h-8 mb-0.5 transition-colors"
                  style={{ background: active ? "var(--shell-item-active-bg)" : "transparent", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: active ? 500 : 400, color: active ? "var(--shell-label-active)" : "var(--shell-label-inactive)" }}
                >
                  {item.label}
                </button>
              );
            })}
          </aside>
        )}

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
        {view === "seo"           && <SeoGeoView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "ai"            && <AiView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "discovery"     && <DiscoveryView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "datos-basicos" && <DatosBasicosView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "versiones"     && <VersionesView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "blog"          && <BlogView siteName={activeSite?.name ?? ""} navigate={navigate} openCreateArticle={() => setCreateArticleOpen(true)} />}
        {view === "popups"        && <PopupsView siteName={activeSite?.name ?? ""} navigate={navigate} openCreatePopup={() => setCreatePopupOpen(true)} />}
        {view === "promociones"   && <PromocionesView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "idioma"        && <IdiomaView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "multilenguaje" && <MultilenguajeView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "propiedades"   && <PropiedadesView siteName={activeSite?.name ?? ""} navigate={navigate} />}
        {view === "integraciones" && <IntegracionesView siteName={activeSite?.name ?? ""} navigate={navigate} />}
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

        {createArticleOpen && (
          <CreateArticleWizard
            isOpen={createArticleOpen}
            contextLabel={activeSite?.domain ?? "academiapx.com"}
            onClose={() => setCreateArticleOpen(false)}
            onPublish={(state) => {
              console.log("Artículo creado", state);
            }}
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
