import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";
import { TextField } from "./ui/text-field";
import { Button } from "./ui/button";

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
    // Focus ring azul (--accent-info) por contrato semántico: el foco de campos
    // de formulario NO usa --brand (reservado a CTAs). Alineado con TextField.
    outlineColor: hasError ? "var(--destructive)" : "var(--accent-info)",
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

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 600, margin: "0 auto" }}>
        <ViewHeader
          backTo="paginas"
          eyebrow={siteName}
          title="Datos del hotel"
          navigate={navigate}
          action={
            <Button
              variant="primary"
              onClick={handleSave}
              leftIcon={saveState === "saved" ? <Check size={12} /> : undefined}
              style={
                saveState === "saved"
                  ? { background: "var(--status-active)", outlineColor: "var(--status-active)" }
                  : undefined
              }
            >
              {saveState === "saved" ? "Guardado" : "Guardar cambios"}
            </Button>
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
          <TextField
            id="datos-nombreHotel"
            label="Nombre del hotel"
            value={form.nombreHotel}
            onChange={(v) => update("nombreHotel", v)}
            onBlur={() => blur("nombreHotel")}
            error={errors.nombreHotel}
          />
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
          <TextField
            id="datos-direccion"
            label="Dirección"
            value={form.direccion}
            onChange={(v) => update("direccion", v)}
            onBlur={() => blur("direccion")}
            error={errors.direccion}
          />
          <TextField
            id="datos-telefono"
            label="Teléfono"
            type="tel"
            inputMode="tel"
            value={form.telefono}
            onChange={(v) => update("telefono", v)}
            onBlur={() => blur("telefono")}
            error={errors.telefono}
          />
          <TextField
            id="datos-emailReservas"
            label="Email de reservas"
            type="email"
            inputMode="email"
            value={form.emailReservas}
            onChange={(v) => update("emailReservas", v)}
            onBlur={() => blur("emailReservas")}
            error={errors.emailReservas}
          />
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
