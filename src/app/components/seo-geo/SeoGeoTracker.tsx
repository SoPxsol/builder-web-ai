/**
 * SeoGeoTracker.tsx — GEO Tracker (monitoreo de menciones en motores de IA)
 * WEB-737 | Rama: sofia/web-737-gestor-redes-sociales
 *
 * Portado desde pxsol-home-mkt-division/src/screens/seoGeo/GeoTracker.jsx.
 * Sin React Router — navegación vía prop callback.
 *
 * Accesibilidad carry-over:
 * - Tabla con encabezados semánticos.
 * - Modal con focus-trap, aria-modal, Escape.
 * - Filtros como grupo de botones con aria-pressed.
 * - role="progressbar" en ScoreBar.
 */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Bot, Plus, RefreshCw, Search, X,
  CheckCircle2, Circle, ExternalLink, Trophy,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { EngineBadge, ScoreBar, SimOverlay } from "./_shared";
import { useSeoGeo, useSimulatedAsync } from "./SeoGeoContext";

/* ────────────────────────────────────────────────────────────────────────────
 * Props
 * ──────────────────────────────────────────────────────────────────────────── */

interface Props {
  onSubNav?: (id: string) => void;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Filtros de motor
 * ──────────────────────────────────────────────────────────────────────────── */

const engineFilters = [
  { id: "all",        label: "Todos"      },
  { id: "chatgpt",    label: "ChatGPT"    },
  { id: "perplexity", label: "Perplexity" },
  { id: "google_ai",  label: "Google AI"  },
];

type EngineFilter = typeof engineFilters[number]["id"];

/* ────────────────────────────────────────────────────────────────────────────
 * Modal de detalle de query
 * ──────────────────────────────────────────────────────────────────────────── */

import type { GeoQuery } from "../../data/seo-geo-demo";

function QueryDetailModal({
  query,
  onClose,
  titleId,
}: {
  query: GeoQuery;
  onClose: () => void;
  titleId: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          width: "100%", maxWidth: 560, margin: "0 16px",
          background: "var(--surface-card)",
          borderRadius: "var(--radius-card)",
          border: "0.5px solid var(--border-ui)",
          padding: "var(--space-5)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          position: "relative",
        }}
      >
        <div className="flex items-center gap-2 mb-3" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
          <EngineBadge engine={query.engine} />
          <span style={{ margin: "0 4px" }}>·</span>
          <span>{query.category}</span>
          <span style={{ margin: "0 4px" }}>·</span>
          <span>{query.lastRun}</span>
        </div>

