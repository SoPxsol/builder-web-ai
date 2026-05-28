import { useState } from "react";
import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";
import { ConfirmDestructiveDialog } from "./ui/confirm-destructive-dialog";

interface Version {
  id: number;
  label: string;
  date: string;
  author: string;
  tag: "actual" | null;
}

const versions: Version[] = [
  { id: 1, label: "Versión actual",            date: "26 may 2026 · 14:32", author: "Sofía G.", tag: "actual" },
  { id: 2, label: "Antes de cambios de mayo",  date: "18 may 2026 · 09:11", author: "Sofía G.", tag: null },
  { id: 3, label: "Rediseño homepage",         date: "2 may 2026 · 16:45",  author: "Sofía G.", tag: null },
  { id: 4, label: "Versión inicial",            date: "14 abr 2026 · 11:00", author: "Sofía G.", tag: null },
];

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

export function VersionesView({ siteName, navigate }: Props) {
  const [pendingRestore, setPendingRestore] = useState<Version | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function confirmRestore() {
    if (!pendingRestore) return;
    setFeedback(`Versión "${pendingRestore.label}" restaurada`);
    setPendingRestore(null);
    setTimeout(() => setFeedback(null), 3000);
  }

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 860, margin: "0 auto" }}>
        <ViewHeader
          backTo="paginas"
          eyebrow={siteName}
          title="Versiones"
          description="Historial de cambios publicados. Podés restaurar versiones anteriores."
          navigate={navigate}
        />

        {feedback && (
          <div
            role="status"
            aria-live="polite"
            className="mb-3 px-3 h-7 flex items-center"
            style={{ background: "var(--badge-green-bg)", color: "var(--badge-green-text)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-sm)", fontWeight: 500 }}
          >
            ✓ {feedback}
          </div>
        )}

        <div className="flex flex-col gap-1">
          {versions.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between px-4"
              style={{ background: "var(--surface-card)", borderRadius: "var(--radius-item)", border: "0.5px solid var(--border-ui)", height: 52 }}
            >
              <div className="flex items-center gap-3">
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: v.tag === "actual" ? "var(--status-active)" : "var(--border-ui)", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "var(--font-size-lg)", fontWeight: v.tag === "actual" ? 500 : 400, color: "var(--text-primary)", lineHeight: 1.3 }}>{v.label}</p>
                  <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>{v.date} · {v.author}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {v.tag === "actual" && (
                  <span className="px-2 h-[18px] flex items-center" style={{ background: "var(--badge-green-bg)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-xs)", fontWeight: 500, color: "var(--badge-green-text)" }}>
                    Actual
                  </span>
                )}
                {v.tag !== "actual" && (
                  <button
                    type="button"
                    onClick={() => setPendingRestore(v)}
                    aria-label={`Restaurar versión: ${v.label}`}
                    className="px-3 h-6 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                    style={{ background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", outlineColor: "var(--ring)", cursor: "pointer" }}
                  >
                    Restaurar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <ConfirmDestructiveDialog
          open={pendingRestore !== null}
          title="Restaurar versión"
          description="Vas a reemplazar la versión publicada actual del sitio por:"
          resourceName={pendingRestore?.label}
          cancelLabel="Cancelar"
          confirmLabel="Restaurar versión"
          onCancel={() => setPendingRestore(null)}
          onConfirm={confirmRestore}
        />
      </div>
    </main>
  );
}
