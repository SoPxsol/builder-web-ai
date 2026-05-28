import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";

interface Field { label: string; value: string; editTarget: View; }

const fields: Field[] = [
  { label: "Nombre del sitio", value: "Hotel Tamarindo",         editTarget: "propiedades" },
  { label: "Dominio",          value: "tamarindo.com",           editTarget: "propiedades" },
  { label: "Plantilla activa", value: "Diplomatic",              editTarget: "templates"   },
  { label: "Idioma",           value: "Español",                 editTarget: "idioma"      },
  { label: "Zona horaria",     value: "America/Mexico_City",     editTarget: "propiedades" },
];

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

export function InfoSitioView({ siteName, navigate }: Props) {
  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 600, margin: "0 auto" }}>
        <ViewHeader
          backTo="paginas"
          eyebrow={siteName}
          title="Información del sitio"
          navigate={navigate}
        />
        <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)" }}>
          {fields.map((f, i) => (
            <div
              key={f.label}
              className="flex items-center justify-between px-4"
              style={{ height: 48, borderBottom: i < fields.length - 1 ? "0.5px solid var(--border-ui)" : "none" }}
            >
              <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}>{f.label}</span>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-primary)", fontWeight: 500 }}>{f.value}</span>
                <button
                  type="button"
                  onClick={() => navigate(f.editTarget)}
                  aria-label={`Editar ${f.label}`}
                  className="px-3 h-6 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                  style={{ background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", outlineColor: "var(--ring)", cursor: "pointer" }}
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
