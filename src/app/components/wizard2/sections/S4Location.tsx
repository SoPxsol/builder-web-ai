import {
  Building2,
  MapPin,
  Palmtree,
  Plus,
  ShoppingBag,
  Trees,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Poi, W2State } from "../../../types/wizard2";
import { POI_OPTIONS } from "../../../types/wizard2";
import { SectionEyebrow } from "../shared/SectionEyebrow";

function makePoiId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `poi-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface Props {
  state: W2State;
  update: (patch: Partial<W2State>) => void;
}

const POI_ICONS: Record<string, LucideIcon> = {
  building: Building2,
  "shopping-bag": ShoppingBag,
  trees: Trees,
  palmtree: Palmtree,
};

export function S4Location({ state, update }: Props) {
  const { location } = state;

  function setAddress(value: string) {
    update({ location: { ...location, address: value } });
  }

  function addPoi() {
    const template = POI_OPTIONS[location.pois.length % POI_OPTIONS.length];
    const next: Poi = { ...template, id: makePoiId() };
    update({ location: { ...location, pois: [...location.pois, next] } });
  }

  function removePoi(index: number) {
    update({
      location: {
        ...location,
        pois: location.pois.filter((_, i) => i !== index),
      },
    });
  }

  function updatePoiField(index: number, field: keyof Poi, value: string) {
    const updated = location.pois.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    update({ location: { ...location, pois: updated } });
  }

  return (
    <div className="flex flex-col" style={{ padding: "20px 24px" }}>
      <SectionEyebrow group="launch" id="s4-eyebrow" />

      <div style={{ marginBottom: 14 }} aria-describedby="s4-eyebrow">
        <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
          Ubicación y puntos de interés
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 4 }}>
          3+ puntos de interés mejoran tu posicionamiento en búsquedas locales.
        </p>
      </div>

      {/* Dirección */}
      <div className="flex flex-col" style={{ gap: 4, marginBottom: 16 }}>
        <label htmlFor="s4-address" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
          Dirección del hotel
        </label>
        <div className="flex items-center" style={{ gap: 6 }}>
          <MapPin size={13} aria-hidden="true" style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
          <input
            id="s4-address"
            type="text"
            value={location.address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Av. Colón 123, Córdoba, Argentina"
            className="flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              height: 28,
              padding: "0 8px",
              background: "var(--surface-page)",
              border: "1px solid var(--border-ui)",
              borderRadius: 5,
              fontSize: "var(--font-size-sm)",
              color: "var(--text-primary)",
              outline: "none",
              outlineColor: "var(--accent-info)",
            }}
          />
        </div>
      </div>

      {/* POIs */}
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "var(--text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          borderBottom: "1px solid var(--border-ui)",
          paddingBottom: 4,
          marginBottom: 8,
        }}
      >
        Puntos de interés cercanos
      </p>

      <div className="flex flex-col" style={{ gap: 6 }}>
        {location.pois.map((poi, idx) => {
          const Icon = POI_ICONS[poi.icon] ?? MapPin;
          return (
            <div
              key={poi.id ?? `poi-${idx}`}
              className="flex items-center"
              style={{
                gap: 8,
                padding: 8,
                background: "var(--surface-page)",
                border: "1px solid var(--border-ui)",
                borderRadius: 5,
              }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
                style={{
                  width: 24,
                  height: 24,
                  background: "#fff",
                  border: "1px solid var(--border-ui)",
                  borderRadius: 4,
                  color: "var(--text-secondary)",
                }}
              >
                <Icon size={12} />
              </div>
              <input
                type="text"
                value={poi.label}
                onChange={(e) => updatePoiField(idx, "label", e.target.value)}
                aria-label={`Nombre del POI ${idx + 1}`}
                className="flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  height: 24,
                  padding: "0 8px",
                  background: "#fff",
                  border: "1px solid var(--border-ui)",
                  borderRadius: 4,
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-primary)",
                  outline: "none",
                  outlineColor: "var(--accent-info)",
                }}
              />
              <input
                type="text"
                value={poi.distance}
                onChange={(e) => updatePoiField(idx, "distance", e.target.value)}
                aria-label={`Distancia del POI ${idx + 1}`}
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  width: 72,
                  height: 24,
                  padding: "0 8px",
                  background: "#fff",
                  border: "1px solid var(--border-ui)",
                  borderRadius: 4,
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-primary)",
                  outline: "none",
                  outlineColor: "var(--accent-info)",
                }}
              />
              <button
                type="button"
                onClick={() => removePoi(idx)}
                aria-label="Eliminar POI"
                className="flex items-center justify-center transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  width: 22,
                  height: 22,
                  background: "transparent",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  flexShrink: 0,
                  outlineColor: "var(--accent-info)",
                }}
              >
                <X size={11} aria-hidden="true" style={{ color: "var(--text-tertiary)" }} />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addPoi}
        className="flex items-center self-start transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          marginTop: location.pois.length === 0 ? 0 : 8,
          height: 28,
          padding: "0 10px",
          background: "transparent",
          border: "1px dashed var(--accent-info)",
          borderRadius: 5,
          fontSize: "var(--font-size-sm)",
          fontWeight: 500,
          color: "var(--accent-info)",
          cursor: "pointer",
          gap: 4,
          outlineColor: "var(--accent-info)",
        }}
      >
        <Plus size={12} aria-hidden="true" />
        Agregar punto de interés
      </button>

      {location.pois.length < 3 && (
        <p
          style={{
            fontSize: 10,
            color: "var(--text-tertiary)",
            marginTop: 6,
            fontStyle: "italic",
          }}
        >
          Recomendado: aeropuerto, terminal y 1-2 atracciones (3+ POIs).
        </p>
      )}
    </div>
  );
}
