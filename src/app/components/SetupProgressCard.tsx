import { useState } from "react";
import { ArrowRight, CheckCircle2, ChevronUp, Clock, Sparkles } from "lucide-react";
import type { W2State } from "../types/wizard2";
import { SECTIONS } from "../types/wizard2";

interface Props {
  draft: W2State;
  onContinue: () => void;
  /** Día actual del trial (1-indexed). Default 1 mientras no haya wiring con backend. */
  trialDay?: number;
  /** Duración total del trial en días. Default 14. */
  trialTotalDays?: number;
}

const TOTAL_SECTIONS = SECTIONS.length; // 8
const FULL_DURATION_MIN = 25;
const DISMISS_KEY = "pxsol-w2-setup-card-dismissed";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readDismissedToday(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(DISMISS_KEY) === todayKey();
  } catch {
    return false;
  }
}

function writeDismissedToday(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DISMISS_KEY, todayKey());
  } catch {
    /* localStorage no disponible: ignorar silenciosamente */
  }
}

function clearDismissed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DISMISS_KEY);
  } catch {
    /* ignorar */
  }
}

export function SetupProgressCard({ draft, onContinue, trialDay = 1, trialTotalDays = 14 }: Props) {
  const [minimized, setMinimized] = useState<boolean>(() => readDismissedToday());

  const completedCount = draft.completedSections.size;
  const isComplete = completedCount >= TOTAL_SECTIONS;
  const progressPct = Math.round((completedCount / TOTAL_SECTIONS) * 100);

  const pending = SECTIONS.filter((s) => !draft.completedSections.has(s.id));
  const pendingPreview = pending.slice(0, 3).map((s) => s.label);
  const remainingMin = Math.max(
    1,
    Math.round((pending.length / TOTAL_SECTIONS) * FULL_DURATION_MIN),
  );

  function handleMinimize() {
    setMinimized(true);
    writeDismissedToday();
  }

  function handleExpand() {
    setMinimized(false);
    clearDismissed();
  }

  // Variante 1: completado
  if (isComplete) {
    return (
      <div
        className="flex items-center"
        style={{
          background: "var(--wizard-success-light)",
          border: "1px solid var(--wizard-success-border)",
          borderRadius: "var(--radius-card)",
          padding: "12px 16px",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <CheckCircle2 size={18} style={{ color: "var(--wizard-success)", flexShrink: 0 }} aria-hidden="true" />
        <div className="flex flex-col flex-1">
          <p style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--wizard-success-dark)" }}>
            ¡Configuración lista! 🎉
          </p>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--wizard-success-dark)" }}>
            Tu sitio está optimizado para Google, ChatGPT y Perplexity.
          </p>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            height: 28,
            padding: "0 12px",
            background: "#fff",
            border: "1px solid var(--wizard-success-border)",
            borderRadius: 5,
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            color: "var(--wizard-success-dark)",
            cursor: "pointer",
            outlineColor: "var(--wizard-success)",
          }}
        >
          Ver resumen
        </button>
      </div>
    );
  }

  // Variante 2: minimizada (después de "Más tarde")
  if (minimized) {
    return (
      <button
        type="button"
        onClick={handleExpand}
        className="flex items-center w-full transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          background: "var(--surface-card)",
          border: "0.5px solid var(--border-ui)",
          borderRadius: "var(--radius-card)",
          padding: "8px 14px",
          gap: 10,
          marginBottom: 16,
          cursor: "pointer",
          outlineColor: "var(--wizard-coral)",
        }}
        aria-label="Expandir tarjeta de configuración"
      >
        <Sparkles size={13} style={{ color: "var(--badge-orange-text)", flexShrink: 0 }} aria-hidden="true" />
        <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--text-primary)" }}>
          Tu configuración: {progressPct}%
        </span>
        <div
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso de configuración del sitio"
          className="flex-1"
          style={{
            height: 4,
            background: "var(--surface-page)",
            borderRadius: 999,
            overflow: "hidden",
            margin: "0 6px",
            maxWidth: 220,
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background: "var(--status-active)",
              borderRadius: 999,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--wizard-coral)",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          Continuar
          <ArrowRight size={11} aria-hidden="true" />
        </span>
      </button>
    );
  }

  // Variante 3: expandida (default)
  return (
    <div
      role="region"
      aria-labelledby="setup-progress-title"
      style={{
        background: "var(--surface-card)",
        border: "0.5px solid var(--border-ui)",
        borderRadius: "var(--radius-card)",
        padding: 16,
        marginBottom: 16,
      }}
    >
      {/* Header: título + dia del trial */}
      <div className="flex items-start justify-between" style={{ marginBottom: 8, gap: 12 }}>
        <div className="flex items-center" style={{ gap: 8 }}>
          <Sparkles size={16} style={{ color: "var(--badge-orange-text)", flexShrink: 0 }} aria-hidden="true" />
          <p
            id="setup-progress-title"
            style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)" }}
          >
            Activá tu visibilidad en buscadores
          </p>
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
            · {completedCount} de {TOTAL_SECTIONS} listos
          </span>
        </div>
        <span
          className="flex items-center"
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--wizard-amber-text)",
            background: "var(--wizard-amber-light)",
            border: "1px solid var(--wizard-amber-border-strong)",
            borderRadius: 4,
            padding: "2px 8px",
            fontWeight: 500,
            gap: 4,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          <Clock size={10} aria-hidden="true" />
          Día {trialDay} de {trialTotalDays} del trial
        </span>
      </div>

      {/* Progress bar + % */}
      <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
        <div
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso de configuración: ${completedCount} de ${TOTAL_SECTIONS} secciones completas`}
          className="flex-1"
          style={{
            height: 6,
            background: "var(--surface-page)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background: "var(--status-active)",
              borderRadius: 999,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-primary)" }}>
          {progressPct}%
        </span>
      </div>

      {/* Lista de faltantes */}
      <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: 4 }}>
        Falta lo que hace que <strong style={{ color: "var(--text-primary)" }}>ChatGPT y Google</strong> te encuentren:
      </p>
      <ul
        className="flex flex-col"
        style={{ gap: 2, listStyle: "none", padding: 0, margin: "0 0 12px 0" }}
      >
        {pendingPreview.map((label) => (
          <li
            key={label}
            className="flex items-center"
            style={{ gap: 6, fontSize: "var(--font-size-sm)", color: "var(--text-primary)" }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 4,
                height: 4,
                background: "var(--text-secondary)",
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />
            {label}
          </li>
        ))}
        {pending.length > 3 && (
          <li
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-tertiary)",
              marginLeft: 10,
              marginTop: 2,
            }}
          >
            + {pending.length - 3} más
          </li>
        )}
      </ul>

      {/* CTAs */}
      <div className="flex items-center" style={{ gap: 12 }}>
        <button
          type="button"
          onClick={onContinue}
          className="flex items-center transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            height: 32,
            padding: "0 14px",
            background: "var(--wizard-coral)",
            border: "none",
            borderRadius: 6,
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            color: "#fff",
            cursor: "pointer",
            gap: 6,
            outlineColor: "var(--wizard-coral)",
            outlineOffset: 2,
          }}
        >
          Continuar configuración
          <span style={{ opacity: 0.85, fontWeight: 400 }}>· {remainingMin} min restantes</span>
        </button>
        <button
          type="button"
          onClick={handleMinimize}
          className="flex items-center transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            background: "transparent",
            border: "none",
            padding: "4px 6px",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-tertiary)",
            cursor: "pointer",
            gap: 4,
            borderRadius: 4,
            outlineColor: "var(--ring)",
          }}
        >
          Más tarde
          <ChevronUp size={11} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
