import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Download, Loader2 } from "lucide-react";
import type { WizardInfo, WizardState } from "../../../types/wizard";

interface Props {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  /** Aumenta cada vez que el usuario intenta avanzar. Permite disparar validaciones. */
  attemptedNext: number;
}

interface OtaImportItem {
  label: string;
  status: "pending" | "loading" | "done";
}

const OTA_INITIAL_ITEMS: OtaImportItem[] = [
  { label: "Conectando con Booking.com…", status: "pending" },
  { label: "Importando nombre y descripción…", status: "pending" },
  { label: "Descargando fotos…", status: "pending" },
  { label: "Configurando dirección y contacto…", status: "pending" },
];

const OTA_MOCK_DATA: Partial<WizardInfo> = {
  hotelName: "Hotel Plaza Mayor Córdoba",
  email: "info@hotelplazamayor.com",
  phone: "+54 351 000-0000",
};

const OTA_TIMEOUT_MS = 15000;
const OTA_VALID_HOSTS = ["booking.com", "airbnb.com", "airbnb.com.ar", "despegar.com", "despegar.com.ar"];

function isValidOtaUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    return OTA_VALID_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

interface FieldProps {
  label: string;
  required?: boolean;
  invalid?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  id: string;
}

function Field({ label, required, invalid, value, onChange, placeholder, type = "text", id }: FieldProps) {
  return (
    <div className="flex flex-col" style={{ gap: 4 }}>
      <label htmlFor={id} style={{ fontSize: 10, color: "var(--text-secondary)" }}>
        {label} {required && <span style={{ color: "var(--destructive)" }}>*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          height: 28,
          padding: "0 8px",
          background: "var(--surface-page)",
          border: invalid ? "1px solid var(--destructive)" : "1px solid var(--border-ui)",
          borderRadius: 5,
          fontSize: "var(--font-size-sm)",
          color: "var(--text-primary)",
          outlineColor: "var(--accent-info)",
        }}
      />
    </div>
  );
}

