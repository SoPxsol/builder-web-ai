const fields = [
  { label: "Nombre del hotel", value: "Hotel Tamarindo" },
  { label: "Tipo de alojamiento", value: "Hotel boutique" },
  { label: "Dirección", value: "Av. Costera 120, Tamarindo" },
  { label: "Teléfono", value: "+52 984 000 0000" },
  { label: "Email de reservas", value: "reservas@tamarindo.com" },
  { label: "Moneda", value: "MXN — Peso mexicano" },
];

import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

export function DatosBasicosView({ siteName, navigate }: Props) {
  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 600, margin: "0 auto" }}>
        <ViewHeader
          backTo="paginas"
          eyebrow={siteName}
          title="Datos del hotel"
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
                  onClick={() => navigate("propiedades")}
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