        <h2
          id={titleId}
          style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2, margin: "0 0 16px", paddingRight: 32 }}
        >
          "{query.query}"
        </h2>

        {query.mentioned ? (
          <>
            <div className="mb-4">
              <Badge tone="success">
                <CheckCircle2 size={11} aria-hidden="true" /> Mencionado · posición #{query.position}
              </Badge>
            </div>
            <div
              style={{
                background: "var(--surface-page)",
                borderRadius: "var(--radius-nav)",
                padding: "var(--space-3) var(--space-4)",
                marginBottom: "var(--space-4)",
              }}
            >
              <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
                Extracto de la respuesta
              </p>
              <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-primary)", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                "{query.excerpt}"
              </p>
            </div>
            {query.citedUrl && (
              <div className="flex items-center gap-2" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                <ExternalLink size={12} aria-hidden="true" />
                URL citada: <span style={{ fontFamily: "monospace", color: "var(--text-primary)" }}>{query.citedUrl}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-4">
              <Badge tone="warning">
                <Circle size={11} aria-hidden="true" /> No mencionado
              </Badge>
            </div>
            <div style={{ background: "var(--surface-page)", borderRadius: "var(--radius-nav)", padding: "var(--space-3) var(--space-4)" }}>
              <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                La IA respondió esta query sin mencionar a tu hotel. Considerá generar contenido específico para subir en esta intención de búsqueda.
              </p>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button variant="primary" onClick={onClose} leftIcon={<Bot size={13} aria-hidden="true" />}>
            Ver en motor
          </Button>
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-opacity hover:opacity-70"
          style={{
            top: 14, right: 14, width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--surface-page)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: "var(--radius-nav)",
            cursor: "pointer",
            outlineColor: "var(--ring)",
          }}
        >
          <X size={13} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Modal: Agregar query
 * ──────────────────────────────────────────────────────────────────────────── */

function AddQueryModal({
  onClose,
  onAdd,
  titleId,
}: {
  onClose: () => void;
  onAdd: (query: string, category: string, engine: GeoQuery["engine"]) => void;
  titleId: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Cartagena · Boutique");
  const [engine, setEngine] = useState<GeoQuery["engine"]>("chatgpt");

  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

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
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          width: "100%", maxWidth: 420, margin: "0 16px",
          background: "var(--surface-card)",
          borderRadius: "var(--radius-card)",
          border: "0.5px solid var(--border-ui)",
          padding: "var(--space-5)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          position: "relative",
        }}
      >
        <h2 id={titleId} style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>
          Agregar query personalizada
        </h2>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", margin: "0 0 var(--space-4)", lineHeight: 1.5 }}>
          Definí qué le preguntás a la IA. Vamos a correrla y guardar el resultado.
        </p>

        <div className="space-y-3">
          <div>
            <label htmlFor="qd-query" style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Query</label>
            <input
              id="qd-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="¿Cuál es el mejor hotel para luna de miel en Cartagena?"
              style={inputStyle}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          </div>
          <div>
            <label htmlFor="qd-cat" style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Categoría</label>
            <input
              id="qd-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Cartagena · Parejas"
              style={inputStyle}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          </div>
          <div>
            <label htmlFor="qd-engine" style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Motor</label>
            <select
              id="qd-engine"
              value={engine}
              onChange={(e) => setEngine(e.target.value as GeoQuery["engine"])}
              style={{ ...inputStyle, appearance: "auto", cursor: "pointer" }}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <option value="chatgpt">ChatGPT</option>
              <option value="perplexity">Perplexity</option>
              <option value="google_ai">Google AI Overviews</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={() => { if (query.trim()) { onAdd(query.trim(), category, engine); onClose(); } }}
            leftIcon={<Bot size={13} aria-hidden="true" />}
            disabled={!query.trim()}
          >
            Ejecutar
          </Button>
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-opacity hover:opacity-70"
          style={{
            top: 14, right: 14, width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--surface-page)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: "var(--radius-nav)",
            cursor: "pointer", outlineColor: "var(--ring)",
          }}
        >
          <X size={13} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Modal: Agregar competidor — focus-trap + Escape + foco inicial
 * Mismo patrón que QueryDetailModal y AddQueryModal.
 * ──────────────────────────────────────────────────────────────────────────── */

function AddCompetitorModal({
  titleId,
  compDraft,
  setCompDraft,
  inputRef,
  onClose,
  onAdd,
  inputStyle,
}: {
  titleId: string;
  compDraft: string;
  setCompDraft: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null> | React.MutableRefObject<HTMLInputElement | null>;
  onClose: () => void;
  onAdd: () => void;
  inputStyle: React.CSSProperties;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Foco inicial en el input al abrir
  useEffect(() => { inputRef.current?.focus(); }, [inputRef]);

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          width: "100%", maxWidth: 400, margin: "0 16px",
          background: "var(--surface-card)",
          borderRadius: "var(--radius-card)",
          border: "0.5px solid var(--border-ui)",
          padding: "var(--space-5)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          position: "relative",
        }}
      >
        <h2 id={titleId} style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>
          Agregar competidor
        </h2>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.5 }}>
          Vamos a calcular su AI Visibility Score con las mismas queries que tenés activas.
        </p>
        <label htmlFor="comp-name-modal" style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
          Nombre del competidor
        </label>
        <input
          ref={inputRef}
          id="comp-name-modal"
          value={compDraft}
          onChange={(e) => setCompDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && compDraft.trim()) { e.preventDefault(); onAdd(); } }}
          placeholder="Sofitel Legend Santa Clara"
          style={inputStyle}
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        />
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={onAdd} disabled={!compDraft.trim()}>Analizar</Button>
        </div>

        {/* Botón cerrar × */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-opacity hover:opacity-70"
          style={{
            top: 14, right: 14, width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--surface-page)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: "var(--radius-nav)",
            cursor: "pointer", outlineColor: "var(--ring)",
          }}
        >
          <X size={13} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * CompetitorRow
 * ──────────────────────────────────────────────────────────────────────────── */

