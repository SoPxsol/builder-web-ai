import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

export function PromocionesView({ siteName, navigate }: Props) {
  const upcoming = [
    { icon: "🏷️", title: "Códigos de descuento",   desc: "Creá y gestioná cupones para tus canales directos." },
    { icon: "📅", title: "Ofertas por temporada",   desc: "Armá paquetes y precios especiales por fechas." },
    { icon: "🔔", title: "Alertas de disponibilidad", desc: "Notificá a tus visitantes cuando queden pocas habitaciones." },
  ];

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 860, margin: "0 auto" }}>
        <ViewHeader
          backTo="paginas"
          eyebrow={siteName}
          title="Promociones"
          description="Próximamente — gestor de promociones integrado a tu sitio."
          navigate={navigate}
        />
        {/* Coming-soon hero */}
        <div
          className="flex flex-col items-center text-center py-10 px-6 mb-5"
          style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)" }}
        >
          <span
            className="inline-flex items-center px-3 h-6 mb-4"
            style={{ background: "var(--badge-orange-bg)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--badge-orange-text)" }}
          >
            Próximamente
          </span>
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
            Gestor de promociones
          </p>
          <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", maxWidth: 420 }}>
            Estamos construyendo un creador y gestor de promociones integrado a tu sitio. Podrás activar ofertas directamente desde acá sin tocar código.
          </p>
        </div>

        {/* Feature previews */}
        <p
          className="uppercase tracking-wider mb-3"
          style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.06em" }}
        >
          Lo que viene
        </p>
        <div className="flex flex-col gap-1">
          {upcoming.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-4 px-4"
              style={{ background: "var(--surface-card)", borderRadius: "var(--radius-item)", border: "0.5px solid var(--border-ui)", height: 56, opacity: 0.6 }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
              <div>
                <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.3 }}>{f.title}</p>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
