/**
 * GeneratorView.tsx — Generador de contenido IA para SEO/GEO
 * WEB-737 | Rama: sofia/web-737-gestor-redes-sociales
 *
 * Portado desde pxsol-home-mkt-division/src/screens/seoGeo/Generator.jsx.
 * Sin React Router (useSearchParams reemplazado por prop `initialTopic`).
 *
 * Accesibilidad carry-over:
 * - Modos (Generar / Optimizar) como grupo de botones con aria-pressed.
 * - SimOverlay con role="status" + aria-live="polite".
 * - Tabs de tipo de contenido con role="tab" / role="tabpanel".
 */

import { useEffect, useId, useRef, useState } from "react";
import { Bot, Check, ChevronRight, Copy, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { SimOverlay } from "./_shared";
import { useSimulatedAsync } from "./SeoGeoContext";
import { generatedDrafts, optimizeExample, type GeneratedDraft } from "../../data/seo-geo-demo";

/* ────────────────────────────────────────────────────────────────────────────
 * Props
 * ──────────────────────────────────────────────────────────────────────────── */

interface Props {
  /** Tópico pre-completado (equivalente al searchParam ?topic= del fuente). */
  initialTopic?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Tipos de contenido
 * ──────────────────────────────────────────────────────────────────────────── */

const CONTENT_TYPES: Array<{ id: GeneratedDraft["contentType"]; label: string }> = [
  { id: "landing",  label: "Landing page" },
  { id: "blog",     label: "Blog / guía"  },
  { id: "faq",      label: "FAQ"          },
  { id: "service",  label: "Servicio"     },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────────── */

function SectionRenderer({ sections }: { sections: GeneratedDraft["sections"] }) {
  return (
    <div className="space-y-4">
      {sections.map((s, i) => (
        <div key={i}>
          {s.level === 2
            ? <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>{s.heading}</h2>
            : <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>{s.heading}</h3>
          }
          <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.65 }}>{s.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Componente principal
 * ──────────────────────────────────────────────────────────────────────────── */

export function GeneratorView({ initialTopic = "" }: Props) {
  const [mode, setMode] = useState<"generate" | "optimize">("generate");
  const [topic, setTopic] = useState(initialTopic);
  const [contentType, setContentType] = useState<GeneratedDraft["contentType"]>("landing");
  const [draft, setDraft] = useState<GeneratedDraft | null>(null);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [optimizeText, setOptimizeText] = useState(optimizeExample.original);
  const [optimized, setOptimized] = useState(false);
  const { loading, message, run } = useSimulatedAsync();
  const tabPanelId = useId();

  useEffect(() => { if (initialTopic) setTopic(initialTopic); }, [initialTopic]);

  const onGenerate = () => {
    run(
      `Generando ${CONTENT_TYPES.find((t) => t.id === contentType)?.label ?? "contenido"} sobre "${topic}"…`,
      () => { setDraft(generatedDrafts[contentType] ?? generatedDrafts.landing); },
    );
  };

  const onOptimize = () => {
    run("Analizando y mejorando el texto…", () => { setOptimized(true); }, { min: 1200, max: 1800 });
  };

  const onCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const inputStyle: React.CSSProperties = {
    display: "block", width: "100%", height: 34,
    padding: "0 10px",
    fontSize: "var(--font-size-md)",
    color: "var(--text-primary)",
    background: "var(--surface-page)",
    border: "0.5px solid var(--border-ui)",
    borderRadius: "var(--radius-nav)",
    outlineColor: "var(--accent-info)",
    boxSizing: "border-box",
  };

  return (
    <div style={{ padding: "var(--space-5)", maxWidth: 1200, margin: "0 auto", position: "relative" }}>
      <SimOverlay active={loading} message={message} />

      {/* Header */}
      <div className="mb-5">
        <p style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Generador de contenido
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", margin: "4px 0 0", lineHeight: 1.5 }}>
          Generá texto optimizado para SEO y para que los motores de IA te mencionen. También podés pegar texto existente y que la IA lo mejore.
        </p>
      </div>

      {/* Toggle modo */}
      <div
        className="inline-flex mb-5"
        role="group"
        aria-label="Modo de trabajo"
        style={{ background: "var(--surface-page)", borderRadius: "var(--radius-nav)", padding: 2 }}
      >
        {(["generate", "optimize"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); if (m === "generate") setOptimized(false); }}
            aria-pressed={mode === m}
            style={{
              padding: "0 16px", height: 30,
              fontSize: "var(--font-size-sm)", fontWeight: mode === m ? 600 : 400,
              borderRadius: "var(--radius-nav)",
              border: "none", cursor: "pointer",
              background: mode === m ? "var(--surface-card)" : "transparent",
              color: mode === m ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.15s",
            }}
          >
            {m === "generate" ? "Generar desde cero" : "Optimizar texto existente"}
          </button>
        ))}
      </div>

      {/* ── Modo Generar ── */}
      {mode === "generate" && (
        <div className="grid gap-6" style={{ gridTemplateColumns: draft ? "1fr 1.2fr" : "1fr" }}>
          {/* Panel izq.: configuración */}
          <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}>
            <p style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>
              Configurar generación
            </p>

            {/* Tipo de contenido */}
            <div className="mb-4" role="tablist" aria-label="Tipo de contenido">
              <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                Tipo de contenido
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_TYPES.map((ct) => (
                  <button
                    key={ct.id}
                    role="tab"
                    aria-selected={contentType === ct.id}
                    onClick={() => setContentType(ct.id)}
                    style={{
                      padding: "8px 10px",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: contentType === ct.id ? 600 : 400,
                      borderRadius: "var(--radius-nav)",
                      border: contentType === ct.id ? "1.5px solid var(--brand)" : "0.5px solid var(--border-ui)",
                      background: contentType === ct.id ? "rgba(232,74,44,0.07)" : "var(--surface-page)",
                      color: contentType === ct.id ? "var(--brand)" : "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tópico */}
            <div className="mb-5">
              <label htmlFor="gen-topic" style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Tema o keyword objetivo
              </label>
              <input
                id="gen-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="hotel boutique cartagena amurallada"
                style={inputStyle}
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)", marginTop: 4 }}>
                La IA usará el tono y los datos de tu hotel en PXSOL.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={onGenerate}
              disabled={!topic.trim() || loading}
              leftIcon={<Sparkles size={13} aria-hidden="true" />}
              style={{ width: "100%" }}
            >
              {draft ? "Regenerar" : "Generar"}
            </Button>
          </div>

          {/* Panel der.: borrador */}
          {draft && (
            <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", display: "flex", flexDirection: "column" }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "0.5px solid var(--border-ui)" }}>
                <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                  Borrador generado
                </p>
                <button
                  type="button"
                  onClick={() => onCopy(`${draft.h1}\n\n${draft.metaDescription}\n\n${draft.sections.map((s) => `${s.heading}\n${s.body}`).join("\n\n")}`)}
                  className="inline-flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:opacity-70 transition-opacity"
                  style={{
                    padding: "0 12px", height: 28,
                    fontSize: "var(--font-size-sm)",
                    borderRadius: "var(--radius-nav)",
                    border: "0.5px solid var(--border-ui)",
                    background: "var(--surface-page)",
                    color: "var(--text-secondary)",
                    cursor: "pointer", outlineColor: "var(--ring)",
                  }}
                >
                  {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5" style={{ maxHeight: 520 }}>
                {/* Meta */}
                <div
                  style={{
                    background: "var(--surface-page)",
                    borderRadius: "var(--radius-nav)",
                    padding: "var(--space-3) var(--space-3)",
                    marginBottom: "var(--space-4)",
                    border: "0.5px solid var(--border-ui)",
                  }}
                >
                  <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Meta description
                  </p>
                  <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-primary)", margin: 0, lineHeight: 1.55 }}>
                    {draft.metaDescription}
                  </p>
                </div>
                {/* H1 */}
                <h1 style={{ fontSize: "var(--font-size-xl)", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 16px", lineHeight: 1.2 }}>
                  {draft.h1}
                </h1>
                <SectionRenderer sections={draft.sections} />
                {/* Schema */}
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setSchemaOpen((v) => !v)}
                    className="inline-flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:opacity-70 transition-opacity"
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--text-secondary)",
                      background: "transparent", border: "none", cursor: "pointer",
                      outlineColor: "var(--ring)",
                    }}
                  >
                    <ChevronRight
                      size={13}
                      aria-hidden="true"
                      style={{ transform: schemaOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}
                    />
                    Rich snippet Schema.org
                  </button>
                  {schemaOpen && (
                    <pre
                      style={{
                        marginTop: 8,
                        background: "var(--surface-page)",
                        borderRadius: "var(--radius-nav)",
                        border: "0.5px solid var(--border-ui)",
                        padding: "var(--space-3)",
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-primary)",
                        fontFamily: "monospace",
                        overflowX: "auto",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                      }}
                    >
                      {draft.richSnippetSchema}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modo Optimizar ── */}
      {mode === "optimize" && (
        <div className="grid gap-6" style={{ gridTemplateColumns: optimized ? "1fr 1fr" : "1fr" }}>
          {/* Original */}
          <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}>
            <p style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 10px" }}>
              Texto original
            </p>
            <textarea
              value={optimizeText}
              onChange={(e) => { setOptimizeText(e.target.value); setOptimized(false); }}
              rows={10}
              style={{
                display: "block", width: "100%",
                padding: "var(--space-3)",
                fontSize: "var(--font-size-md)",
                color: "var(--text-primary)",
                background: "var(--surface-page)",
                border: "0.5px solid var(--border-ui)",
                borderRadius: "var(--radius-nav)",
                outlineColor: "var(--accent-info)",
                resize: "vertical",
                lineHeight: 1.65,
                boxSizing: "border-box",
              }}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Texto a optimizar"
            />
            <Button
              variant="primary"
              onClick={onOptimize}
              disabled={!optimizeText.trim() || loading}
              leftIcon={<Bot size={13} aria-hidden="true" />}
              style={{ marginTop: "var(--space-3)" }}
            >
              {optimized ? "Reoptimizar" : "Optimizar con IA"}
            </Button>
          </div>

          {/* Optimizado */}
          {optimized && (
            <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}>
              <div className="flex items-center justify-between mb-3">
                <p style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                  Texto optimizado
                </p>
                <button
                  type="button"
                  onClick={() => onCopy(optimizeExample.optimized)}
                  className="inline-flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:opacity-70 transition-opacity"
                  style={{
                    padding: "0 10px", height: 26,
                    fontSize: "var(--font-size-xs)",
                    borderRadius: "var(--radius-nav)",
                    border: "0.5px solid var(--border-ui)",
                    background: "var(--surface-page)",
                    color: "var(--text-secondary)",
                    cursor: "pointer", outlineColor: "var(--ring)",
                  }}
                >
                  {copied ? <Check size={11} aria-hidden="true" /> : <Copy size={11} aria-hidden="true" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <div
                style={{
                  background: "var(--surface-page)",
                  borderRadius: "var(--radius-nav)",
                  padding: "var(--space-3)",
                  fontSize: "var(--font-size-md)",
                  color: "var(--text-primary)",
                  lineHeight: 1.65,
                  marginBottom: "var(--space-4)",
                }}
              >
                {optimizeExample.optimized}
              </div>

              {/* Mejoras aplicadas */}
              <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Mejoras aplicadas
              </p>
              <ul className="space-y-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {optimizeExample.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={13} aria-hidden="true" style={{ color: "var(--status-active)", marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", lineHeight: 1.55 }}>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
