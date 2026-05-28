import { Sparkles, AlertCircle } from "lucide-react";
import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

type ToolStatus = "active" | "depleted" | "proxim";

interface Tool {
  id: number;
  name: string;
  desc: string;
  status: ToolStatus;
  used: number;
  total: number;
  rechargeAt?: string;
}

const RECHARGE_DATE = "1 jun 2026";

const baseTools: Tool[] = [
  { id: 1, name: "Generador de descripciones", desc: "Creá descripciones SEO para habitaciones y servicios", status: "active", used: 37, total: 200, rechargeAt: RECHARGE_DATE },
  { id: 2, name: "Blog con IA",                 desc: "Redacta posts optimizados para tu destino",            status: "active", used: 50, total: 50,  rechargeAt: RECHARGE_DATE },
  { id: 3, name: "Respuestas a reseñas",        desc: "Responde reseñas de Google de forma automática",      status: "proxim", used: 0,  total: 0 },
];

function deriveStatus(t: Tool): ToolStatus {
  if (t.status === "proxim") return "proxim";
  return t.used >= t.total ? "depleted" : "active";
}

export function AiView({ siteName, navigate }: Props) {
  const tools = baseTools.map((t) => ({ ...t, status: deriveStatus(t) }));
  const totalRemaining = tools.reduce((s, t) => (t.status === "active" ? s + (t.total - t.used) : s), 0);
  const totalDepletedActive = tools.some((t) => t.status === "depleted");

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 860, margin: "0 auto" }}>
        <ViewHeader
          backTo="paginas"
          eyebrow={siteName}
          title="AI — Herramientas"
          description="Generá contenido optimizado para SEO con IA: descripciones, posts y respuestas a reseñas."
          navigate={navigate}
          action={
            totalRemaining === 0 ? (
              <span
                role="status"
                className="px-3 h-[22px] flex items-center gap-1.5"
                style={{ background: "var(--badge-red-bg)", borderRadius: 5, fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--destructive)" }}
              >
                <AlertCircle size={11} aria-hidden="true" /> Sin prompts disponibles
              </span>
            ) : (
              <span className="px-3 h-[22px] flex items-center" style={{ background: "var(--badge-blue-bg)", borderRadius: 5, fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--badge-blue-text)" }}>
                {totalRemaining} prompts restantes
              </span>
            )
          }
        />

      {totalDepletedActive && (
        <div
          role="alert"
          className="mb-4 px-4 py-3 flex items-start gap-3"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--destructive)",
            borderRadius: "var(--radius-card)",
          }}
        >
          <AlertCircle size={16} aria-hidden="true" style={{ color: "var(--destructive)", flexShrink: 0, marginTop: 2 }} />
          <div className="flex-1">
            <p style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
              Una o más herramientas IA agotaron sus prompts del mes
            </p>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
              Comprá más prompts o esperá la recarga automática el {RECHARGE_DATE}.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 h-8 transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: "var(--brand)",
              borderRadius: "var(--radius-nav)",
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              color: "#fff",
              border: "none",
              outlineColor: "var(--brand)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Sparkles size={12} /> Comprar prompts
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {tools.map((tool) => {
          const isProxim = tool.status === "proxim";
          const isDepleted = tool.status === "depleted";
          const pct = tool.total > 0 ? Math.min(100, Math.round((tool.used / tool.total) * 100)) : 0;
          return (
            <div
              key={tool.id}
              style={{
                background: "var(--surface-card)",
                borderRadius: "var(--radius-card)",
                border: isDepleted ? "1px solid var(--destructive)" : "0.5px solid var(--border-ui)",
                opacity: isProxim ? 0.5 : 1,
              }}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0 pr-4">
                  <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 500, color: "var(--text-primary)" }}>{tool.name}</p>
                  <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>{tool.desc}</p>

                  {!isProxim && (
                    <div className="mt-2 flex items-center gap-3">
                      <div
                        role="progressbar"
                        aria-valuenow={tool.used}
                        aria-valuemin={0}
                        aria-valuemax={tool.total}
                        aria-label={`Prompts usados de ${tool.name}`}
                        style={{
                          flex: 1,
                          maxWidth: 220,
                          height: 4,
                          background: "var(--surface-page)",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: isDepleted ? "var(--destructive)" : "var(--brand)",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "var(--font-size-xs)", color: isDepleted ? "var(--destructive)" : "var(--text-tertiary)", fontWeight: isDepleted ? 600 : 400 }}>
                        {tool.used}/{tool.total} prompts
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {isDepleted ? (
                    <>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-3 h-7 transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        aria-label={`Comprar más prompts para ${tool.name}`}
                        style={{
                          background: "var(--brand)",
                          borderRadius: "var(--radius-nav)",
                          fontSize: "var(--font-size-sm)",
                          fontWeight: 500,
                          color: "#fff",
                          border: "none",
                          outlineColor: "var(--brand)",
                          cursor: "pointer",
                        }}
                      >
                        <Sparkles size={11} /> Comprar prompts
                      </button>
                      {tool.rechargeAt && (
                        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>
                          o recarga el {tool.rechargeAt}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="px-2 h-[18px] flex items-center" style={{
                      background: isProxim ? "var(--badge-neutral-bg)" : "var(--badge-green-bg)",
                      borderRadius: "var(--radius-dot)",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: 500,
                      color: isProxim ? "var(--text-secondary)" : "var(--badge-green-text)",
                    }}>
                      {isProxim ? "Próx." : "Activo"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </main>
  );
}
