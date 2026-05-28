import { Info, Minus, Plus } from "lucide-react";
import type { WizardState } from "../../../types/wizard";

interface Props {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

const MIN_ROOMS = 1;
const MAX_ROOMS = 8;

export function Step4Rooms({ state, update }: Props) {
  const { rooms } = state;

  function setCount(next: number) {
    const clamped = Math.max(MIN_ROOMS, Math.min(MAX_ROOMS, next));
    const names = [...rooms.names];
    if (clamped > names.length) {
      while (names.length < clamped) names.push("");
    } else if (clamped < names.length) {
      names.length = clamped;
    }
    update({ rooms: { count: clamped, names } });
  }

  function setName(idx: number, value: string) {
    const names = [...rooms.names];
    names[idx] = value;
    update({ rooms: { ...rooms, names } });
  }

  return (
    <div className="flex flex-col" style={{ padding: "20px 24px", gap: 14 }}>
      <div>
        <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
          Tipos de habitación
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 4 }}>
          Solo el nombre por ahora. Fotos, amenities y tarifas vienen en la configuración completa.
        </p>
      </div>

      {/* Stepper de cantidad */}
      <div
        className="flex items-center justify-between"
        style={{
          background: "var(--surface-page)",
          border: "1px solid var(--border-ui)",
          borderRadius: 6,
          padding: "10px 12px",
        }}
      >
        <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--text-primary)" }}>
          ¿Cuántos tipos de habitación tenés?
        </span>
        <div className="flex items-center" style={{ gap: 8 }}>
          <button
            type="button"
            onClick={() => setCount(rooms.count - 1)}
            disabled={rooms.count <= MIN_ROOMS}
            aria-label="Reducir cantidad"
            className="flex items-center justify-center transition-opacity hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              width: 24,
              height: 24,
              background: "#fff",
              border: "1px solid var(--border-ui)",
              borderRadius: 4,
              color: "var(--text-secondary)",
              cursor: "pointer",
              outlineColor: "var(--accent-info)",
            }}
          >
            <Minus size={11} aria-hidden="true" />
          </button>
          <span
            aria-live="polite"
            style={{
              minWidth: 18,
              textAlign: "center",
              fontSize: "var(--font-size-md)",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {rooms.count}
          </span>
          <button
            type="button"
            onClick={() => setCount(rooms.count + 1)}
            disabled={rooms.count >= MAX_ROOMS}
            aria-label="Aumentar cantidad"
            className="flex items-center justify-center transition-opacity hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              width: 24,
              height: 24,
              background: "#fff",
              border: "1px solid var(--border-ui)",
              borderRadius: 4,
              color: "var(--text-secondary)",
              cursor: "pointer",
              outlineColor: "var(--accent-info)",
            }}
          >
            <Plus size={11} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Inputs por habitación */}
      <div className="flex flex-col" style={{ gap: 8 }}>
        {rooms.names.map((name, idx) => (
          <div key={idx} className="flex items-center" style={{ gap: 8 }}>
            <div
              aria-hidden="true"
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "var(--surface-page)",
                border: "1px solid var(--border-ui)",
                fontSize: 9,
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              {idx + 1}
            </div>
            <input
              id={`wiz-room-${idx}`}
              type="text"
              value={name}
              onChange={(e) => setName(idx, e.target.value)}
              placeholder="Ej: Suite Superior, Habitación Estándar…"
              aria-label={`Nombre de habitación ${idx + 1}`}
              className="flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                height: 28,
                border: "1px solid var(--border-ui)",
                borderRadius: 5,
                padding: "0 8px",
                fontSize: "var(--font-size-md)",
                color: "var(--text-primary)",
                background: "#fff",
                outlineColor: "var(--accent-info)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Nota informativa */}
      <div
        className="flex"
        style={{
          background: "var(--wizard-amber-light)",
          border: "1px solid var(--wizard-amber-border-strong)",
          borderRadius: 6,
          padding: 10,
          gap: 6,
        }}
      >
        <Info
          size={12}
          aria-hidden="true"
          style={{ color: "var(--wizard-amber-accent)", flexShrink: 0, marginTop: 2 }}
        />
        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--wizard-amber-text)", lineHeight: 1.55 }}>
          Fotos, amenities y tarifas de cada habitación se configuran en el Wizard de configuración
          completa.
        </p>
      </div>
    </div>
  );
}
