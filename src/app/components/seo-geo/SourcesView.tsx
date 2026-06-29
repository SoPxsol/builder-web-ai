/**
 * SourcesView.tsx — Citas y fuentes de autoridad LLM
 * WEB-737 | Rama: sofia/web-737-gestor-redes-sociales
 *
 * Portado desde pxsol-home-mkt-division/src/screens/seoGeo/Sources.jsx.
 * Sin React Router.
 *
 * Accesibilidad carry-over:
 * - Tabla con th scope="col".
 * - AuthorityBadge lleva texto, no solo color.
 * - Ícono de estado en SourceRecommendation acompañado de texto visible.
 */

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { AuthorityBadge } from "./_shared";
import { sources, sourceRecommendations, type SourceRecommendation } from "../../data/seo-geo-demo";

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────────── */

const PRIORITY_COLOR: Record<SourceRecommendation["priority"], string> = {
  high:   "var(--brand)",
  medium: "var(--geo-cool)",
  low:    "var(--text-tertiary)",
};

const PRIORITY_LABEL: Record<SourceRecommendation["priority"], string> = {
  high:   "Alta",
  medium: "Media",
  low:    "Baja",
};

function StatusCell({ status }: { status: SourceRecommendation["status"] }) {
  if (status === "present")
    return (
      <span className="inline-flex items-center gap-1" style={{ fontSize: "var(--font-size-xs)", color: "var(--badge-green-text)", fontWeight: 600 }}>
        <CheckCircle2 size={13} aria-hidden="true" /> Presente
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1" style={{ fontSize: "var(--font-size-xs)", color: "var(--badge-orange-text)", fontWeight: 600 }}>
        <Clock size={13} aria-hidden="true" /> Pendiente
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1" style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", fontWeight: 600 }}>
      <XCircle size={13} aria-hidden="true" /> Ausente
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Componente principal
 * ──────────────────────────────────────────────────────────────────────────── */

export function SourcesView() {
  const byAuthority = {
    high:   sources.filter((s) => s.llmAuthority === "high"),
    medium: sources.filter((s) => s.llmAuthority === "medium"),
    low:    sources.filter((s) => s.llmAuthority === "low"),
  };

  return (
    <div style={{ padding: "var(--space-5)", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div className="mb-5">
        <p style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Citas y fuentes
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", margin: "4px 0 0", lineHeight: 1.5 }}>
          Qué sitios web te citan y con qué autoridad los leen ChatGPT, Perplexity y Google AI. Las fuentes de alta autoridad son las que más influyen en que un LLM te mencione.
        </p>
      </div>

      {/* Resumen por nivel */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))" }}>
        {(["high", "medium", "low"] as const).map((level) => {
          const badge = { high: { label: "Alta autoridad", bg: "var(--badge-green-bg)", color: "var(--badge-green-text)" }, medium: { label: "Autoridad media", bg: "var(--badge-blue-bg)", color: "var(--badge-blue-text)" }, low: { label: "Baja autoridad", bg: "var(--surface-page)", color: "var(--text-secondary)" } }[level];
          return (
            <div
              key={level}
              style={{
                background: "var(--surface-card)",
                borderRadius: "var(--radius-card)",
                border: "0.5px solid var(--border-ui)",
                padding: "var(--space-4)",
              }}
            >
              <AuthorityBadge level={level} />
              <p style={{ fontFamily: "monospace", fontSize: 36, color: "var(--text-primary)", lineHeight: 1, margin: "10px 0 4px" }}>
                {byAuthority[level].length}
              </p>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: 0 }}>
                {level === "high" ? "fuentes con peso fuerte en LLMs" : level === "medium" ? "fuentes con peso moderado" : "fuentes con bajo peso en LLMs"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tabla de fuentes */}
      <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", overflow: "hidden", marginBottom: "var(--space-5)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "0.5px solid var(--border-ui)" }}>
          <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>
            Fuentes que te citan
          </p>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: 0 }}>
            {sources.length} sitios mencionaron a tu hotel en contenido que los LLMs indexan.
          </p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--border-ui)" }}>
                <th scope="col" style={{ padding: "10px 20px", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left" }}>Dominio</th>
                <th scope="col" style={{ padding: "10px 20px", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left" }}>Tipo de mención</th>
                <th scope="col" style={{ padding: "10px 20px", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>Autoridad LLM</th>
                <th scope="col" style={{ padding: "10px 20px", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s, i) => (
                <tr
                  key={s.domain}
                  style={{
                    borderBottom: i < sources.length - 1 ? "0.5px solid var(--border-ui)" : "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-page)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 20px", fontSize: "var(--font-size-md)", fontFamily: "monospace", color: "var(--text-primary)" }}>
                    {s.domain}
                  </td>
                  <td style={{ padding: "12px 20px", fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                    {s.mentionType}
                  </td>
                  <td style={{ padding: "12px 20px", textAlign: "center" }}>
                    <AuthorityBadge level={s.llmAuthority} />
                  </td>
                  <td style={{ padding: "12px 20px", fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", fontFamily: "monospace", textAlign: "right" }}>
                    {s.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recomendaciones */}
      <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", overflow: "hidden" }}>
        <div className="px-5 py-4" style={{ borderBottom: "0.5px solid var(--border-ui)" }}>
          <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>
            Fuentes recomendadas para ganar autoridad
          </p>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: 0 }}>
            Sitios con alto peso en LLMs donde todavía no tenés presencia o hay trabajo pendiente.
          </p>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border-ui)" }}>
          {sourceRecommendations.map((rec) => (
            <div
              key={rec.name}
              className="flex items-start gap-4"
              style={{ padding: "var(--space-4) var(--space-5)" }}
            >
              <div style={{ flexShrink: 0, paddingTop: 2 }}>
                <StatusCell status={rec.status} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-2 mb-1">
                  <p style={{ fontSize: "var(--font-size-md)", fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
                    {rec.name}
                  </p>
                  <span
                    style={{
                      display: "inline-block",
                      width: 7, height: 7,
                      borderRadius: "50%",
                      background: PRIORITY_COLOR[rec.priority],
                      flexShrink: 0,
                    }}
                    aria-label={`Prioridad ${PRIORITY_LABEL[rec.priority]}`}
                  />
                </div>
                <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
                  {rec.why}
                </p>
              </div>
              <span
                style={{
                  flexShrink: 0,
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 600,
                  color: PRIORITY_COLOR[rec.priority],
                  whiteSpace: "nowrap",
                }}
              >
                {PRIORITY_LABEL[rec.priority]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
