import { PageCard } from "@figma/my-make-file";
import { UtensilsCrossed, Sparkles, MapPin } from "lucide-react";

const noop = () => {};

// Página recomendada y activada (estado verde).
export const Activa = () => (
  <div style={{ width: 380, padding: 16, background: "#fff" }}>
    <PageCard
      icon={UtensilsCrossed}
      label="Restaurante"
      sublabel="Mostrá la carta y el horario del restaurante del hotel."
      badgeVariant="recommended"
      timing="Semana 1"
      checked={true}
      onChange={noop}
    />
  </div>
);

// Página opcional, todavía sin activar.
export const Inactiva = () => (
  <div style={{ width: 380, padding: 16, background: "#fff" }}>
    <PageCard
      icon={Sparkles}
      label="Spa y bienestar"
      sublabel="Tratamientos, masajes y circuito de relajación."
      badgeVariant="optional"
      timing="Mes 1-3"
      checked={false}
      onChange={noop}
    />
  </div>
);

// Lista de varias páginas como aparece en el wizard.
export const Lista = () => (
  <div style={{ width: 380, padding: 16, background: "#fff" }}>
    <PageCard
      icon={MapPin}
      label="Cómo llegar"
      sublabel="Ubicación, mapa y puntos de interés cercanos."
      badgeVariant="recommended"
      timing="Semana 1"
      checked={true}
      onChange={noop}
    />
    <PageCard
      icon={UtensilsCrossed}
      label="Restaurante"
      sublabel="Carta, horarios y reservas de mesa."
      badgeVariant="optional"
      timing="Mes 1-3"
      checked={false}
      onChange={noop}
    />
    <PageCard
      icon={Sparkles}
      label="Eventos y bodas"
      sublabel="Salones, capacidad y servicios para eventos."
      badgeVariant="optional"
      timing="Mes 1-3"
      checked={false}
      onChange={noop}
    />
  </div>
);
