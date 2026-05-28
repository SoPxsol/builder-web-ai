import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

const sections = [
  {
    id: "seo",
    icon: "⊞",
    title: "SEO",
    subtitle: "Motores de búsqueda",
    status: "active",
    fields: ["Título del sitio", "Meta description"],
    dim: false,
  },
  {
    id: "geo",
    icon: "✦",
    title: "GEO — AI Discovery",
    subtitle: "ChatGPT · Perplexity · Gemini",
    status: "active",
    fields: [],
    dim: false,
  },
  {
    id: "places",
    icon: "G",
    title: "Google Places",
    subtitle: "Próximamente",
    status: "proxim",
    fields: [],
    dim: true,
  },
];

export function SeoGeoView({ siteName, navigate }: Props) {
  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 860, margin: "0 auto" }}>
        <ViewHeader
          backTo="paginas"
          eyebrow={siteName}
          title="SEO & GEO — Visibilidad"
          description="Cómo te encuentran Google y motores generativos como ChatGPT y Perplexity."
          navigate={navigate}
          action={
            <span className="px-3 h-[22px] flex items-center" style={{ background: "var(--badge-green-bg)", borderRadius: 5, fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--badge-green-text)" }}>
              ✓ Sitemap activo
            </span>
          }
        />

        <div className="flex flex-col gap-3">
        {sections.map((sec) => (
          <div key={sec.id} style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: sec.dim ? "0.5px dashed var(--badge-neutral-bg)" : "0.5px solid var(--border-ui)", opacity: sec.dim ? 0.5 : 1 }}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, background: "var(--surface-page)", borderRadius: "var(--radius-icon)" }}>
                  <span style={{ fontSize: 14, color: sec.dim ? "var(--text-tertiary)" : "var(--status-active)", fontWeight: 500 }}>{sec.icon}</span>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: sec.dim ? "var(--text-tertiary)" : "var(--text-primary)" }}>{sec.title}</p>
                  <p style={{ fontSize: "var(--font-size-base)", color: "var(--text-secondary)" }}>{sec.subtitle}</p>
                </div>
              </div>
              <span className="px-2 h-[18px] flex items-center" style={{
                background: sec.status === "active" ? "var(--badge-green-bg)" : "var(--badge-neutral-bg)",
                borderRadius: "var(--radius-dot)",
                fontSize: "var(--font-size-xs)",
                fontWeight: 500,
                color: sec.status === "active" ? "var(--badge-green-text)" : "var(--text-secondary)",
              }}>
                {sec.status === "active" ? "Activo" : "Próx."}
              </span>
            </div>

            {sec.fields.length > 0 && (
              <>
                <div style={{ height: 1, background: "var(--border-ui)" }} />
                <div className="flex gap-3 px-4 py-2">
                  {sec.fields.map((f) => (
                    <div key={f} className="flex-1 h-6 px-2 flex items-center" style={{ background: "var(--surface-page)", borderRadius: 5 }}>
                      <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
        </div>
      </div>
    </main>
  );
}
