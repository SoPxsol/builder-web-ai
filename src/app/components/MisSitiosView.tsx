import { useState, useRef, useEffect } from "react";
import { Globe, FileText, Plus, MoreHorizontal, Pencil, Copy, Download, Trash2, Eye, Search, LayoutTemplate } from "lucide-react";
import type { View, Site } from "../types";
import { ViewHeader } from "./ui/view-header";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface Props {
  sites: Site[];
  navigate: (view: View, siteId?: number) => void;
  openWizard: () => void;
  openWizardAt: (step: 1 | 2 | 3 | 4 | 5, site?: Site) => void;
}

function SiteCard({ site, onEdit, onPreview }: { site: Site; onEdit: () => void; onPreview: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isPending = site.status === "pending";
  // En dispositivos touch no hay hover real — mostramos las acciones permanentemente
  // para que sean alcanzables sin gestos extra (sino quedan inaccesibles).
  const isTouch = useMediaQuery("(hover: none)");
  const showActions = (hovered || isTouch) && !isPending;

  useEffect(() => {
    function handleOutside(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [menuOpen]);

  const initial = site.watermark || site.name[0]?.toUpperCase() || "?";
  const thumbGradient = isPending
    ? "linear-gradient(135deg, #e8eaed, #f3f4f6)"
    : `linear-gradient(135deg, ${site.thumbLeft}, ${site.thumbRight})`;

  return (
    <div className="flex flex-col" style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: isPending ? "0.5px dashed var(--status-warning)" : "0.5px solid var(--border-ui)", position: "relative", overflow: "visible" }}>
      {/* Thumbnail */}
      <div
        className="relative flex-shrink-0"
        style={{ height: 108, borderRadius: "var(--radius-card) var(--radius-card) 0 0", overflow: "hidden", cursor: isPending ? "default" : "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={isPending ? undefined : onEdit}
      >
        <div className="absolute inset-0" style={{ background: thumbGradient }} />
        {!isPending && (
          <span className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 44, fontWeight: 800, color: "rgba(255,255,255,0.22)", letterSpacing: "-0.02em", userSelect: "none", fontFamily: "var(--font-sans)" }}>
            {initial}
          </span>
        )}
        {showActions && (
          <div className="absolute inset-0 flex items-center justify-center gap-2" style={{ background: isTouch ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.38)" }}>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} aria-label={`Editar ${site.name}`} className="flex items-center gap-1.5 px-3 h-7 transition-opacity hover:opacity-85" style={{ background: "var(--brand)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: 500, color: "#fff" }}>
              <Pencil size={11} /> Editar
            </button>
            <button onClick={(e) => { e.stopPropagation(); onPreview(); }} aria-label={`Vista previa de ${site.name}`} className="flex items-center gap-1.5 px-3 h-7 transition-opacity hover:opacity-85" style={{ background: "rgba(255,255,255,0.95)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: 500, color: "var(--text-primary)" }}>
              <Eye size={11} /> Vista previa
            </button>
          </div>
        )}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--status-warning)", fontWeight: 500 }}>Setup incompleto</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="px-3 pt-2 pb-3 flex flex-col gap-1" style={{ position: "relative" }}>
        <div className="flex items-center justify-between gap-1">
          <p className="truncate" style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }} title={site.name}>{site.name}</p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isPending ? (
              <span className="px-2 h-[17px] flex items-center" style={{ background: "var(--badge-orange-bg)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-xs)", fontWeight: 500, color: "var(--badge-orange-text)", whiteSpace: "nowrap" }}>pendiente</span>
            ) : (
              <span className="px-2 h-[17px] flex items-center" style={{ background: "#1a1a1a", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-xs)", fontWeight: 500, color: "#ffffff", whiteSpace: "nowrap" }}>activo</span>
            )}
            <div style={{ position: "relative" }} ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Más opciones"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center justify-center transition-colors hover:opacity-70"
                style={{ width: 28, height: 28, borderRadius: "var(--radius-dot)", background: menuOpen ? "var(--surface-page)" : "transparent", border: "none" }}
              >
                <MoreHorizontal size={15} style={{ color: "var(--text-secondary)" }} />
              </button>
              {menuOpen && (
                <div className="absolute" style={{ top: 26, right: 0, zIndex: 100, background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", minWidth: 170, overflow: "hidden", padding: "4px 0" }}>
                  {[{ icon: Pencil, label: "Editar Información" }, { icon: Copy, label: "Duplicar Sitio" }, { icon: Download, label: "Exportar" }].map(({ icon: Icon, label }) => (
                    <button key={label} className="flex items-center gap-2.5 w-full px-3 h-8 transition-colors hover:opacity-80" style={{ background: "transparent", fontSize: "var(--font-size-md)", color: "var(--text-primary)", textAlign: "left" }}>
                      <Icon size={12} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />{label}
                    </button>
                  ))}
                  <div style={{ height: "0.5px", background: "var(--border-ui)", margin: "4px 0" }} />
                  <button className="flex items-center gap-2.5 w-full px-3 h-8 transition-colors hover:opacity-80" style={{ background: "transparent", fontSize: "var(--font-size-md)", color: "var(--destructive)", textAlign: "left" }}>
                    <Trash2 size={12} style={{ color: "var(--destructive)", flexShrink: 0 }} />Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Globe size={10} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
          <span className="truncate" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>{site.domain || "sin dominio"}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <FileText size={10} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>{site.pages ?? 0} páginas</span>
          </div>
          {site.language && (
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)" }}>Aa {site.language}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function MisSitiosView({ sites, navigate, openWizard, openWizardAt }: Props) {
  const [search, setSearch] = useState("");
  const isEmpty = sites.length === 0;

  const filtered = sites.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 1080, margin: "0 auto" }}>
        <ViewHeader
          backTo="dashboard"
          backLabel="Volver al Dashboard"
          title="Mis Sitios"
          description="Todos los sitios web de tu cuenta. Buscá, gestioná y creá nuevos."
          navigate={navigate}
          action={!isEmpty ? (
            <div
              className="flex items-center gap-2 px-3 focus-within:ring-2 focus-within:ring-offset-1"
              style={{
                height: 34,
                background: "var(--surface-card)",
                borderRadius: "var(--radius-nav)",
                border: "0.5px solid var(--border-ui)",
                width: 240,
                // @ts-expect-error — CSS custom prop para el ring de Tailwind
                "--tw-ring-color": "var(--brand)",
              }}
            >
              <Search size={12} aria-hidden="true" style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
              <input
                type="search"
                placeholder="Buscar por nombre o dominio…"
                aria-label="Buscar sitios por nombre o dominio"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "var(--font-size-md)", color: "var(--text-primary)" }}
              />
            </div>
          ) : undefined}
        />


        {/* Creation options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Desde cero */}
          <button
            onClick={openWizard}
            className="flex items-center gap-4 px-5 transition-all hover:opacity-90 group"
            style={{ height: 80, background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", textAlign: "left", cursor: "pointer" }}
          >
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, background: "var(--brand)", borderRadius: "var(--radius-icon)" }}>
              <Plus size={18} style={{ color: "#fff" }} />
            </div>
            <div>
              <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>Nuevo sitio desde cero</p>
              <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}>Empezá con una página en blanco y construí a tu medida.</p>
            </div>
          </button>

          {/* Desde template */}
          <button
            onClick={() => navigate("templates")}
            className="flex items-center gap-4 px-5 transition-all hover:opacity-90 group"
            style={{ height: 80, background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", textAlign: "left", cursor: "pointer" }}
          >
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, background: "var(--surface-page)", borderRadius: "var(--radius-icon)", border: "0.5px solid var(--border-ui)" }}>
              <LayoutTemplate size={18} style={{ color: "var(--text-secondary)" }} />
            </div>
            <div>
              <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>Nuevo sitio desde plantilla</p>
              <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}>Elegí una plantilla profesional y personalizala en minutos.</p>
            </div>
          </button>
        </div>

        {isEmpty ? (
          <p
            className="text-center"
            style={{
              fontSize: "var(--font-size-md)",
              color: "var(--text-secondary)",
              marginTop: 8,
            }}
          >
            Elegí una opción de arriba para crear tu primer sitio.
          </p>
        ) : (
          <>
            {/* Sites section header */}
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Tus sitios ({filtered.length})
              </p>
            </div>

            {/* Sites grid */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  onEdit={() =>
                    site.status === "pending"
                      ? openWizardAt(site.wizardStep ?? 1, site)
                      : navigate("paginas", site.id)
                  }
                  onPreview={() => {}}
                />
              ))}
            </div>

            {filtered.length === 0 && search && (
              <div className="flex flex-col items-center justify-center py-16">
                <p style={{ fontSize: "var(--font-size-lg)", color: "var(--text-tertiary)" }}>Sin resultados para “{search}”</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
