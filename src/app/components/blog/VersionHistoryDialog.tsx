import { useEffect, useRef } from "react";
import { History, RotateCcw, X } from "lucide-react";
import type { ArticleVersion } from "../../types/article";

interface Props {
  versions: ArticleVersion[];
  onRestore: (version: ArticleVersion) => void;
  onClose: () => void;
}

/**
 * VersionHistoryDialog — historial de versiones del artículo.
 *
 * Lista las versiones guardadas (más reciente primero) y permite restaurar
 * cualquiera. Las versiones se crean al publicar/actualizar (ver
 * ArticleEditorView). Mock: en el prototipo viven en el objeto del artículo.
 */
export function VersionHistoryDialog({ versions, onRestore, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Historial de versiones"
        className="flex flex-col"
        style={{
          width: "min(520px, 92vw)",
          maxHeight: "80vh",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
          overflow: "hidden",
          fontFamily: "var(--font-sans)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ padding: "16px 18px", borderBottom: "0.5px solid var(--border-ui)", flexShrink: 0 }}
        >
          <span className="flex items-center" style={{ gap: 8, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
            <History size={16} aria-hidden="true" />
            Historial de versiones
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex items-center justify-center transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{ width: 28, height: 28, background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", outlineColor: "var(--accent-info)" }}
          >
            <X size={15} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
          </button>
        </div>

        {/* Lista / estado vacío */}
        <div className="flex-1 overflow-y-auto" style={{ padding: versions.length ? 8 : 0 }}>
          {versions.length === 0 ? (
            <p style={{ padding: "40px 28px", textAlign: "center", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              No hay versiones guardadas aún. Las versiones se guardan
              automáticamente al publicar.
            </p>
          ) : (
            versions.map((v, i) => (
              <div
                key={v.id}
                className="flex items-center justify-between"
                style={{
                  padding: "12px 12px",
                  borderRadius: 8,
                  borderBottom: i < versions.length - 1 ? "0.5px solid var(--border-ui)" : "none",
                  gap: 12,
                }}
              >
                <div className="flex flex-col min-w-0" style={{ gap: 3 }}>
                  <span className="flex items-center" style={{ gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{v.label}</span>
                    {i === 0 && (
                      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--status-active)", background: "var(--badge-green-bg)", padding: "1px 7px", borderRadius: 10 }}>
                        Actual
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                    {formatStamp(v.savedAt)} · {v.snapshot.blocks.length} bloques
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRestore(v)}
                  className="flex items-center flex-shrink-0 transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                  style={{
                    gap: 6, height: 28, padding: "0 11px", background: "transparent",
                    border: "0.5px solid var(--border-ui)", borderRadius: 6, fontSize: 11, fontWeight: 600,
                    color: "var(--text-secondary)", cursor: "pointer", outlineColor: "var(--accent-info)",
                  }}
                >
                  <RotateCcw size={12} aria-hidden="true" />
                  Restaurar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function formatStamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
