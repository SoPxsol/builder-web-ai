import { Bold, Italic, Link2, MessageSquare, MonitorPlay, Underline, Upload } from "lucide-react";
import type { PopupState, PopupVariant } from "../../../types/creation";

interface Props {
  state: PopupState;
  update: (patch: Partial<PopupState>) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 28,
  padding: "0 8px",
  background: "var(--surface-page)",
  border: "0.5px solid var(--border-ui)",
  borderRadius: 6,
  fontSize: 11,
  color: "var(--text-primary)",
  outlineColor: "var(--accent-info)",
  outlineOffset: 2,
  fontFamily: "inherit",
};

const inputClassName = "focus-visible:outline focus-visible:outline-2";

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: "var(--text-secondary)",
  marginBottom: 4,
  display: "block",
};

export function PopupStep1Design({ state, update }: Props) {
  return (
    <div className="flex flex-col" style={{ padding: 20, gap: 16 }}>
      {/* Selector tipo */}
      <div className="flex flex-col" style={{ gap: 6 }}>
        <span style={labelStyle}>Tipo</span>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(
            [
              { id: "popup" as PopupVariant, icon: MonitorPlay, label: "Popup", emoji: "🪟" },
              { id: "toast" as PopupVariant, icon: MessageSquare, label: "Toast", emoji: "💬" },
            ]
          ).map(({ id, label, emoji }) => {
            const selected = state.variant === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => update({ variant: id })}
                aria-pressed={selected}
                className="flex flex-col items-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  gap: 4,
                  padding: 10,
                  background: selected ? "var(--accent-info-bg)" : "#fff",
                  border: selected ? "1.5px solid var(--accent-info)" : "0.5px solid var(--border-ui)",
                  borderRadius: 6,
                  cursor: "pointer",
                  outlineColor: "var(--accent-info)",
                }}
              >
                <span aria-hidden="true" style={{ fontSize: 18 }}>
                  {emoji}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: selected ? 600 : 500,
                    color: selected ? "var(--accent-info)" : "var(--text-primary)",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nombre interno */}
      <div className="flex flex-col">
        <label htmlFor="pop-name" style={labelStyle}>
          Nombre interno <span style={{ color: "var(--accent-info)" }}>*</span>
        </label>
        <input
          id="pop-name"
          type="text"
          value={state.internalName}
          onChange={(e) => update({ internalName: e.target.value })}
          placeholder="Popup oferta verano"
          style={inputStyle}
          className={inputClassName}
        />
        <span style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 4 }}>
          Solo visible en la lista
        </span>
      </div>

      {/* Título */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
          <label htmlFor="pop-title" style={{ ...labelStyle, marginBottom: 0 }}>
            Título <span style={{ color: "var(--accent-info)" }}>*</span>
          </label>
          <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
            {state.title.length}/80
          </span>
        </div>
        <input
          id="pop-title"
          type="text"
          value={state.title}
          onChange={(e) => update({ title: e.target.value.slice(0, 80) })}
          placeholder="Ej: 15% de descuento por reserva directa"
          maxLength={80}
          style={inputStyle}
          className={inputClassName}
        />
      </div>

      {/* Texto descriptivo con toolbar */}
      <div className="flex flex-col">
        <label htmlFor="pop-desc" style={labelStyle}>
          Texto descriptivo
        </label>
        <div
          style={{
            border: "0.5px solid var(--border-ui)",
            borderRadius: 6,
            overflow: "hidden",
            background: "var(--surface-page)",
          }}
        >
          <div
            className="flex items-center"
            style={{
              gap: 2,
              padding: "4px 6px",
              borderBottom: "0.5px solid var(--border-ui)",
              background: "#fff",
            }}
          >
            {[
              { Icon: Bold, label: "Negrita" },
              { Icon: Italic, label: "Cursiva" },
              { Icon: Underline, label: "Subrayado" },
              { Icon: Link2, label: "Enlace" },
            ].map(({ Icon, label }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                className="flex items-center justify-center transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  width: 24,
                  height: 24,
                  background: "transparent",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  outlineColor: "var(--accent-info)",
                }}
              >
                <Icon size={12} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
              </button>
            ))}
          </div>
          <textarea
            id="pop-desc"
            value={state.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="Texto que aparece debajo del título."
            rows={3}
            style={{
              ...inputStyle,
              height: "auto",
              minHeight: 60,
              border: "none",
              background: "transparent",
              padding: "6px 8px",
              resize: "none",
              lineHeight: 1.4,
            }}
          />
        </div>
      </div>

      {/* Upload de imagen */}
      <div className="flex flex-col">
        <label style={labelStyle}>Imagen</label>
        <button
          type="button"
          onClick={() => update({ imageUrl: state.imageUrl ? "" : "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=70&w=600" })}
          className="flex flex-col items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            width: "100%",
            height: 80,
            background: state.imageUrl ? "var(--wizard-success-light)" : "var(--surface-page)",
            border: state.imageUrl
              ? "0.5px dashed var(--wizard-success-border)"
              : "0.5px dashed var(--border-ui)",
            borderRadius: 6,
            cursor: "pointer",
            gap: 4,
            outlineColor: "var(--accent-info)",
          }}
        >
          <Upload size={16} style={{ color: state.imageUrl ? "var(--wizard-success)" : "var(--text-tertiary)" }} aria-hidden="true" />
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: state.imageUrl ? "var(--wizard-success)" : "var(--text-secondary)",
            }}
          >
            {state.imageUrl ? "Imagen cargada ✓ (click para quitar)" : "Subir imagen"}
          </span>
          {!state.imageUrl && (
            <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
              JPG o PNG · mín. 400×300
            </span>
          )}
        </button>
      </div>

      {/* CTA */}
      <div className="flex flex-col">
        <label htmlFor="pop-cta" style={labelStyle}>
          Texto del botón (CTA) <span style={{ color: "var(--accent-info)" }}>*</span>
        </label>
        <input
          id="pop-cta"
          type="text"
          value={state.ctaText}
          onChange={(e) => update({ ctaText: e.target.value })}
          placeholder="Reservar ahora"
          style={inputStyle}
          className={inputClassName}
        />
      </div>

      {/* URL */}
      <div className="flex flex-col">
        <label htmlFor="pop-url" style={labelStyle}>
          URL de destino <span style={{ color: "var(--accent-info)" }}>*</span>
        </label>
        <input
          id="pop-url"
          type="url"
          value={state.ctaUrl}
          onChange={(e) => update({ ctaUrl: e.target.value })}
          placeholder="https://"
          style={inputStyle}
          className={inputClassName}
        />
      </div>

      {/* Abrir en */}
      <div className="flex flex-col">
        <label htmlFor="pop-open" style={labelStyle}>
          Abrir en
        </label>
        <select
          id="pop-open"
          value={state.openIn}
          onChange={(e) => update({ openIn: e.target.value as PopupState["openIn"] })}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="new-tab">Nueva pestaña</option>
          <option value="same-tab">Misma pestaña</option>
        </select>
      </div>
    </div>
  );
}
