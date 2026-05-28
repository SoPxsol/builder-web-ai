import { useState } from "react";
import { Check, Languages, ArrowRight } from "lucide-react";
import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

const languages = [
  { code: "es",    label: "Español",    region: "Argentina / Latinoamérica" },
  { code: "es-ES", label: "Español",    region: "España" },
  { code: "en",    label: "English",    region: "United States" },
  { code: "en-GB", label: "English",    region: "United Kingdom" },
  { code: "pt",    label: "Português",  region: "Brasil" },
  { code: "fr",    label: "Français",   region: "France" },
  { code: "de",    label: "Deutsch",    region: "Deutschland" },
  { code: "it",    label: "Italiano",   region: "Italia" },
];

const dateFormats = [
  { id: "dmy",  label: "DD/MM/AAAA",  example: "26/05/2026" },
  { id: "mdy",  label: "MM/DD/AAAA",  example: "05/26/2026" },
  { id: "ymd",  label: "AAAA-MM-DD",  example: "2026-05-26" },
];

export function IdiomaView({ siteName, navigate }: Props) {
  const [selectedLang, setSelectedLang] = useState("es");
  const [selectedDate, setSelectedDate] = useState("dmy");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 600, margin: "0 auto" }}>
        <ViewHeader
          backTo="paginas"
          eyebrow={siteName}
          title="Idiomas"
          description="Idioma principal del sitio y variantes multilenguaje."
          navigate={navigate}
          action={
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 h-8 transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ background: saved ? "var(--status-active)" : "var(--brand)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: 500, color: "#fff", border: "none", cursor: "pointer", outlineColor: "var(--brand)" }}
            >
              {saved && <Check size={12} aria-hidden="true" />}
              {saved ? "Guardado" : "Guardar cambios"}
            </button>
          }
        />
        {/* Language selector */}
        <div className="mb-5" style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", overflow: "hidden" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-ui)" }}>
            <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>Idioma del sitio</p>
            <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 2 }}>
              Define el idioma principal que verán tus visitantes.
            </p>
          </div>
          {languages.map((lang, i) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className="flex items-center justify-between w-full px-4 transition-colors hover:opacity-80"
              style={{
                height: 44,
                background: selectedLang === lang.code ? "var(--shell-item-active-bg)" : "transparent",
                borderTop: i > 0 ? "0.5px solid var(--border-ui)" : "none",
                textAlign: "left",
              }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "var(--font-size-lg)", color: "var(--text-primary)", fontWeight: selectedLang === lang.code ? 500 : 400 }}>{lang.label}</span>
                <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-tertiary)" }}>{lang.region}</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)", fontFamily: "monospace" }}>{lang.code}</span>
                {selectedLang === lang.code && <Check size={13} style={{ color: "var(--status-active)" }} />}
              </div>
            </button>
          ))}
        </div>

        {/* Date format */}
        <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", overflow: "hidden" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-ui)" }}>
            <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>Formato de fecha</p>
            <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 2 }}>
              Cómo se muestran las fechas en tu sitio (reservas, eventos, etc.).
            </p>
          </div>
          {dateFormats.map((fmt, i) => (
            <button
              key={fmt.id}
              onClick={() => setSelectedDate(fmt.id)}
              className="flex items-center justify-between w-full px-4 transition-colors hover:opacity-80"
              style={{ height: 44, background: selectedDate === fmt.id ? "var(--shell-item-active-bg)" : "transparent", borderTop: i > 0 ? "0.5px solid var(--border-ui)" : "none", textAlign: "left" }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-primary)", fontWeight: selectedDate === fmt.id ? 500 : 400 }}>{fmt.label}</span>
                <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-tertiary)" }}>{fmt.example}</span>
              </div>
              {selectedDate === fmt.id && <Check size={13} style={{ color: "var(--status-active)" }} />}
            </button>
          ))}
        </div>

        {/* Cross-link a Multilenguaje (antes vivía como item separado del nav). */}
        <button
          type="button"
          onClick={() => navigate("multilenguaje")}
          className="flex items-center justify-between w-full mt-5 px-4 transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            height: 64,
            background: "var(--surface-card)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: "var(--radius-card)",
            textAlign: "left",
            cursor: "pointer",
            outlineColor: "var(--accent-info)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 36, height: 36, background: "var(--accent-info-bg)", borderRadius: "var(--radius-icon)" }}
            >
              <Languages size={16} style={{ color: "var(--accent-info)" }} />
            </div>
            <div>
              <p style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
                Multilenguaje
              </p>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", lineHeight: 1.3, marginTop: 2 }}>
                Activá variantes en otros idiomas y multiplicá tu alcance.
              </p>
            </div>
          </div>
          <ArrowRight size={14} aria-hidden="true" style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
        </button>
      </div>
    </main>
  );
}
