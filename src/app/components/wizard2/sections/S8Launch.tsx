import { Calendar, Check, Circle, Rocket } from "lucide-react";
import type { W2Launch, W2State } from "../../../types/wizard2";
import { SectionEyebrow } from "../shared/SectionEyebrow";
import { ChecklistItem } from "../shared/ChecklistItem";

interface Props {
  state: W2State;
  update: (patch: Partial<W2State>) => void;
}

interface ChecklistDef {
  key: keyof W2Launch;
  label: string;
  sublabel: string;
  badge: "required" | "recommended";
}

const CHECKLIST: ChecklistDef[] = [
  {
    key: "previewChecked",
    label: "Revisé el preview en desktop",
    sublabel: "Que el sitio se vea como esperás antes de publicar.",
    badge: "required",
  },
  {
    key: "mobileChecked",
    label: "Revisé en mobile",
    sublabel: "El 60% del tráfico hotelero LATAM es desde celular.",
    badge: "required",
  },
  {
    key: "seoChecked",
    label: "Validé los meta titles y descripciones",
    sublabel: "Aparecerán en Google y en respuestas de IA.",
    badge: "recommended",
  },
  {
    key: "testReservation",
    label: "Hice una reserva de prueba",
    sublabel: "Para asegurar que el flujo funciona end-to-end.",
    badge: "recommended",
  },
  {
    key: "meetingScheduled",
    label: "Agendé revisión con el asesor",
    sublabel: "Sesión de 30 minutos al mes 1 para ver métricas.",
    badge: "recommended",
  },
];

interface Milestone {
  done: boolean;
  label: string;
  timing: string;
}

const MILESTONES: Milestone[] = [
  { done: true, label: "Sitio publicado en dominio propio", timing: "Semana 1" },
  { done: false, label: "Google Search Console conectado", timing: "Semana 2" },
  { done: false, label: "Schema.org Hotel validado", timing: "Semana 2" },
  { done: false, label: "Primer popup inteligente activo", timing: "Semana 3" },
  { done: false, label: "Revisión con asesor (30 min)", timing: "Mes 1" },
];

export function S8Launch({ state, update }: Props) {
  const { launch } = state;

  function toggleItem(key: keyof W2Launch, value: boolean) {
    update({ launch: { ...launch, [key]: value } });
  }

  return (
    <div className="flex flex-col" style={{ padding: "20px 24px" }}>
      <SectionEyebrow group="launch" id="s8-eyebrow" />

      <div style={{ marginBottom: 14 }} aria-describedby="s8-eyebrow">
        <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
          Lanzamiento
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 4 }}>
          Antes de publicar, revisá estos puntos. La revisión con el asesor al mes 1 es clave para retención.
        </p>
      </div>

      {/* Checklist */}
      <div className="flex flex-col">
        {CHECKLIST.map((item) => (
          <ChecklistItem
            key={item.key}
            label={item.label}
            sublabel={item.sublabel}
            badge={item.badge}
            checked={launch[item.key]}
            onChange={(v) => toggleItem(item.key, v)}
          />
        ))}
      </div>

      {/* Adoption map */}
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
        Hitos del primer mes
      </p>

      <div
        style={{
          border: "1px solid var(--border-ui)",
          borderRadius: 5,
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        {MILESTONES.map((m, idx) => (
          <div
            key={m.label}
            className="flex items-start"
            style={{
              gap: 8,
              padding: "8px 12px",
              borderBottom: idx < MILESTONES.length - 1 ? "1px solid var(--border-ui)" : "none",
              fontSize: 11,
            }}
          >
            {m.done ? (
              <Check size={12} style={{ color: "var(--wizard-success-done)", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
            ) : (
              <Circle size={12} style={{ color: "var(--text-tertiary)", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
            )}
            <span className="flex-1" style={{ color: "var(--text-secondary)", lineHeight: 1.4 }}>
              {m.label}
            </span>
            <span
              style={{
                fontSize: 9,
                padding: "1px 6px",
                borderRadius: 3,
                background: "var(--wizard-amber-light)",
                border: "1px solid var(--wizard-amber-border-strong)",
                color: "var(--wizard-amber-text)",
                whiteSpace: "nowrap",
              }}
            >
              {m.timing}
            </span>
          </div>
        ))}
      </div>

      {/* Botón agenda */}
      <button
        type="button"
        onClick={() => toggleItem("meetingScheduled", true)}
        className="flex items-center justify-center w-full transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          height: 32,
          background: "var(--text-primary)",
          border: "none",
          borderRadius: 5,
          fontSize: 11,
          fontWeight: 500,
          color: "#fff",
          cursor: "pointer",
          gap: 6,
          marginBottom: 8,
          outlineColor: "var(--accent-info)",
        }}
      >
        <Calendar size={12} aria-hidden="true" />
        Agendar revisión del mes 1 con el asesor
      </button>

      {/* Nota coral */}
      <div
        className="flex items-start"
        style={{
          gap: 6,
          background: "var(--accent-info-bg)",
          border: "1px solid var(--accent-info)",
          borderRadius: 5,
          padding: 10,
        }}
      >
        <Rocket size={12} aria-hidden="true" style={{ color: "var(--accent-info)", flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 10, color: "var(--wizard-amber-text)", lineHeight: 1.5 }}>
          Una vez publicado, el sitio queda activo al instante. La configuración que dejaste pendiente se puede completar desde el editor.
        </p>
      </div>
    </div>
  );
}
