import { useState } from "react";
import {
  ChevronDown,
  Clock,
  Hourglass,
  Lock,
  MonitorSmartphone,
  MousePointer,
  Smartphone,
  Zap,
  ChevronsDown,
  LogOut,
  Monitor,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PopupState, PopupTrigger } from "../../../types/creation";
import { Toggle } from "../../wizard2/shared/Toggle";

interface Props {
  state: PopupState;
  update: (patch: Partial<PopupState>) => void;
}

interface TriggerDef {
  id: PopupTrigger;
  icon: LucideIcon;
  label: string;
  description: string;
  pro?: boolean;
}

const TRIGGERS: TriggerDef[] = [
  { id: "delay", icon: Clock, label: "Demora", description: "Después de N segundos" },
  { id: "exit", icon: LogOut, label: "Exit intent", description: "Cursor sale del sitio" },
  { id: "scroll", icon: ChevronsDown, label: "Scroll", description: "Tras desplazar N%" },
  { id: "click", icon: MousePointer, label: "On-click", description: "Botón específico" },
  { id: "inactivity", icon: Hourglass, label: "Inactividad", description: "Sin movimiento N seg" },
  { id: "js", icon: Zap, label: "JS Trigger", description: "Evento custom", pro: true },
];

const inputStyle: React.CSSProperties = {
  width: 80,
  height: 26,
  padding: "0 8px",
  background: "#fff",
  border: "0.5px solid var(--border-ui)",
  borderRadius: 5,
  fontSize: 11,
  color: "var(--text-primary)",
  outline: "none",
  outlineColor: "var(--accent-info)",
  fontFamily: "inherit",
};

