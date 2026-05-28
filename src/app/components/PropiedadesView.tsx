import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

interface FormState {
  siteName: string;
  siteSlug: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  checkIn: string;
  checkOut: string;
  currency: string;
  timezone: string;
}

type FieldKey = keyof FormState;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_MIN = 8;
const SLUG_RE = /^[a-z0-9-]+$/;

function validate(form: FormState): Partial<Record<FieldKey, string>> {
  const errors: Partial<Record<FieldKey, string>> = {};
  if (!form.siteName.trim()) errors.siteName = "El nombre del sitio es obligatorio.";
  if (!form.siteSlug.trim()) errors.siteSlug = "El slug es obligatorio.";
  else if (!SLUG_RE.test(form.siteSlug)) errors.siteSlug = "Solo minúsculas, números y guiones.";
  if (!form.email.trim()) errors.email = "El email es obligatorio.";
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = "Formato de email inválido.";
  if (!form.phone.trim()) errors.phone = "El teléfono es obligatorio.";
  else {
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < PHONE_DIGITS_MIN) errors.phone = `Mínimo ${PHONE_DIGITS_MIN} dígitos.`;
  }
  return errors;
}

export function PropiedadesView({ siteName, navigate }: Props) {
  const [form, setForm] = useState<FormState>({
    siteName:    "Hotel Tamarindo",
    siteSlug:    "hotel-tamarindo",
    tagline:     "Tu escapada perfecta en la costa.",
    email:       "contacto@tamarindo.com",
    phone:       "+54 11 4000-0000",
    address:     "Av. Costanera 1200, Buenos Aires",
    checkIn:     "14:00",
    checkOut:    "11:00",
    currency:    "ARS",
    timezone:    "America/Argentina/Buenos_Aires",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [touched, setTouched] = useState<Set<FieldKey>>(new Set());
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");

  function update(key: FieldKey, value: string) {
    const next = { ...form, [key]: value };
    setForm(next);
    setSaveState("idle");
    // Si el campo ya fue tocado o ya hay error, re-validamos en vivo para que el error desaparezca.
    if (touched.has(key) || errors[key]) {
      const newErrors = validate(next);
      setErrors(newErrors);
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

  // Nota informativa para check-in/check-out: el check-out típicamente es al día
  // siguiente del check-in, así que un valor numérico menor es normal en hotelería.
  const checkoutEarlierThanCheckin = form.checkIn && form.checkOut && form.checkOut < form.checkIn;

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

  function Field({ label, field, type = "text", inputMode }: { label: string; field: FieldKey; type?: string; inputMode?: "text" | "email" | "tel" | "url" }) {
    const id = `prop-${field}`;
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
          title="Habitaciones y servicios"
          description="Tipos de habitación, amenities, contacto y operación del hotel."
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

        {/* Identidad */}
        <div className="mb-4 p-4 flex flex-col gap-3" style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)" }}>
          <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Identidad</p>
          <Field label="Nombre del sitio" field="siteName" />
          <div>
            <label htmlFor="prop-siteSlug" style={labelStyle}>Slug (URL)</label>
            <div
              className="flex items-center focus-within:ring-2 focus-within:ring-offset-1"
              style={{
                height: 34,
                border: errors.siteSlug ? "1px solid var(--destructive)" : "0.5px solid var(--border-ui)",
                borderRadius: "var(--radius-nav)",
                background: "var(--surface-page)",
                overflow: "hidden",
                // @ts-expect-error — CSS custom prop para el ring de Tailwind
                "--tw-ring-color": errors.siteSlug ? "var(--destructive)" : "var(--brand)",
              }}
            >
              <span className="px-2 flex-shrink-0" style={{ fontSize: "var(--font-size-md)", color: "var(--text-tertiary)", borderRight: "0.5px solid var(--border-ui)", lineHeight: "34px" }}>pxsol.com/</span>
              <input
                id="prop-siteSlug"
                type="text"
                value={form.siteSlug}
                onChange={(e) => update("siteSlug", e.target.value)}
                onBlur={() => blur("siteSlug")}
                aria-invalid={errors.siteSlug ? true : undefined}
                aria-describedby={errors.siteSlug ? "prop-siteSlug-err" : undefined}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--font-size-md)", color: "var(--text-primary)", paddingLeft: 8 }}
              />
            </div>
            {errors.siteSlug && (
              <p id="prop-siteSlug-err" className="flex items-center gap-1 mt-1" style={{ fontSize: "var(--font-size-xs)", color: "var(--destructive)" }}>
                <AlertCircle size={10} aria-hidden="true" /> {errors.siteSlug}
              </p>
            )}
          </div>
          <Field label="Tagline" field="tagline" />
        </div>

        {/* Contacto */}
        <div className="mb-4 p-4 flex flex-col gap-3" style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)" }}>
          <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Contacto y ubicación</p>
          <Field label="Email de contacto" field="email" type="email" inputMode="email" />
          <Field label="Teléfono" field="phone" type="tel" inputMode="tel" />
          <Field label="Dirección" field="address" />
        </div>

        {/* Operación */}
        <div className="p-4 flex flex-col gap-3" style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)" }}>
          <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Operación</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check-in" field="checkIn" type="time" />
            <Field label="Check-out" field="checkOut" type="time" />
          </div>
          {checkoutEarlierThanCheckin && (
            <p
              role="note"
              className="flex items-start gap-1.5"
              style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)", lineHeight: 1.4 }}
            >
              <AlertCircle size={11} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
              El check-out es al día siguiente del check-in. Si tu horario es distinto, ajustá estos valores.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="prop-currency" style={labelStyle}>Moneda</label>
              <select
                id="prop-currency"
                value={form.currency}
                onChange={(e) => update("currency", e.target.value)}
                className="focus-visible:outline focus-visible:outline-2"
                style={{ ...fieldStyle(false), cursor: "pointer" }}
              >
                {["ARS", "USD", "EUR", "BRL", "CLP", "MXN"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="prop-timezone" style={labelStyle}>Zona horaria</label>
              <select
                id="prop-timezone"
                value={form.timezone}
                onChange={(e) => update("timezone", e.target.value)}
                className="focus-visible:outline focus-visible:outline-2"
                style={{ ...fieldStyle(false), cursor: "pointer" }}
              >
                {["America/Argentina/Buenos_Aires", "America/Santiago", "America/Mexico_City", "America/Bogota", "Europe/Madrid"].map((tz) => <option key={tz}>{tz}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