export function Step3InfoContact({ state, update, attemptedNext }: Props) {
  const { info } = state;
  const [otaUrl, setOtaUrl] = useState("");
  const [otaItems, setOtaItems] = useState<OtaImportItem[]>(OTA_INITIAL_ITEMS);
  const [otaPhase, setOtaPhase] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [otaError, setOtaError] = useState<string | null>(null);
  const [showNameError, setShowNameError] = useState(false);
  // Tracker de timers en vuelo para limpiarlos en unmount y al reiniciar el import.
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Si el usuario intenta avanzar sin nombre, mostrar el error.
  useEffect(() => {
    if (attemptedNext > 0 && !info.hotelName.trim()) {
      setShowNameError(true);
    }
  }, [attemptedNext, info.hotelName]);

  // Limpiar error cuando el nombre se completa.
  useEffect(() => {
    if (info.hotelName.trim()) setShowNameError(false);
  }, [info.hotelName]);

  // Cleanup de timers al desmontar (ej: usuario cierra wizard a mitad de importación).
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function setField<K extends keyof WizardInfo>(key: K, value: WizardInfo[K]) {
    update({ info: { ...info, [key]: value } });
  }

  function applyDomainSuggestion() {
    const suggested = `${slugify(info.hotelName)}.com`;
    setField("domain", suggested);
  }

  const urlIsValid = isValidOtaUrl(otaUrl);

  function startImport() {
    if (!urlIsValid || otaPhase === "loading") return;
    clearTimers();
    setOtaError(null);
    setOtaPhase("loading");
    setOtaItems(OTA_INITIAL_ITEMS.map((it) => ({ ...it, status: "pending" })));

    const completionTime = OTA_INITIAL_ITEMS.length * 600 + 500;

    OTA_INITIAL_ITEMS.forEach((_item, idx) => {
      timersRef.current.push(
        setTimeout(() => {
          setOtaItems((prev) => prev.map((it, i) => (i === idx ? { ...it, status: "loading" } : it)));
        }, idx * 600),
      );
      timersRef.current.push(
        setTimeout(() => {
          setOtaItems((prev) => prev.map((it, i) => (i === idx ? { ...it, status: "done" } : it)));
        }, idx * 600 + 500),
      );
    });

    timersRef.current.push(
      setTimeout(() => {
        clearTimers();
        setOtaPhase("done");
        update({
          info: {
            ...info,
            hotelName: OTA_MOCK_DATA.hotelName ?? info.hotelName,
            email: OTA_MOCK_DATA.email ?? info.email,
            phone: OTA_MOCK_DATA.phone ?? info.phone,
            importedFromOTA: true,
          },
        });
      }, completionTime),
    );

    // Failsafe: si el proceso no terminó dentro del timeout, mostramos error con CTA reintentar.
    timersRef.current.push(
      setTimeout(() => {
        // Si ya terminó bien o el usuario reseteó, no hacemos nada.
        setOtaPhase((phase) => {
          if (phase !== "loading") return phase;
          clearTimers();
          setOtaError("No pudimos conectar con la OTA. Verificá la URL e intentá de nuevo.");
          return "error";
        });
      }, OTA_TIMEOUT_MS),
    );
  }

  function resetImport() {
    clearTimers();
    setOtaPhase("idle");
    setOtaError(null);
    setOtaItems(OTA_INITIAL_ITEMS);
  }

  const showDomainSuggestion = info.hotelName.trim() && !info.domain.trim();
  const suggested = info.hotelName.trim() ? `${slugify(info.hotelName)}.com` : "";

  return (
    <div className="flex flex-col" style={{ padding: "20px 24px", gap: 16 }}>
      <div>
        <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
          Información y contacto
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 4 }}>
          Pegá la URL de tu hotel en Booking para autocompletar, o cargá los datos manualmente.
        </p>
      </div>

      {/* Bloque OTA */}
      <div
        style={{
          background: "var(--wizard-blue-light)",
          border: "1px solid var(--wizard-blue-border)",
          borderRadius: 6,
          padding: 12,
        }}
      >
        {(otaPhase === "idle" || otaPhase === "error") && (
          <>
            <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--wizard-blue-text)", marginBottom: 6 }}>
              Importar desde Booking, Airbnb o Despegar
            </p>
            <div className="flex" style={{ gap: 6 }}>
              <input
                type="url"
                value={otaUrl}
                onChange={(e) => { setOtaUrl(e.target.value); if (otaPhase === "error") { setOtaError(null); setOtaPhase("idle"); } }}
                placeholder="https://www.booking.com/hotel/…"
                aria-label="URL de la OTA"
                aria-invalid={otaPhase === "error" || (otaUrl.length > 0 && !urlIsValid) || undefined}
                aria-describedby={otaError ? "ota-error" : undefined}
                className="flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  height: 28,
                  padding: "0 8px",
                  background: "#fff",
                  border: otaPhase === "error" ? "1px solid var(--destructive)" : "1px solid var(--wizard-blue-border)",
                  borderRadius: 5,
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-primary)",
                  outlineColor: "var(--accent-info)",
                }}
              />
              <button
                type="button"
                onClick={startImport}
                disabled={!urlIsValid}
                title={otaUrl.trim() && !urlIsValid ? "Solo URLs de Booking, Airbnb o Despegar" : undefined}
                className="flex items-center gap-1 transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  height: 28,
                  padding: "0 12px",
                  background: "var(--accent-info)",
                  border: "none",
                  borderRadius: 5,
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 500,
                  color: "#fff",
                  cursor: urlIsValid ? "pointer" : "not-allowed",
                  outlineColor: "var(--accent-info)",
                }}
              >
                <Download size={11} aria-hidden="true" />
                {otaPhase === "error" ? "Reintentar" : "Importar"}
              </button>
            </div>
            {otaUrl.trim() && !urlIsValid && otaPhase !== "error" && (
              <p style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 6 }}>
                Pegá una URL de Booking, Airbnb o Despegar.
              </p>
            )}
            {otaError && (
              <p
                id="ota-error"
                role="alert"
                className="flex items-center gap-1 mt-2"
                style={{ fontSize: "var(--font-size-xs)", color: "var(--destructive)" }}
              >
                <AlertCircle size={11} aria-hidden="true" /> {otaError}
              </p>
            )}
          </>
        )}

        {otaPhase === "loading" && (
          <div className="flex flex-col" style={{ gap: 6 }} role="status" aria-live="polite">
            <button
              type="button"
              onClick={resetImport}
              className="self-end transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2"
              style={{ background: "transparent", border: "none", fontSize: 10, color: "var(--text-secondary)", cursor: "pointer", padding: 0 }}
              aria-label="Cancelar importación"
            >
              Cancelar
            </button>
            {otaItems.map((item, idx) => {
              const done = item.status === "done";
              const loading = item.status === "loading";
              return (
                <div key={idx} className="flex items-center" style={{ gap: 8, fontSize: "var(--font-size-sm)" }}>
                  {loading ? (
                    <Loader2 size={11} className="animate-spin" style={{ color: "var(--accent-info)" }} aria-hidden="true" />
                  ) : done ? (
                    <Check size={11} style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
                  ) : (
                    <div
                      aria-hidden="true"
                      style={{ width: 11, height: 11, border: "1px solid var(--border-ui)", borderRadius: "50%" }}
                    />
                  )}
                  <span
                    style={{
                      color: done ? "var(--text-tertiary)" : loading ? "var(--accent-info)" : "var(--text-tertiary)",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {otaPhase === "done" && (
          <div className="flex items-center" style={{ gap: 8 }}>
            <div
              className="flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
              style={{
                width: 18,
                height: 18,
                background: "var(--wizard-success-done)",
                borderRadius: "50%",
              }}
            >
              <Check size={11} style={{ color: "#fff" }} />
            </div>
            <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--wizard-success-dark)" }}>
              Importado desde Booking.com
            </span>
            <span
              style={{
                marginLeft: "auto",
                background: "var(--wizard-success-light)",
                border: "1px solid var(--wizard-success-border)",
                borderRadius: 3,
                fontSize: 9,
                color: "var(--wizard-success-dark)",
                padding: "1px 6px",
                fontWeight: 500,
              }}
            >
              6 fotos
            </span>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field
            id="wiz-name"
            label="Nombre del hotel"
            required
            invalid={showNameError}
            value={info.hotelName}
            onChange={(v) => setField("hotelName", v)}
            placeholder="Ej: Hotel Plaza Mayor"
          />
          {showNameError && (
            <p
              role="alert"
              style={{ fontSize: 10, color: "var(--destructive)", marginTop: 4 }}
            >
              Necesitamos el nombre para continuar.
            </p>
          )}
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <Field
            id="wiz-domain"
            label="Dominio"
            value={info.domain}
            onChange={(v) => setField("domain", v)}
            placeholder="hotelplaza.com"
          />
          {showDomainSuggestion && (
            <div
              className="flex items-center"
              style={{ marginTop: 6, gap: 8, fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}
            >
              <span>
                ¿Querés usar <strong style={{ color: "var(--text-primary)" }}>{suggested}</strong>?
              </span>
              <button
                type="button"
                onClick={applyDomainSuggestion}
                className="transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: "transparent",
                  border: "1px solid var(--accent-info)",
                  borderRadius: 4,
                  padding: "2px 8px",
                  fontSize: 10,
                  fontWeight: 500,
                  color: "var(--accent-info)",
                  cursor: "pointer",
                  outlineColor: "var(--accent-info)",
                }}
              >
                Usar este
              </button>
            </div>
          )}
        </div>

        <Field
          id="wiz-phone"
          label="Teléfono"
          value={info.phone}
          onChange={(v) => setField("phone", v)}
          placeholder="+54 11 0000-0000"
          type="tel"
        />
        <Field
          id="wiz-email"
          label="Email"
          value={info.email}
          onChange={(v) => setField("email", v)}
          placeholder="contacto@hotel.com"
          type="email"
        />

        <Field
          id="wiz-instagram"
          label="Instagram"
          value={info.instagram}
          onChange={(v) => setField("instagram", v)}
          placeholder="@hotelplaza"
        />
        <Field
          id="wiz-facebook"
          label="Facebook"
          value={info.facebook}
          onChange={(v) => setField("facebook", v)}
          placeholder="facebook.com/hotelplaza"
        />
        <div style={{ gridColumn: "1 / -1" }}>
          <Field
            id="wiz-whatsapp"
            label="WhatsApp"
            value={info.whatsapp}
            onChange={(v) => setField("whatsapp", v)}
            placeholder="+54 9 11 0000-0000"
            type="tel"
          />
        </div>
      </div>
    </div>
  );
}
