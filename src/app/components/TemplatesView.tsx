import { useState } from "react";
import { Search, Star, ChevronDown } from "lucide-react";
import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";

interface Props {
  navigate: (view: View, siteId?: number) => void;
  openWizard: () => void;
}

type Tier = "free" | "premium" | "empresa";

interface Template {
  id: number;
  name: string;
  desc: string;
  tier: Tier;
  primary: string;
  secondary: string;
  style: string;
  pages: number;
  price: number | null;
  rating: number;
  reviews: number;
}

const templates: Template[] = [
  { id: 1, name: "Academia PX", desc: "Plantilla clásica con hero, galería y sección de habitaciones.", tier: "premium", primary: "#2d1f52", secondary: "#7c4dcc", style: "Luxury",   pages: 8,  price: 29,   rating: 4.9, reviews: 12 },
  { id: 2, name: "Diplomatic 1",           desc: "Elegante y oscuro, ideal para hoteles de lujo urbano.",           tier: "empresa", primary: "#1a1a2e", secondary: "#3d3d6b", style: "Dark",     pages: 12, price: 99,   rating: 4.7, reviews: 8  },
  { id: 3, name: "Plantilla dedicada",     desc: "Diseño limpio y minimalista para escapadas rurales.",             tier: "free",    primary: "#1a3a5c", secondary: "#4a7ab5", style: "Clean",    pages: 6,  price: null, rating: 4.5, reviews: 24 },
  { id: 4, name: "Plantilla para guías",   desc: "Ideal para guías turísticos, tours y actividades al aire libre.", tier: "free",    primary: "#1a3d3a", secondary: "#2e8b7a", style: "Eco",      pages: 5,  price: null, rating: 4.6, reviews: 17 },
  { id: 5, name: "Aurora Stay",            desc: "Boutique con tonos cálidos, dorados y atmósfera íntima.",         tier: "premium", primary: "#3d2a1a", secondary: "#c9a86e", style: "Boutique", pages: 7,  price: 29,   rating: 4.8, reviews: 9  },
  { id: 6, name: "Mar Azul",              desc: "Vibrante y fresco, orientado a la playa y experiencia marina.",    tier: "free",    primary: "#0d2961", secondary: "#0d87d1", style: "Beach",    pages: 6,  price: null, rating: 4.4, reviews: 31 },
  { id: 7, name: "Selva Verde",           desc: "Resort eco con paleta natural y sección de actividades.",          tier: "premium", primary: "#0d1c29", secondary: "#1c6b43", style: "Eco",      pages: 8,  price: 45,   rating: 4.7, reviews: 6  },
  { id: 8, name: "Urban Core",            desc: "Para hoteles de negocios urbanos con diseño moderno y directo.",   tier: "empresa", primary: "#171717", secondary: "#454545", style: "Business", pages: 10, price: 99,   rating: 4.6, reviews: 14 },
];

const HERO_IMG = "https://images.unsplash.com/photo-1729673766571-2409a89a3f64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJlc29ydCUyMHBvb2x8ZW58MXx8fHwxNzc5ODExOTYzfDA&ixlib=rb-4.1.0&q=80&w=1080";
const MES_IMG  = "https://images.unsplash.com/photo-1729717949948-56b52db111dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBob3RlbCUyMHJlc29ydCUyMHBvb2x8ZW58MXx8fHwxNzc5ODExOTYzfDA&ixlib=rb-4.1.0&q=80&w=1080";

const tierConfig: Record<Tier, { label: string; bg: string; color: string }> = {
  free:    { label: "Gratis",  bg: "var(--badge-green-bg)",  color: "var(--badge-green-text)" },
  premium: { label: "Premium", bg: "var(--badge-orange-bg)", color: "var(--badge-orange-text)" },
  empresa: { label: "Empresa", bg: "var(--text-primary)",    color: "#fff" },
};

function TierBadge({ tier }: { tier: Tier }) {
  const cfg = tierConfig[tier];
  return (
    <span className="px-2 h-[18px] flex items-center flex-shrink-0" style={{ background: cfg.bg, borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-xs)", fontWeight: 600, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={10} fill={i <= Math.round(rating) ? "var(--badge-orange-text)" : "none"} style={{ color: "var(--badge-orange-text)" }} />
      ))}
    </span>
  );
}

