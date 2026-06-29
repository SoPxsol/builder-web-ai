import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

interface FormState {
  nombreHotel: string;
  tipoAlojamiento: string;
  direccion: string;
  telefono: string;
  emailReservas: string;
  moneda: string;
}

type FieldKey = keyof FormState;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_MIN = 8;

const labelStyle = {
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  color: "var(--text-secondary)",
  marginBottom: 5,
  display: "block" as const,
};

function fieldStyle(hasError: boolean) {
  return {
    height: 34,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: "var(--radius-nav)",
    border: hasError ? "1px solid var(--destructive)" : "0.5px solid var(--border-ui)",
    background: "var(--surface-page)",
    fontSize: "var(--font-size-md)",
    color: "var(--text-primary)",
    outlineColor: hasError ? "var(--destructive)" : "var(--brand)",
    outlineOffset: 2,
    width: "100%",
  };
}

export function DatosBasicosView({ siteName, navigate }: Props) {
  const [form, setForm] = useState<FormState>({
    nombreHotel:      "Hotel Tamarindo",
    tipoAlojamiento:  "Hotel boutique",
    direccion:        "Av. Costera 120, Tamarindo",
    telefono:         "+52 984 000 0000",
    emailReservas:    "reservas@tamarindo.com",
    moneda:           "MXN",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [touched, setTouched] = useState<Set<FieldKey>>(new Set());
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");

  function validate(f: FormState): Partial<Record<FieldKey, string>> {
    const e: Partial<Record<FieldKey, string>> = {};
    if (!f.nombreHotel.trim()) e.nombreHotel = "El nombre del hotel es obligatorio.";
    if (!f.emailReservas.trim()) e.emailReservas = "El email es obligatorio.";
    else if (!EMAIL_RE.test(f.emailReservas.trim())) e.emailReservas = "Formato de email inválido.";
    if (!f.telefono.trim()) e.telefono = "El teléfono es obligatorio.";
    else {
      const digits = f.telefono.replace(/\D/g, "");
      if (digits.length < PHONE_DIGITS_MIN) e.telefono = `Mínimo ${PHONE_DIGITS_MIN} dígitos.`;
    }
    return e;
  }

  function update(key: FieldKey, value: string) {
    const next = { ...form, [key]: value };
    setForm(next);
    setSaveState("idle");
    if (touched.has(key) || errors[key]) {
      setErrors(validate(next));
    }
  }

  function blur(key: FieldKey) {
    setTouched((prev) => new Set(prev).add(key));
    setErrors(validate(form));
  }

  function handleSave() {
    const newErrors = validate(form);
    setErrors(newErrors);
    setTouched(new Set(Object.keys(form) as FieldKey[]));
    if (Object.keys(newErrors).length > 0) {
      setSaveState("error");
      return;
    }
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2500);
  }

  function Field({
    label,
    field,
    type = "text",
    inputMode,
  }: {
    label: string;
    field: FieldKey;
    type?: string;
    inputMode?: "text" | "email" | "tel" | "url";
  }) {
    const id = `datos-${field}`;
    const errMsgId = `${id}-err`;
    const error = errors[field];
    return (
      <div>
        <label htmlFor={id} style={labelStyle}>{label}</label>
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          value={form[field]}
          onChange={(e) => update(field, e.target.value)}
          onBlur={() => blur(field)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errMsgId : undefined}
          className="focus-visible:outline focus-visible:outline-2"
          style={fieldStyle(!!error)}
        />
        {error && (
          <p
            id={errMsgId}
            className="flex items-center gap-1 mt-1"
            style={{ fontSize: "var(--font-size-xs)", color: "var(--destructive)" }}
          >
            <AlertCircle size={10} aria-hidden="true" /> {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 600, margin: "0 auto" }}>
        <ViewHeader
          backTo="paginas"
          eyebrow={siteName}
          title="Datos del hotel"
          navigate={navigate}
          action={
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 h-8 transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: saveState === "saved" ? "var(--status-active)" : "var(--brand)",
                borderRadius: "var(--radius-nav)",
                fontSize: "var(--font-size-md)",
                fontWeight: 500,
                color: "#fff",
                outlineColor: "var(--brand)",
                border: "none",
                cursor: "pointer",
              }}
            >
              {saveState === "saved" && <Check size={12} aria-hidden="true" />}
              {saveState === "saved" ? "Guardado" : "Guardar cambios"}
            </button>
          }
        />

        {saveState === "error" && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 px-4 py-2"
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--destructive)",
              borderRadius: "var(--radius-card)",
              color: "var(--destructive)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <AlertCircle size={14} aria-hidden="true" />
            Revisá los campos marcados antes de guardar.
          </div>
        )}

        {/* Datos del hotel */}
        <div
          className="p-4 flex flex-col gap-3"
          style={{
            background: "var(--surface-card)",
            borderRadius: "var(--radius-card)",
            border: "0.5px solid var(--border-ui)",
          }}
        >
          <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
            Datos del hotel
          </p>
          <Field label="Nombre del hotel" field="nombreHotel" />
          <div>
            <label htmlFor="datos-tipoAlojamiento" style={labelStyle}>Tipo de alojamiento</label>
            <select
              id="datos-tipoAlojamiento"
              value={form.tipoAlojamiento}
              onChange={(e) => update("tipoAlojamiento", e.target.value)}
              className="focus-visible:outline focus-visible:outline-2"
              style={{ ...fieldStyle(false), cursor: "pointer" }}
            >
              {[
                "Hotel boutique",
                "Hotel de ciudad",
                "Resort",
                "Hostel",
                "Apart-hotel",
                "Posada",
                "Otro",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <Field label="Dirección" field="direccion" />
          <Field label="Teléfono" field="telefono" type="tel" inputMode="tel" />
          <Field label="Email de reservas" field="emailReservas" type="email" inputMode="email" />
          <div>
            <label htmlFor="datos-moneda" style={labelStyle}>Moneda</label>
            <select
              id="datos-moneda"
              value={form.moneda}
              onChange={(e) => update("moneda", e.target.value)}
              className="focus-visible:outline focus-visible:outline-2"
              style={{ ...fieldStyle(false), cursor: "pointer" }}
            >
              {["MXN", "ARS", "USD", "EUR", "BRL", "CLP"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </main>
  );
}
