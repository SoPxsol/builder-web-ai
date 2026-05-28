import { useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";
import { ConfirmDestructiveDialog } from "./ui/confirm-destructive-dialog";

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

interface LangEntry {
  id: number;
  code: string;
  label: string;
  active: boolean;
  isPrimary: boolean;
}

const initialLangs: LangEntry[] = [
  { id: 1, code: "es", label: "Español (principal)",    active: true,  isPrimary: true  },
  { id: 2, code: "en", label: "English",                active: true,  isPrimary: false },
  { id: 3, code: "pt", label: "Português",              active: false, isPrimary: false },
];

const available = [
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "zh", label: "中文" },
];

export function MultilenguajeView({ siteName, navigate }: Props) {
  const [langs, setLangs] = useState<LangEntry[]>(initialLangs);
  const [enabled, setEnabled] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<LangEntry | null>(null);

  function toggle(id: number) {
    setLangs((prev) => prev.map((l) => l.id === id && !l.isPrimary ? { ...l, active: !l.active } : l));
  }

  function confirmRemove() {
    if (!pendingDelete) return;
    setLangs((prev) => prev.filter((l) => l.id !== pendingDelete.id || l.isPrimary));
    setPendingDelete(null);
  }

  function addLang(code: string, label: string) {
    if (langs.some((l) => l.code === code)) return;
    setLangs((prev) => [...prev, { id: Date.now(), code, label, active: false, isPrimary: false }]);
  }

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 600, margin: "0 auto" }}>
        <ViewHeader
          backTo="paginas"
          eyebrow={siteName}
          title="Multilenguaje"
          description="Activá idiomas para llegar a visitantes que no hablan español."
          navigate={navigate}
          action={
            <button
              onClick={() => setEnabled((v) => !v)}
              className="flex items-center gap-2 px-3 h-8 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ background: enabled ? "var(--badge-green-bg)" : "var(--badge-neutral-bg)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: 500, color: enabled ? "var(--badge-green-text)" : "var(--text-secondary)", border: "none", outlineColor: "var(--accent-info)", cursor: "pointer" }}
              aria-pressed={enabled}
            >
              {enabled ? <ToggleRight size={14} aria-hidden="true" style={{ color: "var(--badge-green-text)" }} /> : <ToggleLeft size={14} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />}
              {enabled ? "Activado" : "Desactivado"}
            </button>
          }
        />

        <div style={{ opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? "auto" : "none" }}>
        {/* Active languages */}
        <div className="mb-3" style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", overflow: "hidden" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-ui)" }}>
            <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>Idiomas del sitio</p>
            <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 2 }}>El idioma principal no se puede desactivar ni eliminar.</p>
          </div>
          {langs.map((lang, i) => (
            <div
              key={lang.id}
              className="flex items-center justify-between px-4"
              style={{ height: 48, borderTop: i > 0 ? "0.5px solid var(--border-ui)" : "none" }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-primary)", fontWeight: lang.isPrimary ? 500 : 400 }}>{lang.label}</span>
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)", fontFamily: "monospace" }}>{lang.code}</span>
                {lang.isPrimary && (
                  <span className="px-2 h-[16px] flex items-center" style={{ background: "var(--badge-blue-bg)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-xs)", fontWeight: 500, color: "var(--badge-blue-text)" }}>
                    Principal
                  </span>
                )}
              </div>
              {!lang.isPrimary && (
                <div className="flex items-center gap-2">
                  <button onClick={() => toggle(lang.id)} className="transition-opacity hover:opacity-70">
                    {lang.active
                      ? <ToggleRight size={16} style={{ color: "var(--status-active)" }} />
                      : <ToggleLeft  size={16} style={{ color: "var(--text-secondary)" }} />}
                  </button>
                  <button
                    onClick={() => setPendingDelete(lang)}
                    aria-label={`Eliminar idioma ${lang.label}`}
                    className="flex items-center justify-center transition-opacity hover:opacity-70"
                    style={{ width: 24, height: 24, background: "var(--surface-page)", borderRadius: "var(--radius-dot)", border: "0.5px solid var(--border-ui)" }}
                  >
                    <Trash2 size={11} style={{ color: "var(--text-secondary)" }} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add language */}
        <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", overflow: "hidden" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-ui)" }}>
            <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>Agregar idioma</p>
          </div>
          {available.map((lang, i) => {
            const already = langs.some((l) => l.code === lang.code);
            return (
              <div key={lang.code} className="flex items-center justify-between px-4" style={{ height: 44, borderTop: i > 0 ? "0.5px solid var(--border-ui)" : "none", opacity: already ? 0.4 : 1 }}>
                <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-primary)" }}>{lang.label}</span>
                <button
                  disabled={already}
                  onClick={() => addLang(lang.code, lang.label)}
                  className="flex items-center gap-1 px-3 h-6 transition-opacity hover:opacity-75"
                  style={{ background: already ? "var(--badge-neutral-bg)" : "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-sm)", color: already ? "var(--text-tertiary)" : "var(--text-secondary)", cursor: already ? "default" : "pointer" }}
                >
                  <Plus size={10} />{already ? "Agregado" : "Agregar"}
                </button>
              </div>
            );
          })}
        </div>
        </div>
      </div>

      <ConfirmDestructiveDialog
        open={pendingDelete !== null}
        title="Eliminar idioma del sitio"
        description="Vas a eliminar el idioma y todo su contenido traducido:"
        resourceName={pendingDelete?.label}
        confirmLabel="Eliminar idioma"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmRemove}
      />
    </main>
  );
}