export function PopupStep3Rules({ state, update }: Props) {
  const [freqOpen, setFreqOpen] = useState(true);
  const [targetingOpen, setTargetingOpen] = useState(false);

  function toggleTrigger(id: PopupTrigger) {
    update({ triggers: { ...state.triggers, [id]: !state.triggers[id] } });
  }

  function setDevice(key: "desktop" | "mobile", value: boolean) {
    update({ devices: { ...state.devices, [key]: value } });
  }

  return (
    <div className="flex flex-col" style={{ padding: 20, gap: 16 }}>
      {/* Triggers */}
      <div>
        <p
          style={{
            fontSize: 10,
            color: "var(--text-secondary)",
            marginBottom: 8,
          }}
        >
          Trigger
        </p>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {TRIGGERS.map(({ id, icon: Icon, label, description, pro }) => {
            const active = !!state.triggers[id];
            return (
              <div
                key={id}
                className="flex flex-col"
                style={{
                  padding: 10,
                  background: pro
                    ? "var(--surface-page)"
                    : active
                    ? "var(--accent-info-bg)"
                    : "#fff",
                  border: active && !pro
                    ? "1.5px solid var(--accent-info)"
                    : "0.5px solid var(--border-ui)",
                  borderRadius: 6,
                  opacity: pro ? 0.6 : 1,
                  gap: 6,
                }}
              >
                <div className="flex items-center justify-between" style={{ gap: 6 }}>
                  <div className="flex items-center" style={{ gap: 6 }}>
                    {pro ? (
                      <Lock size={11} style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
                    ) : (
                      <Icon
                        size={12}
                        aria-hidden="true"
                        style={{ color: active ? "var(--accent-info)" : "var(--text-secondary)" }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: pro ? "var(--text-tertiary)" : "var(--text-primary)",
                      }}
                    >
                      {label}
                    </span>
                    {pro && (
                      <span
                        style={{
                          fontSize: 8,
                          padding: "1px 5px",
                          background: "var(--wizard-purple-light)",
                          border: "0.5px solid var(--wizard-purple-border)",
                          color: "var(--wizard-purple-text)",
                          borderRadius: 3,
                          fontWeight: 500,
                        }}
                      >
                        Pro
                      </span>
                    )}
                  </div>
                  {!pro && (
                    <Toggle
                      checked={active}
                      onChange={() => toggleTrigger(id)}
                      ariaLabel={label}
                    />
                  )}
                </div>
                <p style={{ fontSize: 10, color: "var(--text-tertiary)", lineHeight: 1.3 }}>
                  {description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Config contextual */}
        {state.triggers.delay && (
          <div className="flex items-center" style={{ marginTop: 8, gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Mostrar después de</span>
            <input
              type="number"
              min={1}
              max={300}
              value={state.delaySeconds}
              onChange={(e) => update({ delaySeconds: Number(e.target.value) || 0 })}
              aria-label="Segundos de demora"
              style={inputStyle}
            />
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>segundos</span>
          </div>
        )}
        {state.triggers.exit && (
          <div
            className="flex items-center"
            style={{
              marginTop: 8,
              padding: "6px 10px",
              background: "var(--teal-bg)",
              border: "0.5px solid var(--teal)",
              borderRadius: 5,
              gap: 6,
              fontSize: 10,
              color: "var(--teal-text)",
            }}
          >
            <Monitor size={11} aria-hidden="true" />
            Solo Desktop — exit intent no aplica en mobile.
          </div>
        )}
        {state.triggers.scroll && (
          <div className="flex items-center" style={{ marginTop: 8, gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Al desplazar</span>
            <input
              type="number"
              min={1}
              max={100}
              value={state.scrollPercent}
              onChange={(e) => update({ scrollPercent: Number(e.target.value) || 0 })}
              aria-label="Porcentaje de scroll"
              style={inputStyle}
            />
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>%</span>
          </div>
        )}
        {state.triggers.inactivity && (
          <div className="flex items-center" style={{ marginTop: 8, gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Sin actividad por</span>
            <input
              type="number"
              min={5}
              max={600}
              value={state.inactivitySeconds}
              onChange={(e) => update({ inactivitySeconds: Number(e.target.value) || 0 })}
              aria-label="Segundos de inactividad"
              style={inputStyle}
            />
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>segundos</span>
          </div>
        )}
      </div>

      {/* Devices */}
      <div>
        <p style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 8 }}>Dispositivos</p>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {(
            [
              { key: "desktop" as const, icon: MonitorSmartphone, label: "Desktop" },
              { key: "mobile" as const, icon: Smartphone, label: "Mobile" },
            ]
          ).map(({ key, icon: Icon, label }) => {
            const active = state.devices[key];
            return (
              <div
                key={key}
                className="flex items-center"
                style={{
                  padding: 10,
                  background: active ? "var(--accent-info-bg)" : "#fff",
                  border: active
                    ? "1.5px solid var(--accent-info)"
                    : "0.5px solid var(--border-ui)",
                  borderRadius: 6,
                  gap: 8,
                }}
              >
                <Icon
                  size={13}
                  aria-hidden="true"
                  style={{
                    color: active ? "var(--accent-info)" : "var(--text-secondary)",
                    flexShrink: 0,
                  }}
                />
                <span
                  className="flex-1"
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                  }}
                >
                  {label}
                </span>
                <Toggle
                  checked={active}
                  onChange={(v) => setDevice(key, v)}
                  ariaLabel={label}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Acordeón Frecuencia */}
      <Accordion
        title="Frecuencia"
        open={freqOpen}
        onToggle={() => setFreqOpen((v) => !v)}
      >
        <div className="flex flex-col" style={{ gap: 4 }}>
          {(
            [
              { value: "once-per-session" as const, label: "1× por sesión", subtitle: "Recomendado" },
              { value: "always" as const, label: "Siempre", subtitle: "Cada visita" },
            ]
          ).map(({ value, label, subtitle }) => {
            const selected = state.frequency === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => update({ frequency: value })}
                className="flex items-center text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  padding: 8,
                  background: selected ? "var(--accent-info-bg)" : "var(--surface-page)",
                  border: selected
                    ? "0.5px solid var(--accent-info)"
                    : "0.5px solid var(--border-ui)",
                  borderRadius: 5,
                  cursor: "pointer",
                  gap: 10,
                  outlineColor: "var(--accent-info)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: selected ? "var(--accent-info)" : "#fff",
                    border: selected ? "none" : "1.5px solid var(--border-ui)",
                  }}
                >
                  {selected && (
                    <span
                      style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }}
                    />
                  )}
                </span>
                <div className="flex flex-col">
                  <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>{subtitle}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Accordion>

      <Accordion
        title="Page targeting (avanzado)"
        open={targetingOpen}
        onToggle={() => setTargetingOpen((v) => !v)}
      >
        <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Reglas más finas por URL, query params o referrer. Configurable luego desde el editor del
          popup.
        </p>
      </Accordion>
    </div>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "0.5px solid var(--border-ui)",
        borderRadius: 5,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-center w-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          background: "var(--surface-page)",
          border: "none",
          padding: "10px 12px",
          gap: 8,
          cursor: "pointer",
          textAlign: "left",
          borderBottom: open ? "0.5px solid var(--border-ui)" : "none",
          outlineColor: "var(--accent-info)",
        }}
      >
        <span
          className="flex-1"
          style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}
        >
          {title}
        </span>
        <ChevronDown
          size={12}
          aria-hidden="true"
          style={{
            color: "var(--text-secondary)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease",
          }}
        />
      </button>
      {open && <div style={{ padding: 12 }}>{children}</div>}
    </div>
  );
}
