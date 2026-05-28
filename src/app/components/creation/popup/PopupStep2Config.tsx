import { AlertTriangle, Check, Star } from "lucide-react";
import type { PopupPosition, PopupState } from "../../../types/creation";

interface Props {
  state: PopupState;
  update: (patch: Partial<PopupState>) => void;
}

const POSITIONS: PopupPosition[][] = [
  ["top-left", "top-center", "top-right"],
  ["middle-left", "center", "middle-right"],
  ["bottom-left", "bottom-center", "bottom-right"],
];

const POSITION_LABELS: Record<PopupPosition, string> = {
  "top-left": "Arriba izq.",
  "top-center": "Arriba",
  "top-right": "Arriba der.",
  "middle-left": "Izquierda",
  center: "Centro",
  "middle-right": "Derecha",
  "bottom-left": "Abajo izq.",
  "bottom-center": "Abajo",
  "bottom-right": "Abajo der.",
};

interface PageOption {
  id: string;
  label: string;
  hasConflict?: boolean;
}

const PAGES: PageOption[] = [
  { id: "inicio", label: "Inicio" },
  { id: "reservas", label: "Reservas", hasConflict: true },
  { id: "habitaciones", label: "Habitaciones" },
  { id: "galeria", label: "Galería" },
  { id: "contacto", label: "Contacto" },
  { id: "blog", label: "Blog" },
];

export function PopupStep2Config({ state, update }: Props) {
  function setPosition(p: PopupPosition) {
    update({ position: p });
  }

  function togglePage(id: string) {
    const next = state.pages.includes(id)
      ? state.pages.filter((p) => p !== id)
      : [...state.pages, id];
    update({ pages: next });
  }

  const reservasSelected = state.pages.includes("reservas");

  return (
    <div className="flex flex-col" style={{ padding: 20, gap: 18 }}>
      {/* Posición */}
      <div>
        <p
          style={{
            fontSize: 10,
            color: "var(--text-secondary)",
            marginBottom: 8,
          }}
        >
          Posición en pantalla
        </p>
        <div
          role="radiogroup"
          aria-label="Posición del popup"
          className="grid"
          style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}
        >
          {POSITIONS.flat().map((pos) => {
            const selected = state.position === pos;
            const isCenter = pos === "center";
            return (
              <button
                key={pos}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPosition(pos)}
                className="flex flex-col items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  aspectRatio: "1.4",
                  background: selected ? "var(--accent-info-bg)" : "var(--surface-page)",
                  border: selected
                    ? "1.5px solid var(--accent-info)"
                    : "0.5px solid var(--border-ui)",
                  borderRadius: 4,
                  cursor: "pointer",
                  outlineColor: "var(--accent-info)",
                  padding: 4,
                  gap: 2,
                }}
                title={POSITION_LABELS[pos]}
              >
                {isCenter && (
                  <Star
                    size={9}
                    aria-hidden="true"
                    style={{ color: selected ? "var(--accent-info)" : "var(--text-tertiary)" }}
                  />
                )}
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: selected ? 600 : 400,
                    color: selected ? "var(--accent-info)" : "var(--text-secondary)",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {POSITION_LABELS[pos]}
                </span>
              </button>
            );
          })}
        </div>
        {state.position === "center" && (
          <div
            className="flex items-center"
            style={{
              marginTop: 8,
              padding: "6px 10px",
              background: "var(--teal-bg)",
              border: "0.5px solid var(--teal)",
              borderRadius: 5,
              gap: 6,
              fontSize: 11,
              color: "var(--teal-text)",
              fontWeight: 500,
            }}
          >
            <Star size={11} aria-hidden="true" />
            Centro — recomendado
          </div>
        )}
      </div>

      {/* Páginas */}
      <div>
        <p
          style={{
            fontSize: 10,
            color: "var(--text-secondary)",
            marginBottom: 8,
          }}
        >
          Mostrar en estas páginas
        </p>
        <div className="flex flex-col" style={{ gap: 4 }}>
          {PAGES.map((page) => {
            const checked = state.pages.includes(page.id);
            return (
              <label
                key={page.id}
                className="flex items-center transition-colors"
                style={{
                  gap: 10,
                  padding: 8,
                  background: checked ? "var(--accent-info-bg)" : "var(--surface-page)",
                  border: checked
                    ? "0.5px solid var(--accent-info)"
                    : "0.5px solid var(--border-ui)",
                  borderRadius: 5,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePage(page.id)}
                  aria-label={page.label}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 14,
                    height: 14,
                    background: checked ? "var(--accent-info)" : "#fff",
                    border: checked ? "none" : "1.5px solid var(--border-ui)",
                    borderRadius: 3,
                  }}
                >
                  {checked && <Check size={9} style={{ color: "#fff" }} />}
                </span>
                <span
                  className="flex-1"
                  style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}
                >
                  {page.label}
                </span>
                {page.hasConflict && (
                  <span
                    className="flex items-center"
                    style={{
                      fontSize: 9,
                      padding: "1px 6px",
                      background: "var(--wizard-amber-light)",
                      border: "0.5px solid var(--wizard-amber-border-strong)",
                      color: "var(--wizard-amber-text)",
                      borderRadius: 3,
                      fontWeight: 500,
                      gap: 3,
                    }}
                  >
                    <AlertTriangle size={9} aria-hidden="true" />
                    Conflicto
                  </span>
                )}
              </label>
            );
          })}
        </div>
        {reservasSelected && (
          <div
            className="flex items-start"
            style={{
              marginTop: 10,
              padding: 10,
              background: "var(--wizard-amber-light)",
              border: "0.5px solid var(--wizard-amber-border-strong)",
              borderRadius: 5,
              gap: 6,
              fontSize: 11,
              color: "var(--wizard-amber-text)",
            }}
          >
            <AlertTriangle
              size={12}
              aria-hidden="true"
              style={{ flexShrink: 0, marginTop: 1 }}
            />
            <span style={{ lineHeight: 1.5 }}>
              <strong>Ya tiene popup activo.</strong> Si guardás, el popup actual se pausa y se
              activa este. Podés cambiar después en la lista de pop-ups.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
