/**
 * SuggestionsView.tsx — Sugerencias proactivas de contenido
 * WEB-737 | Rama: sofia/web-737-gestor-redes-sociales
 *
 * Portado desde pxsol-home-mkt-division/src/screens/seoGeo/Suggestions.jsx.
 * Sin React Router. Acciones de rechazar/variante vía SeoGeoContext.
 *
 * Accesibilidad carry-over:
 * - Botones de acción con aria-label descriptivo.
 * - aria-live en zona de estado tras rechazar.
 * - Iconografía con aria-hidden.
 */

import { useId } from "react";
import { Bot, RefreshCw, Sparkles, X, Zap } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { SimOverlay } from "./_shared";
import { useSeoGeo, useSimulatedAsync } from "./SeoGeoContext";
import type { Suggestion } from "../../data/seo-geo-demo";

/* ────────────────────────────────────────────────────────────────────────────
 * Props
 * ──────────────────────────────────────────────────────────────────────────── */

interface Props {
  onSubNav?: (id: string) => void;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────────── */

const REASON_TONE: Record<Suggestion["reason"], "info" | "warning" | "positive"> = {
  opportunity_keyword: "info",
  ai_faq:             "warning",
  seasonality:        "positive",
};

const CONTENT_TYPE_LABEL: Record<Suggestion["contentType"], string> = {
  landing: "Landing page",
  blog:    "Blog",
  faq:     "FAQ",
  service: "Servicio",
};

/* ────────────────────────────────────────────────────────────────────────────
 * SuggestionCard
 * ──────────────────────────────────────────────────────────────────────────── */

function SuggestionCard({
  suggestion,
  onGenerate,
  onVariant,
  onReject,
}: {
  suggestion: Suggestion;
  onGenerate: (s: Suggestion) => void;
  onVariant: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <article
      aria-label={`Sugerencia: ${suggestion.title}`}
      style={{
        background: "var(--surface-card)",
        borderRadius: "var(--radius-card)",
        border: "0.5px solid var(--border-ui)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge tone={REASON_TONE[suggestion.reason]}>
          {suggestion.reasonLabel}
        </Badge>
        <Badge tone="neutral">
          {CONTENT_TYPE_LABEL[suggestion.contentType]}
        </Badge>
      </div>

      {/* Título sugerido */}
      <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: 0, lineHeight: 1.35 }}>
        {suggestion.title}
      </p>

      {/* Razón */}
      <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
        {suggestion.why}
      </p>

      {/* Acciones */}
      <div className="flex items-center gap-2 flex-wrap pt-1" style={{ borderTop: "0.5px solid var(--border-ui)" }}>
        <Button
          variant="primary"
          onClick={() => onGenerate(suggestion)}
          leftIcon={<Sparkles size={13} aria-hidden="true" />}
        >
          Generar
        </Button>
        <Button
          variant="secondary"
          onClick={() => onVariant(suggestion.id)}
          leftIcon={<RefreshCw size={12} aria-hidden="true" />}
          aria-label={`Ver variante de "${suggestion.title}"`}
        >
          Ver variante
        </Button>
        <button
          type="button"
          onClick={() => onReject(suggestion.id)}
          aria-label={`Descartar sugerencia "${suggestion.title}"`}
          className="ml-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:opacity-70 transition-opacity"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28,
            borderRadius: "var(--radius-nav)",
            border: "0.5px solid var(--border-ui)",
            background: "transparent",
            cursor: "pointer", outlineColor: "var(--ring)",
          }}
        >
          <X size={13} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Componente principal
 * ──────────────────────────────────────────────────────────────────────────── */

export function SuggestionsView({ onSubNav }: Props) {
  const { suggestions, rejectSuggestion, requestVariant } = useSeoGeo();
  const { loading, message, run } = useSimulatedAsync();
  const statusId = useId();

  const onGenerate = (s: Suggestion) => {
    run(`Generando "${s.title}"…`, () => {
      if (onSubNav) onSubNav("generator");
    });
  };

  const onVariant = (id: string) => {
    run("Buscando variante…", () => { requestVariant(id); }, { min: 600, max: 1000 });
  };

  return (
    <div style={{ padding: "var(--space-5)", maxWidth: 960, margin: "0 auto", position: "relative" }}>
      <SimOverlay active={loading} message={message} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Sugerencias proactivas
          </p>
          <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", margin: "4px 0 0", lineHeight: 1.5 }}>
            Contenido que la IA detecta como oportunidad según tus keywords, las queries de GEO y la estacionalidad del destino.
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Bot size={14} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
            {suggestions.length} {suggestions.length === 1 ? "sugerencia" : "sugerencias"}
          </span>
        </div>
      </div>

      {/* Status para lectores de pantalla */}
      <div
        id={statusId}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {suggestions.length === 0 ? "No quedan sugerencias pendientes." : `${suggestions.length} sugerencias disponibles.`}
      </div>

      {/* Cards */}
      {suggestions.length > 0 ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {suggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              onGenerate={onGenerate}
              onVariant={onVariant}
              onReject={rejectSuggestion}
            />
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center py-20 text-center"
          style={{
            background: "var(--surface-card)",
            borderRadius: "var(--radius-card)",
            border: "0.5px solid var(--border-ui)",
          }}
        >
          <div
            style={{
              width: 52, height: 52,
              borderRadius: "50%",
              background: "var(--surface-page)",
              border: "0.5px solid var(--border-ui)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Zap size={20} aria-hidden="true" style={{ color: "var(--text-tertiary)" }} />
          </div>
          <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 6px" }}>
            Sin sugerencias pendientes
          </p>
          <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", margin: 0, maxWidth: 340, lineHeight: 1.55 }}>
            Todas las sugerencias fueron gestionadas. La IA generará nuevas cuando detecte oportunidades en tus keywords o queries de GEO.
          </p>
        </div>
      )}

      {/* Leyenda de motivos */}
      <div
        style={{
          marginTop: "var(--space-5)",
          background: "var(--surface-card)",
          borderRadius: "var(--radius-card)",
          border: "0.5px solid var(--border-ui)",
          padding: "var(--space-4)",
        }}
      >
        <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          Cómo se generan las sugerencias
        </p>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {[
            { tone: "info" as const,     label: "Keyword de oportunidad", desc: "Rankea en posición 6-15 con buen volumen. Una landing dedicada puede subirla al top 5." },
            { tone: "warning" as const,  label: "Pregunta frecuente en IA", desc: "ChatGPT o Perplexity recibieron esta pregunta varias veces y tu ficha no la responde." },
            { tone: "positive" as const, label: "Estacionalidad", desc: "El volumen de búsqueda de esta intención sube en los próximos 30 días." },
          ].map(({ tone, label, desc }) => (
            <div key={label}>
              <div className="mb-1"><Badge tone={tone}>{label}</Badge></div>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
