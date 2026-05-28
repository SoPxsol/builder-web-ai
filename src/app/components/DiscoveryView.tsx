import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

export function DiscoveryView({ siteName, navigate }: Props) {
  const platforms = [
    { id: 1, name: "ChatGPT", desc: "OpenAI — llms.txt activo", status: "active" },
    { id: 2, name: "Perplexity", desc: "Indexación habilitada", status: "active" },
    { id: 3, name: "Gemini", desc: "Google AI Overview", status: "active" },
    { id: 4, name: "Bing Copilot", desc: "Próximamente", status: "proxim" },
  ];

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 860, margin: "0 auto" }}>
        <ViewHeader
          backTo="paginas"
          eyebrow={siteName}
          title="Discovery — AI Visibility"
          description="Tu sitio es visible para los modelos de IA que se usan como motores de búsqueda."
          navigate={navigate}
          action={
            <span className="px-3 h-[22px] flex items-center" style={{ background: "var(--badge-green-bg)", borderRadius: 5, fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--badge-green-text)" }}>
              ✓ llms.txt activo
            </span>
          }
        />

        <div className="flex flex-col gap-3">
        {platforms.map((p) => (
          <div key={p.id} style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", opacity: p.status === "proxim" ? 0.5 : 1 }}>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 500, color: "var(--text-primary)" }}>{p.name}</p>
                <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>{p.desc}</p>
              </div>
              <span className="px-2 h-[18px] flex items-center" style={{
                background: p.status === "active" ? "var(--badge-green-bg)" : "var(--badge-neutral-bg)",
                borderRadius: "var(--radius-dot)",
                fontSize: "var(--font-size-xs)",
                fontWeight: 500,
                color: p.status === "active" ? "var(--badge-green-text)" : "var(--text-secondary)",
              }}>
                {p.status === "active" ? "Activo" : "Próx."}
              </span>
            </div>
          </div>
        ))}
        </div>
      </div>
    </main>
  );
}
