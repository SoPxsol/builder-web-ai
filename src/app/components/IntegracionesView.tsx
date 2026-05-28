import { useState } from "react";
import { ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";
import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";
import { ConfirmDestructiveDialog } from "./ui/confirm-destructive-dialog";

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

interface Integration {
  id: string;
  name: string;
  desc: string;
  category: string;
  connected: boolean;
  available: boolean;
  // Integraciones críticas requieren confirmación para DESACTIVAR — desactivarlas
  // accidentalmente puede romper tracking de campañas con días de retraso en detectarlo.
  critical?: boolean;
  logo: string;
}

const initialIntegrations: Integration[] = [
  { id: "ga4",         name: "Google Analytics 4",    desc: "Medí el tráfico y comportamiento de tus visitantes.",         category: "Analítica",     connected: true,  available: true,  critical: true, logo: "G" },
  { id: "gtm",         name: "Google Tag Manager",    desc: "Gestión centralizada de etiquetas y scripts.",                category: "Analítica",     connected: false, available: true,  critical: true, logo: "T" },
  { id: "meta-pixel",  name: "Meta Pixel",            desc: "Seguimiento de conversiones para campañas en Facebook e Instagram.", category: "Publicidad",    connected: true,  available: true,  critical: true, logo: "M" },
  { id: "google-ads",  name: "Google Ads",            desc: "Conversiones y remarketing para campañas de búsqueda.",       category: "Publicidad",    connected: false, available: true,  critical: true, logo: "A" },
  { id: "whatsapp",    name: "WhatsApp Business",     desc: "Botón flotante de WhatsApp para consultas directas.",         category: "Comunicación",  connected: true,  available: true,  logo: "W" },
  { id: "mailchimp",   name: "Mailchimp",             desc: "Sincronizá contactos del formulario con tu lista de email.",  category: "Email marketing", connected: false, available: true,  logo: "C" },
  { id: "booking",     name: "Booking.com",           desc: "Mostrá disponibilidad en tiempo real desde Booking.",         category: "Reservas",      connected: false, available: false, logo: "B" },
  { id: "cloudbeds",   name: "Cloudbeds PMS",         desc: "Sincronizá disponibilidad con tu sistema de gestión hotelera.", category: "Reservas",    connected: false, available: false, logo: "C" },
];

const categoryColors: Record<string, { bg: string; color: string }> = {
  "Analítica":       { bg: "var(--badge-blue-bg)",    color: "var(--badge-blue-text)" },
  "Publicidad":      { bg: "var(--badge-orange-bg)",  color: "var(--badge-orange-text)" },
  "Comunicación":    { bg: "var(--badge-green-bg)",   color: "var(--badge-green-text)" },
  "Email marketing": { bg: "var(--badge-blue-bg)",    color: "var(--badge-blue-text)" },
  "Reservas":        { bg: "var(--badge-neutral-bg)", color: "var(--text-secondary)" },
};

const logoColors: string[] = ["#1a73e8", "#34a853", "#1877f2", "#4285f4", "#25d366", "#ffe01b", "#003580", "#1d9bf0"];

export function IntegracionesView({ siteName, navigate }: Props) {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [filterCat, setFilterCat] = useState<string>("Todas");
  const [pendingDisconnect, setPendingDisconnect] = useState<Integration | null>(null);

  const categories = ["Todas", ...Array.from(new Set(initialIntegrations.map((i) => i.category)))];
  const filtered = integrations.filter((i) => filterCat === "Todas" || i.category === filterCat);

  function applyToggle(id: string) {
    setIntegrations((prev) => prev.map((i) => i.id === id && i.available ? { ...i, connected: !i.connected } : i));
  }

  function handleToggle(integration: Integration) {
    if (!integration.available) return;
    // Conectar nunca requiere confirmación. Desconectar una crítica sí.
    if (integration.connected && integration.critical) {
      setPendingDisconnect(integration);
      return;
    }
    applyToggle(integration.id);
  }

  function confirmDisconnect() {
    if (!pendingDisconnect) return;
    applyToggle(pendingDisconnect.id);
    setPendingDisconnect(null);
  }

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 720, margin: "0 auto" }}>
        <ViewHeader
          backTo="paginas"
          eyebrow={siteName}
          title="Integraciones"
          description="Conectá analítica, publicidad y herramientas externas con tu sitio."
          navigate={navigate}
          action={
            <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}>
              {integrations.filter((i) => i.connected).length} activas
            </span>
          }
        />
        {/* Category filter */}
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className="px-3 h-7 transition-opacity hover:opacity-80"
              style={{
                borderRadius: "var(--radius-nav)",
                fontSize: "var(--font-size-md)",
                fontWeight: filterCat === cat ? 500 : 400,
                color: filterCat === cat ? "#fff" : "var(--text-secondary)",
                background: filterCat === cat ? "var(--text-primary)" : "var(--surface-card)",
                border: filterCat === cat ? "none" : "0.5px solid var(--border-ui)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Integration list */}
        <div className="flex flex-col gap-2">
          {filtered.map((integration, idx) => {
            const catStyle = categoryColors[integration.category] ?? categoryColors["Reservas"];
            const logoColor = logoColors[idx % logoColors.length];
            return (
              <div
                key={integration.id}
                className="flex items-center justify-between px-4"
                style={{
                  background: "var(--surface-card)",
                  borderRadius: "var(--radius-item)",
                  border: "0.5px solid var(--border-ui)",
                  height: 64,
                  opacity: integration.available ? 1 : 0.55,
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Logo */}
                  <div className="flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, borderRadius: "var(--radius-icon)", background: logoColor + "18", border: `0.5px solid ${logoColor}30` }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: logoColor, fontFamily: "var(--font-sans)" }}>{integration.logo}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.3 }}>{integration.name}</p>
                      <span className="px-2 h-[16px] flex items-center" style={{ background: catStyle.bg, borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-xs)", fontWeight: 500, color: catStyle.color }}>
                        {integration.category}
                      </span>
                      {!integration.available && (
                        <span className="px-2 h-[16px] flex items-center" style={{ background: "var(--badge-neutral-bg)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-xs)", fontWeight: 500, color: "var(--text-tertiary)" }}>
                          Próximamente
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>{integration.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {integration.connected && (
                    <button
                      type="button"
                      aria-label={`Abrir panel de ${integration.name}`}
                      className="flex items-center justify-center transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                      style={{ width: 24, height: 24, background: "var(--surface-page)", borderRadius: "var(--radius-dot)", border: "0.5px solid var(--border-ui)", outlineColor: "var(--ring)" }}
                    >
                      <ExternalLink size={11} style={{ color: "var(--text-secondary)" }} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggle(integration)}
                    disabled={!integration.available}
                    role="switch"
                    aria-checked={integration.connected}
                    aria-label={`${integration.connected ? "Desactivar" : "Activar"} ${integration.name}`}
                    className="transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ cursor: integration.available ? "pointer" : "default", background: "transparent", border: "none", outlineColor: "var(--ring)" }}
                  >
                    {integration.connected
                      ? <ToggleRight size={22} aria-hidden="true" style={{ color: "var(--status-active)" }} />
                      : <ToggleLeft  size={22} aria-hidden="true" style={{ color: "var(--text-tertiary)" }} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDestructiveDialog
        open={pendingDisconnect !== null}
        title={`Desactivar ${pendingDisconnect?.name ?? "integración"}`}
        description="Vas a detener el tracking. Tus campañas activas dejarán de medir conversiones hasta que la reactives."
        confirmLabel="Desactivar"
        cancelLabel="Mantener activa"
        onCancel={() => setPendingDisconnect(null)}
        onConfirm={confirmDisconnect}
      />
    </main>
  );
}