function WebsiteMockup({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <div style={{ height: 128, overflow: "hidden", background: "#f3f3f3", position: "relative" }}>
      {/* Navbar */}
      <div style={{ height: 17, background: primary, display: "flex", alignItems: "center", padding: "0 8px", gap: 6 }}>
        <div style={{ width: 22, height: 5, background: "rgba(255,255,255,0.85)", borderRadius: 2 }} />
        <div style={{ flex: 1 }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ width: 16, height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 2 }} />
        ))}
      </div>
      {/* Hero */}
      <div style={{ height: 70, background: `linear-gradient(140deg, ${primary}f0, ${secondary}f0)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 7.5, fontWeight: 700, color: "rgba(255,255,255,0.95)", letterSpacing: "0.05em" }}>
          A Best Place To Stay
        </span>
        <div style={{ width: 44, height: 3, background: "rgba(255,255,255,0.3)", borderRadius: 2 }} />
        <div style={{ marginTop: 2, padding: "2px 8px", background: "rgba(255,255,255,0.22)", borderRadius: 3 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 5.5, color: "rgba(255,255,255,0.9)" }}>Reservar ahora</span>
        </div>
      </div>
      {/* Feature blocks */}
      <div style={{ padding: "5px 8px", display: "flex", gap: 5 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ height: 13, background: "#e0e0e0", borderRadius: 3, marginBottom: 3 }} />
            <div style={{ height: 3.5, background: "#ebebeb", borderRadius: 2, width: "70%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

type FilterPlan = "all" | "free" | "premium" | "empresa";

export function TemplatesView({ navigate, openWizard }: Props) {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<FilterPlan>("all");
  const [planOpen, setPlanOpen] = useState(false);

  const planLabels: Record<FilterPlan, string> = { all: "Todos los planes", free: "Gratis", premium: "Premium", empresa: "Empresa" };

  const filtered = templates.filter((t) => {
    const matchesPlan = plan === "all" || t.tier === plan;
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    return matchesPlan && matchesSearch;
  });

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 960, margin: "0 auto" }}>
        <ViewHeader
          backTo="mis-sitios"
          backLabel="Volver a Mis Sitios"
          title="Marketplace de plantillas"
          description="Explorá y descubrí plantillas profesionales para crear sitios web increíbles."
          navigate={navigate}
        />

        {/* Search + filter row */}
        <div className="flex items-center gap-2 mb-5">
          <div
            className="flex items-center gap-2 flex-1 px-3 focus-within:ring-2 focus-within:ring-offset-1"
            style={{
              height: 34,
              background: "var(--surface-card)",
              borderRadius: "var(--radius-nav)",
              border: "0.5px solid var(--border-ui)",
              // @ts-expect-error — CSS custom prop para el ring de Tailwind
              "--tw-ring-color": "var(--brand)",
            }}
          >
            <Search size={12} aria-hidden="true" style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
            <input
              type="search"
              placeholder="Buscar plantillas por nombre, descripción o plan…"
              aria-label="Buscar plantillas"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--font-size-md)", color: "var(--text-primary)" }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setPlanOpen((v) => !v)}
              className="flex items-center gap-2 px-3"
              style={{ height: 34, background: "var(--surface-card)", border: "0.5px solid var(--border-ui)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", color: "var(--text-primary)", whiteSpace: "nowrap" }}
            >
              {planLabels[plan]}
              <ChevronDown size={12} style={{ color: "var(--text-secondary)" }} />
            </button>
            {planOpen && (
              <div className="absolute right-0" style={{ top: 38, zIndex: 50, background: "var(--surface-card)", border: "0.5px solid var(--border-ui)", borderRadius: "var(--radius-card)", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", minWidth: 160, overflow: "hidden", padding: "4px 0" }}>
                {(Object.entries(planLabels) as [FilterPlan, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    className="w-full text-left px-3 h-8 transition-colors hover:opacity-75"
                    style={{ fontSize: "var(--font-size-md)", fontWeight: plan === key ? 600 : 400, color: plan === key ? "var(--accent-info)" : "var(--text-primary)", background: "transparent" }}
                    onClick={() => { setPlan(key); setPlanOpen(false); }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hero section */}
        <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: "1fr 320px" }}>

          {/* Featured card (horizontal) */}
          <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", overflow: "hidden", display: "flex" }}>
            {/* Photo */}
            <div className="relative flex-shrink-0" style={{ width: 240 }}>
              <img
                src={HERO_IMG}
                alt="Plantilla Premium Hotel"
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <span className="absolute top-2 left-2 px-2 h-5 flex items-center" style={{ background: "rgba(0,0,0,0.65)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "#fff" }}>
                Premium
              </span>
              {/* Carousel dots */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ width: i === 1 ? 14 : 5, height: 5, borderRadius: 3, background: i === 1 ? "#fff" : "rgba(255,255,255,0.45)" }} />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-4">
              <p style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                Plantilla Premium Hotel
              </p>
              <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
                Incluye páginas completas del tipo Inicio, Habitaciones, Galería de fotos e Integración con redes sociales.
              </p>

              {/* Stats chips */}
              <div className="flex gap-2 mb-auto">
                {["3 Must-Do Activities", "4 Hrs By Plane", "Full integrations"].map((s) => (
                  <span key={s} className="px-2 h-5 flex items-center" style={{ background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>
                    {s}
                  </span>
                ))}
              </div>

              {/* Price + rating */}
              <div className="flex items-center gap-3 mt-3 mb-3">
                <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>$29</span>
                <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-tertiary)", textDecoration: "line-through" }}>$45</span>
                <div className="flex items-center gap-1">
                  <Stars rating={4.8} />
                  <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>4.8 (9 reseñas)</span>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openWizard}
                  className="flex-1 h-8 transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ background: "var(--brand)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: 500, color: "#fff", border: "none", outlineColor: "var(--brand)", cursor: "pointer" }}
                >
                  Usar plantilla
                </button>
                <button
                  type="button"
                  disabled
                  title="Próximamente"
                  className="flex-1 h-8 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: "transparent", border: "0.5px solid var(--border-ui)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: 500, color: "var(--text-primary)" }}
                >
                  Descargar ahora
                </button>
              </div>
            </div>
          </div>

          {/* Template del Mes */}
          <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div className="relative" style={{ height: 150, flexShrink: 0 }}>
              <img
                src={MES_IMG}
                alt="Plantilla del mes"
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <span className="absolute top-2 left-2 px-2 h-5 flex items-center gap-1" style={{ background: "var(--brand)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "#fff" }}>
                ★ Plantilla del mes
              </span>
            </div>
            <div className="flex flex-col flex-1 p-3">
              <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                Plantilla del mes
              </p>
              <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", lineHeight: 1.6, flex: 1 }}>
                Descubrí la plantilla más popular del mes, elegida por nuestra comunidad de hoteleros.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  <Stars rating={4.8} />
                  <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>4.8 (3 reseñas)</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginLeft: "auto" }}>$13.26</span>
              </div>
              <button
                type="button"
                onClick={openWizard}
                className="w-full mt-2 h-8 transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ background: "var(--brand)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: 500, color: "#fff", border: "none", outlineColor: "var(--brand)", cursor: "pointer" }}
              >
                Usar plantilla
              </button>
            </div>
          </div>
        </div>

        {/* Count */}
        <p className="mb-3" style={{ fontSize: "var(--font-size-md)", color: "var(--text-tertiary)" }}>
          {filtered.length} plantilla{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Grid */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((tpl) => (
            <div key={tpl.id} style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", overflow: "hidden" }}>
              <WebsiteMockup primary={tpl.primary} secondary={tpl.secondary} />
              <div className="px-3 pt-2 pb-3">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <p className="truncate" style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)" }} title={tpl.name}>
                    {tpl.name}
                  </p>
                  <TierBadge tier={tpl.tier} />
                </div>
                <p className="mb-2" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {tpl.desc}
                </p>
                <div className="flex items-center gap-1 mb-2">
                  <Stars rating={tpl.rating} />
                  <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>({tpl.reviews})</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled
                    title="Próximamente"
                    aria-label={`Vista previa de ${tpl.name} (próximamente)`}
                    className="flex-1 h-7 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}
                  >
                    Vista previa
                  </button>
                  <button
                    type="button"
                    onClick={openWizard}
                    aria-label={`Usar plantilla ${tpl.name}${tpl.price ? ` por $${tpl.price}` : ""}`}
                    className="flex-1 h-7 transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                    style={{ background: "var(--brand)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-sm)", fontWeight: 500, color: "#fff", border: "none", outlineColor: "var(--brand)", cursor: "pointer" }}
                  >
                    {tpl.price ? `$${tpl.price}` : "Usar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <p style={{ fontSize: "var(--font-size-lg)", color: "var(--text-tertiary)" }}>Sin resultados para "{search}"</p>
          </div>
        )}
      </div>
    </main>
  );
}