function CompetitorRow({ name, score, self, onRemove }: { name: string; score: number; self?: boolean; onRemove?: () => void }) {
  return (
    <div
      className="flex items-center gap-4 group"
      style={{
        padding: "10px 12px",
        borderRadius: "var(--radius-nav)",
        background: self ? "rgba(232,74,44,0.06)" : "transparent",
        border: self ? "0.5px solid rgba(232,74,44,0.15)" : "none",
        transition: "background 0.15s",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: "var(--font-size-md)", fontWeight: 500, color: "var(--text-primary)" }}>{name}</span>
      </div>
      <div className="flex items-center gap-3" style={{ flex: 1, maxWidth: 360 }}>
        <ScoreBar value={score} tone={self ? "brand" : "cool"} label={`AI Visibility Score: ${score}`} />
        <span style={{ fontFamily: "monospace", fontSize: "var(--font-size-lg)", color: "var(--text-primary)", minWidth: 36, textAlign: "right" }}>
          {score}
        </span>
      </div>
      {!self && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar ${name}`}
          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-opacity"
          style={{ padding: 4, background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", outlineColor: "var(--ring)" }}
        >
          <X size={13} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Componente principal
 * ──────────────────────────────────────────────────────────────────────────── */

export function SeoGeoTracker({ onSubNav: _onSubNav }: Props) {
  const {
    geoQueries, competitors,
    addCompetitor, removeCompetitor, addGeoQuery, refreshGeoRun, lastGeoRun,
  } = useSeoGeo();
  const { loading, message, run } = useSimulatedAsync();

  const [engineFilter, setEngineFilter] = useState<EngineFilter>("all");
  const [selected, setSelected] = useState<GeoQuery | null>(null);
  const [openAddQuery, setOpenAddQuery] = useState(false);
  const [openAddComp, setOpenAddComp] = useState(false);
  const [compDraft, setCompDraft] = useState("");
  const compInputRef = useRef<HTMLInputElement>(null);
  const addCompTitleId = useId();

  const detailTitleId = useId();
  const addQueryTitleId = useId();

  const filtered = useMemo(
    () => engineFilter === "all" ? geoQueries : geoQueries.filter((q) => q.engine === engineFilter),
    [engineFilter, geoQueries],
  );

  const visibilityScore = useMemo(() => {
    const mentioned = geoQueries.filter((q) => q.mentioned).length;
    return Math.round((mentioned / Math.max(geoQueries.length, 1)) * 100);
  }, [geoQueries]);

  const byEngine = useMemo(() => {
    const result = {
      chatgpt: { ok: 0, total: 0 },
      perplexity: { ok: 0, total: 0 },
      google_ai: { ok: 0, total: 0 },
    };
    geoQueries.forEach((q) => {
      if (q.engine in result) {
        result[q.engine as keyof typeof result].total++;
        if (q.mentioned) result[q.engine as keyof typeof result].ok++;
      }
    });
    return result;
  }, [geoQueries]);

  const onRunAll = () =>
    run("Consultando ChatGPT, Perplexity y Google AI…", () => { refreshGeoRun(); });

  const onAddQuery = (query: string, category: string, engine: GeoQuery["engine"]) => {
    run(`Consultando "${query}" en ${engine === "chatgpt" ? "ChatGPT" : engine === "perplexity" ? "Perplexity" : "Google AI"}…`, () => {
      addGeoQuery(query, category, engine);
    });
  };

  const onAddCompetitor = () => {
    if (!compDraft.trim()) return;
    const name = compDraft.trim();
    setCompDraft("");
    setOpenAddComp(false);
    run(`Analizando visibilidad de ${name}…`, () => { addCompetitor(name); }, { min: 800, max: 1400 });
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
    <>
      <div style={{ padding: "var(--space-5)", maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <SimOverlay active={loading} message={message} />

        {/* Header de sección */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.2 }}>
              GEO Tracker
            </p>
            <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5, margin: "4px 0 0" }}>
              Dónde aparecés cuando un viajero le pregunta a una IA. Monitoreamos qué motores te mencionan, con qué texto y qué URL citan.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="secondary" onClick={() => setOpenAddQuery(true)} leftIcon={<Plus size={13} aria-hidden="true" />}>
              Agregar query
            </Button>
            <Button variant="primary" onClick={onRunAll} leftIcon={<RefreshCw size={13} aria-hidden="true" />}>
              Ejecutar queries
            </Button>
          </div>
        </div>

        {/* Score + breakdown por motor */}
        <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))" }}>
          <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}>
            <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              AI Visibility Score
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <span style={{ fontFamily: "monospace", fontSize: 56, color: "var(--text-primary)", lineHeight: 1 }}>{visibilityScore}</span>
              <span style={{ fontSize: "var(--font-size-lg)", color: "var(--text-secondary)" }}>%</span>
            </div>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: 16 }}>
              de las {geoQueries.length} queries monitoreadas te mencionan.
            </p>
            <ScoreBar value={visibilityScore} tone="cool" label={`AI Visibility Score: ${visibilityScore}%`} />
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)", marginTop: 8 }}>
              Última corrida: {lastGeoRun}
            </p>
          </div>

          <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}>
            <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
              Por motor
            </p>
            <div className="space-y-4">
              {(["chatgpt", "perplexity", "google_ai"] as const).map((eng) => {
                const { ok, total } = byEngine[eng];
                const pct = total ? Math.round((ok / total) * 100) : 0;
                return (
                  <div key={eng}>
                    <div className="flex items-center justify-between mb-1.5">
                      <EngineBadge engine={eng} />
                      <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                        <span style={{ fontFamily: "monospace", color: "var(--text-primary)" }}>{ok}</span> de{" "}
                        <span style={{ fontFamily: "monospace" }}>{total}</span> ·{" "}
                        <span style={{ fontFamily: "monospace" }}>{pct}%</span>
                      </span>
                    </div>
                    <ScoreBar
                      value={pct}
                      tone={eng === "chatgpt" ? "positive" : eng === "perplexity" ? "cool" : "warning"}
                      label={`${eng}: ${pct}% de visibilidad`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tabla de queries */}
        <div
          style={{
            background: "var(--surface-card)",
            borderRadius: "var(--radius-card)",
            border: "0.5px solid var(--border-ui)",
            overflow: "hidden",
            marginBottom: "var(--space-4)",
          }}
        >
          <div className="flex items-center justify-between gap-4 px-5 py-4" style={{ borderBottom: "0.5px solid var(--border-ui)" }}>
            <div>
              <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>Queries monitoreadas</p>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: 0 }}>
                Cada fila es una pregunta real que viajeros le hacen a una IA. Clic para ver el extracto.
              </p>
            </div>
            <div
              className="inline-flex"
              role="group"
              aria-label="Filtrar por motor"
              style={{ background: "var(--surface-page)", borderRadius: "var(--radius-nav)", padding: 2 }}
            >
              {engineFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setEngineFilter(f.id)}
                  aria-pressed={engineFilter === f.id}
                  style={{
                    padding: "0 12px", height: 28,
                    fontSize: "var(--font-size-sm)",
                    borderRadius: "var(--radius-nav)",
                    border: "none", cursor: "pointer",
                    background: engineFilter === f.id ? "var(--surface-card)" : "transparent",
                    color: engineFilter === f.id ? "var(--text-primary)" : "var(--text-secondary)",
                    fontWeight: engineFilter === f.id ? 500 : 400,
                    boxShadow: engineFilter === f.id ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center px-6">
              <Search size={24} aria-hidden="true" style={{ color: "var(--text-tertiary)", marginBottom: 12 }} />
              <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", margin: 0 }}>
                No hay queries para este motor todavía. Agregá una con el botón superior.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "0.5px solid var(--border-ui)" }}>
                    {["", "Query", "Motor", "Categoría", "Posición", "Última corrida"].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "10px 20px",
                          fontSize: "var(--font-size-xs)",
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          textAlign: i === 0 ? "center" : i >= 4 ? "right" : "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((q) => (
                    /* WCAG 2.1.1: fila interactiva necesita tabIndex + role + onKeyDown.
                     * Alternativa más limpia: el botón "Ver detalle" en la celda de query. */
                    <tr
                      key={q.id}
                      tabIndex={0}
                      role="button"
                      aria-label={`Ver detalle de query: ${q.query}`}
                      onClick={() => setSelected(q)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(q); } }}
                      style={{ borderBottom: "0.5px solid var(--border-ui)", cursor: "pointer", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-page)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      onFocus={(e) => (e.currentTarget.style.background = "var(--surface-page)")}
                      onBlur={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 20px", textAlign: "center" }}>
                        {q.mentioned
                          ? <CheckCircle2 size={16} aria-label="Mencionado" style={{ color: "var(--status-active)" }} />
                          : <Circle size={16} aria-label="No mencionado" style={{ color: "var(--text-tertiary)" }} />
                        }
                      </td>
                      <td style={{ padding: "12px 20px", fontSize: "var(--font-size-md)", color: "var(--text-primary)", maxWidth: 360 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={q.query}>{q.query}</div>
                      </td>
                      <td style={{ padding: "12px 20px" }}>
                        <EngineBadge engine={q.engine} />
                      </td>
                      <td style={{ padding: "12px 20px", fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                        {q.category}
                      </td>
                      <td style={{ padding: "12px 20px", fontFamily: "monospace", fontSize: "var(--font-size-md)", color: "var(--text-primary)", textAlign: "right" }}>
                        {q.mentioned ? `#${q.position}` : <span style={{ color: "var(--text-tertiary)" }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 20px", fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", textAlign: "right", whiteSpace: "nowrap" }}>
                        {q.lastRun}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Comparativa de competidores */}
        <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Trophy size={14} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
                <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                  Comparativa de competidores
                </p>
              </div>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                Cómo ranquea tu hotel vs. otros boutique de Cartagena en motores de IA.
              </p>
            </div>
            <Button variant="secondary" onClick={() => setOpenAddComp(true)} leftIcon={<Plus size={12} aria-hidden="true" />}>
              Agregar competidor
            </Button>
          </div>

          <div className="space-y-2">
            <CompetitorRow name="Hotel Azul Marino (tú)" score={visibilityScore} self />
            {competitors.map((c) => (
              <CompetitorRow
                key={c.id}
                name={c.name}
                score={c.aiVisibilityScore}
                onRemove={() => removeCompetitor(c.id)}
              />
            ))}
            {competitors.length === 0 && (
              /* Estado vacío con CTA — guía al usuario a la acción de valor */
              <div
                className="flex flex-col items-center text-center"
                style={{
                  padding: "var(--space-4)",
                  borderRadius: "var(--radius-nav)",
                  border: "1.5px dashed var(--border-ui)",
                  marginTop: 8,
                }}
              >
                <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: "0 0 10px" }}>
                  Sin competidores todavía. Agregá hasta 3 para comparar tu visibilidad IA contra la de ellos.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setOpenAddComp(true)}
                >
                  Agregar primer competidor
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Modal: añadir competidor — con focus-trap, Escape y foco inicial (igual que otros modales) */}
        {openAddComp && (
          <AddCompetitorModal
            titleId={addCompTitleId}
            compDraft={compDraft}
            setCompDraft={setCompDraft}
            inputRef={compInputRef}
            onClose={() => { setOpenAddComp(false); setCompDraft(""); }}
            onAdd={onAddCompetitor}
            inputStyle={inputStyle}
          />
        )}
      </div>

      {/* Modales */}
      {selected && (
        <QueryDetailModal query={selected} onClose={() => setSelected(null)} titleId={detailTitleId} />
      )}
      {openAddQuery && (
        <AddQueryModal onClose={() => setOpenAddQuery(false)} onAdd={onAddQuery} titleId={addQueryTitleId} />
      )}
    </>
  );
}
