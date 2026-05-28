import type { W2State } from "../../../types/wizard2";
import { SectionEyebrow } from "../shared/SectionEyebrow";
import { Toggle } from "../shared/Toggle";

interface Props {
  state: W2State;
  update: (patch: Partial<W2State>) => void;
}

interface LangOption {
  code: string;
  label: string;
  flag: string;
  priority: "high" | "medium" | "low";
}

const LANGUAGES: LangOption[] = [
  { code: "es", label: "Español", flag: "🇪🇸", priority: "high" },
  { code: "en", label: "Inglés", flag: "🇺🇸", priority: "high" },
  { code: "pt", label: "Portugués", flag: "🇧🇷", priority: "medium" },
  { code: "fr", label: "Francés", flag: "🇫🇷", priority: "medium" },
  { code: "it", label: "Italiano", flag: "🇮🇹", priority: "low" },
  { code: "de", label: "Alemán", flag: "🇩🇪", priority: "low" },
];

const CURRENCIES = [
  { code: "ARS", label: "Peso Argentino" },
  { code: "USD", label: "Dólar estadounidense" },
  { code: "EUR", label: "Euro" },
  { code: "BRL", label: "Real brasileño" },
  { code: "CLP", label: "Peso chileno" },
  { code: "MXN", label: "Peso mexicano" },
];

function priorityBadge(p: LangOption["priority"]) {
  if (p === "high") {
    return {
      text: "Alta prioridad",
      background: "var(--wizard-purple-light)",
      border: "1px solid var(--wizard-purple-border)",
      color: "var(--wizard-purple-text)",
    };
  }
  if (p === "medium") {
    return {
      text: "Recomendado",
      background: "var(--wizard-amber-light)",
      border: "1px solid var(--wizard-amber-border-strong)",
      color: "var(--wizard-amber-text)",
    };
  }
  return null;
}

export function S2Languages({ state, update }: Props) {
  const { languages } = state;

  function toggleLang(code: string) {
    if (code === "es") return; // español no se desactiva
    const active = new Set(languages.active);
    if (active.has(code)) active.delete(code);
    else active.add(code);
    update({ languages: { ...languages, active: Array.from(active) } });
  }

  function setCurrency(currency: string) {
    update({ languages: { ...languages, currency } });
  }

  return (
    <div className="flex flex-col" style={{ padding: "20px 24px" }}>
      <SectionEyebrow group="grow" id="s2-eyebrow" />

      <div style={{ marginBottom: 14 }} aria-describedby="s2-eyebrow">
        <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
          Idiomas y monedas
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 4 }}>
          Cada idioma activo suma posiciones en búsquedas internacionales. La IA genera la variante automáticamente.
        </p>
      </div>

      {/* Idiomas */}
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "var(--text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          borderBottom: "1px solid var(--border-ui)",
          paddingBottom: 4,
          marginBottom: 8,
        }}
      >
        Idiomas disponibles
      </p>

      <div className="flex flex-col" style={{ gap: 6 }}>
        {LANGUAGES.map((lang) => {
          const active = languages.active.includes(lang.code);
          const isFixed = lang.code === "es";
          const badge = priorityBadge(lang.priority);
          return (
            <div
              key={lang.code}
              className="flex items-center"
              style={{
                gap: 10,
                padding: 10,
                background: "var(--surface-page)",
                border: "1px solid var(--border-ui)",
                borderRadius: 5,
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
                {lang.flag}
              </span>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center" style={{ gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "var(--font-size-md)", fontWeight: 500, color: "var(--text-primary)" }}>
                    {lang.label}
                  </span>
                  {isFixed && (
                    <span style={{ fontSize: 9, color: "var(--text-tertiary)" }}>(siempre activo)</span>
                  )}
                  {badge && !isFixed && (
                    <span
                      style={{
                        fontSize: 9,
                        padding: "1px 6px",
                        borderRadius: 3,
                        background: badge.background,
                        border: badge.border,
                        color: badge.color,
                      }}
                    >
                      {badge.text}
                    </span>
                  )}
                </div>
              </div>
              <Toggle
                checked={active}
                onChange={() => toggleLang(lang.code)}
                ariaLabel={`${lang.label} ${active ? "activo" : "inactivo"}`}
                disabled={isFixed}
              />
            </div>
          );
        })}
      </div>

      {/* Moneda */}
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "var(--text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          borderBottom: "1px solid var(--border-ui)",
          paddingBottom: 4,
          marginBottom: 8,
          marginTop: 16,
        }}
      >
        Moneda principal
      </p>

      <div className="flex flex-col" style={{ gap: 4 }}>
        <label htmlFor="s2-currency" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
          Moneda con la que se cobran las reservas
        </label>
        <select
          id="s2-currency"
          value={languages.currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            height: 28,
            padding: "0 8px",
            background: "var(--surface-page)",
            border: "1px solid var(--border-ui)",
            borderRadius: 5,
            fontSize: "var(--font-size-sm)",
            color: "var(--text-primary)",
            outline: "none",
            outlineColor: "var(--accent-info)",
            cursor: "pointer",
          }}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} · {c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
