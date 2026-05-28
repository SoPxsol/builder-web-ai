import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { W2State } from "../../../types/wizard2";
import { SectionEyebrow } from "../shared/SectionEyebrow";

interface Props {
  state: W2State;
  update: (patch: Partial<W2State>) => void;
}

const CATEGORIES = [
  { value: "boutique", label: "Boutique" },
  { value: "business", label: "Business" },
  { value: "resort", label: "Resort" },
  { value: "familiar", label: "Familiar" },
];

const FONTS = ["Inter", "Playfair Display", "Lora", "Montserrat"];

const AI_LONG_DESCRIPTION =
  "Hotel boutique en el corazón de Córdoba. Diseño contemporáneo, atención personalizada y una ubicación privilegiada en el centro histórico. 15 habitaciones únicas, desayuno gourmet y rooftop con vista a la ciudad.";

const inputStyle: React.CSSProperties = {
  height: 28,
  padding: "0 8px",
  background: "var(--surface-page)",
  border: "1px solid var(--border-ui)",
  borderRadius: 5,
  fontSize: "var(--font-size-sm)",
  color: "var(--text-primary)",
  outline: "none",
  outlineColor: "var(--accent-info)",
  fontFamily: "inherit",
  width: "100%",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  height: "auto",
  minHeight: 60,
  padding: "6px 8px",
  resize: "none",
  lineHeight: 1.4,
};

export function S1Profile({ state, update }: Props) {
  const { profile } = state;
  const [generatingDesc, setGeneratingDesc] = useState(false);

  function setField<K extends keyof typeof profile>(key: K, value: (typeof profile)[K]) {
    update({ profile: { ...profile, [key]: value } });
  }

  function generateLongDescription() {
    setGeneratingDesc(true);
    setTimeout(() => {
      setField("longDescription", AI_LONG_DESCRIPTION);
      setGeneratingDesc(false);
    }, 800);
  }

  return (
    <div className="flex flex-col" style={{ padding: "20px 24px" }}>
      <SectionEyebrow group="launch" id="s1-eyebrow" />

      <div style={{ marginBottom: 14 }} aria-describedby="s1-eyebrow">
        <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
          Perfil completo
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 4 }}>
          Datos del hotel, categoría, descripción y contacto corporativo.
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="s1-name" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
            Nombre del hotel
          </label>
          <input
            id="s1-name"
            type="text"
            value={profile.hotelName}
            onChange={(e) => setField("hotelName", e.target.value)}
            placeholder="Ej: Hotel Plaza Mayor"
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="s1-category" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
            Categoría
          </label>
          <select
            id="s1-category"
            value={profile.category}
            onChange={(e) => setField("category", e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">Seleccioná…</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="s1-font" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
            Tipografía
          </label>
          <select
            id="s1-font"
            value={profile.font}
            onChange={(e) => setField("font", e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="s1-email" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
            Email corporativo <span style={{ color: "var(--accent-info)" }}>*</span>
          </label>
          <input
            id="s1-email"
            type="email"
            value={profile.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="contacto@hotel.com"
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="s1-phone" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
            Teléfono
          </label>
          <input
            id="s1-phone"
            type="tel"
            value={profile.phone}
            onChange={(e) => setField("phone", e.target.value)}
            placeholder="+54 11 0000-0000"
            style={inputStyle}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="s1-short" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
            Descripción corta (hasta 160 caracteres)
          </label>
          <input
            id="s1-short"
            type="text"
            value={profile.shortDescription}
            onChange={(e) => setField("shortDescription", e.target.value)}
            placeholder="Hotel boutique en el centro histórico"
            maxLength={170}
            style={inputStyle}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
            <label htmlFor="s1-long" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
              Descripción larga
            </label>
            <button
              type="button"
              onClick={generateLongDescription}
              disabled={generatingDesc}
              className="inline-flex items-center transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "var(--wizard-amber-light)",
                border: "1px solid var(--wizard-amber-border-strong)",
                borderRadius: 3,
                fontSize: 9,
                fontWeight: 500,
                color: "var(--wizard-amber-text)",
                padding: "1px 6px",
                gap: 2,
                cursor: "pointer",
                outlineColor: "var(--accent-info)",
              }}
            >
              {generatingDesc ? (
                <Loader2 size={9} className="animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles size={9} aria-hidden="true" />
              )}
              {generatingDesc ? "Generando…" : "Generar con IA"}
            </button>
          </div>
          <textarea
            id="s1-long"
            value={profile.longDescription}
            onChange={(e) => setField("longDescription", e.target.value)}
            placeholder="Contale al huésped lo que hace único a tu hotel."
            rows={4}
            style={textareaStyle}
          />
        </div>
      </div>
    </div>
  );
}
