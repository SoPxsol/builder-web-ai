import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Search, X, type LucideIcon } from "lucide-react";
import type { Site } from "../types";

interface Props {
  /** Acción elegida: a dónde se navega y cómo se titula. */
  action: { label: string; Icon: LucideIcon };
  /** Sitios candidatos (ya filtrados a los que pueden recibir la acción). */
  sites: Site[];
  onPick: (siteId: number) => void;
  onClose: () => void;
}

/**
 * SitePickerDialog — selector de sitio para las acciones rápidas del Dashboard.
 *
 * Las acciones rápidas (Blog, Pop-ups, etc.) viven dentro del contexto de un
 * sitio. Como desde el Dashboard no hay sitio activo, este diálogo pregunta
 * "¿en qué sitio?" antes de navegar.
 */
export function SitePickerDialog({ action, sites, onPick, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.domain ?? "").toLowerCase().includes(q),
    );
  }, [sites, query]);

  const { Icon, label } = action;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Ir a ${label}: elegí el sitio`}
        className="flex flex-col"
        style={{
          width: "min(440px, 100%)",
          maxHeight: "78vh",
          background: "var(--surface-card)",
          borderRadius: 12,
          boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
          overflow: "hidden",
          fontFamily: "var(--font-sans)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between"
          style={{ padding: "16px 18px 12px", borderBottom: "0.5px solid var(--border-ui)", flexShrink: 0 }}
        >
          <div className="flex items-center" style={{ gap: 10 }}>
            <span
              aria-hidden="true"
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 34, height: 34, background: "var(--accent-info-bg)", borderRadius: "var(--radius-icon)", color: "var(--accent-info)" }}
            >
              <Icon size={17} />
            </span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Ir a {label}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                ¿En qué sitio?
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex items-center justify-center transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{ width: 28, height: 28, background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", outlineColor: "var(--accent-info)", flexShrink: 0 }}
          >
            <X size={15} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
          </button>
        </div>

        {/* Buscador (si hay varios sitios) */}
        {sites.length > 5 && (
          <div style={{ padding: "10px 14px", borderBottom: "0.5px solid var(--border-ui)", flexShrink: 0 }}>
            <label
              className="flex items-center"
              style={{ background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 6, padding: "0 8px", gap: 6, height: 32 }}
            >
              <Search size={12} aria-hidden="true" style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar sitio"
                aria-label="Buscar sitio"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 12, color: "var(--text-primary)", fontFamily: "inherit", minWidth: 0 }}
              />
            </label>
          </div>
        )}

        {/* Lista de sitios */}
        <div className="flex-1 overflow-y-auto" style={{ padding: 8 }}>
          {filtered.length === 0 ? (
            <p style={{ padding: "28px 16px", textAlign: "center", fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
              {sites.length === 0
                ? "No tenés sitios activos todavía."
                : `Sin resultados para "${query}".`}
            </p>
          ) : (
            filtered.map((site) => (
              <button
                key={site.id}
                type="button"
                onClick={() => onPick(site.id)}
                className="flex items-center w-full transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                style={{ padding: "9px 10px", background: "transparent", border: "none", borderRadius: 8, cursor: "pointer", gap: 11, textAlign: "left", outlineColor: "var(--accent-info)" }}
              >
                <span
                  aria-hidden="true"
                  className="flex-shrink-0"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: `linear-gradient(140deg, ${site.thumbLeft}, ${site.thumbRight})`,
                  }}
                />
                <span className="flex flex-col flex-1 min-w-0" style={{ gap: 1 }}>
                  <span className="truncate" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {site.name}
                  </span>
                  <span className="truncate" style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                    {site.domain || "sin dominio"}
                  </span>
                </span>
                <ChevronRight size={15} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} aria-hidden="true" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
