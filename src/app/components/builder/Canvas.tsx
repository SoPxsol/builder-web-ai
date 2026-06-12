import { forwardRef, useEffect, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import type { BuilderModule, BuilderTab, ViewportMode } from "../../types/builder";
import { HOTEL_IMAGES } from "../wizard/preview/hotelImages";
import { BUILDER_COPY } from "./copy";
import { displayAlias, sectionSubtitle } from "./sectionMeta";

const MIME_MODULE = "application/x-module-id";
const MIME_COMPONENT = "application/x-component-id";

interface CanvasProps {
  canvasWidth: number;
  viewport: ViewportMode;
  activeTab: BuilderTab;
  pageName: string;
  modules: BuilderModule[];
  propertyValues: Record<string, string>;
  selectedId: string | null;
  onSelectModule: (id: string) => void;
  /** Mismo motor de reordenamiento que el panel: mover a posición final. */
  onReorderModule: (fromId: string, toIndex: number) => void;
  /** Drop de componente del palette → insertar en `atIndex`. */
  onAddFromPalette: (componentId: string, atIndex?: number) => void;
}

export function Canvas({
  canvasWidth,
  viewport,
  activeTab,
  pageName,
  modules,
  propertyValues,
  selectedId,
  onSelectModule,
  onReorderModule,
  onAddFromPalette,
}: CanvasProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* Scroll/resalte bidireccional: al cambiar la selección, traer la sección
     a la vista en el canvas. block "nearest" minimiza el salto si ya se ve. */
  useEffect(() => {
    if (!selectedId) return;
    rowRefs.current[selectedId]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  function resetDrag() {
    setDraggingId(null);
    setDropIndex(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const moduleId = e.dataTransfer.getData(MIME_MODULE);
    const componentId = e.dataTransfer.getData(MIME_COMPONENT);
    const idx = dropIndex ?? modules.length;
    if (moduleId) {
      const fromIndex = modules.findIndex((m) => m.id === moduleId);
      if (fromIndex >= 0) {
        const finalIndex = idx > fromIndex ? idx - 1 : idx;
        if (finalIndex !== fromIndex) onReorderModule(moduleId, finalIndex);
      }
    } else if (componentId) {
      onAddFromPalette(componentId, idx);
    }
    resetDrag();
  }

  function handleRowDragOver(e: React.DragEvent, index: number) {
    const types = Array.from(e.dataTransfer.types);
    if (!types.includes(MIME_MODULE) && !types.includes(MIME_COMPONENT)) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY - rect.top > rect.height / 2;
    setDropIndex(after ? index + 1 : index);
  }

  const isPageTab = activeTab === "page";

  return (
    <div
      className="flex-1 overflow-auto"
      style={{
        background: "var(--editor-canvas, #f0f0f0)",
        padding: 24,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
      onDragOver={(e) => {
        const types = Array.from(e.dataTransfer.types);
        if (types.includes(MIME_MODULE) || types.includes(MIME_COMPONENT)) e.preventDefault();
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) resetDrag();
      }}
      onDrop={handleDrop}
    >
      <div
        style={{
          width: Math.min(canvasWidth, 1268),
          maxWidth: "100%",
          background: "#fff",
          borderRadius: 8,
          border: "0.5px solid var(--border-ui)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          overflow: "hidden",
          minHeight: 600,
          fontFamily: "var(--font-sans)",
        }}
      >
        {(activeTab === "header" || isPageTab) && <SiteHeader highlighted={activeTab === "header"} />}

        {/* Cuerpo = secciones del árbol. Para header/footer el array está vacío
            por defecto → empty state. */}
        {modules.length === 0 ? (
          <PlaceholderBody
            label={
              activeTab === "footer"
                ? "Editando el footer global del sitio"
                : activeTab === "header"
                ? "Editando el header global del sitio"
                : "Agregá un módulo para empezar"
            }
          />
        ) : (
          <div className="flex flex-col">
            {modules.map((mod, index) => (
              <div key={mod.id}>
                <CanvasDropLine active={draggingId !== null && dropIndex === index} />
                <SectionBlock
                  ref={(el) => {
                    rowRefs.current[mod.id] = el;
                  }}
                  mod={mod}
                  viewport={viewport}
                  pageName={pageName}
                  alias={displayAlias(mod, propertyValues)}
                  subtitle={sectionSubtitle(mod)}
                  selected={selectedId === mod.id}
                  dragging={draggingId === mod.id}
                  onSelect={() => onSelectModule(mod.id)}
                  onDragStart={(e) => {
                    e.dataTransfer.setData(MIME_MODULE, mod.id);
                    e.dataTransfer.effectAllowed = "move";
                    setDraggingId(mod.id);
                  }}
                  onDragEnd={resetDrag}
                  onRowDragOver={(e) => handleRowDragOver(e, index)}
                />
              </div>
            ))}
            <CanvasDropLine active={draggingId !== null && dropIndex === modules.length} />
          </div>
        )}

        {(activeTab === "footer" || isPageTab) && <SiteFooter highlighted={activeTab === "footer"} />}
      </div>
    </div>
  );
}

/* ─── Línea indicadora de drop (canvas) ──────────────────────────────────── */
function CanvasDropLine({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div aria-hidden="true" style={{ height: 0, position: "relative", zIndex: 2 }}>
      <div
        style={{
          height: 3,
          background: "var(--accent-info)",
          margin: "0 12px",
          borderRadius: 2,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.6)",
        }}
      />
    </div>
  );
}

/* ─── Bloque de sección con handle + selección ───────────────────────────── */
interface SectionBlockProps {
  mod: BuilderModule;
  viewport: ViewportMode;
  pageName: string;
  alias: string;
  subtitle: string;
  selected: boolean;
  dragging: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onRowDragOver: (e: React.DragEvent) => void;
}

const SectionBlock = forwardRef<HTMLDivElement, SectionBlockProps>(function SectionBlock(
  { mod, viewport, pageName, alias, subtitle, selected, dragging, onSelect, onDragStart, onDragEnd, onRowDragOver },
  ref,
) {
  return (
    <div
      ref={ref}
      className="group relative"
      onDragOver={onRowDragOver}
      onClick={onSelect}
      style={{
        position: "relative",
        cursor: "pointer",
        opacity: dragging ? 0.4 : 1,
        outline: selected ? "2px solid var(--accent-info)" : "none",
        outlineOffset: -2,
      }}
    >
      {/* Handle de arrastre — aparece al hover o cuando la sección está seleccionada. */}
      <div
        className="absolute transition-opacity group-hover:opacity-100"
        style={{
          top: 8,
          left: 8,
          zIndex: 3,
          opacity: selected ? 1 : 0,
        }}
      >
        <button
          type="button"
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onClick={(e) => e.stopPropagation()}
          aria-label={`${BUILDER_COPY.tree.dragHandleLabel}: ${alias}`}
          className="flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
          style={{
            width: 24,
            height: 24,
            background: "rgba(255,255,255,0.92)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 6,
            cursor: "grab",
            color: "var(--text-secondary)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
            outlineColor: "var(--accent-info)",
          }}
        >
          <GripVertical size={14} aria-hidden="true" />
        </button>
      </div>

      {/* Etiqueta flotante de la sección al hover (recognition). */}
      <div
        className="absolute transition-opacity group-hover:opacity-100"
        aria-hidden="true"
        style={{
          top: 8,
          right: 8,
          zIndex: 3,
          opacity: selected ? 1 : 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "2px 8px",
          background: "rgba(255,255,255,0.92)",
          border: "0.5px solid var(--border-ui)",
          borderRadius: 6,
          fontSize: 10,
          color: "var(--text-secondary)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
          maxWidth: "60%",
        }}
      >
        <span style={{ fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {alias}
        </span>
        <span style={{ whiteSpace: "nowrap" }}>· {subtitle}</span>
      </div>

      {mod.hidden ? (
        <HiddenStrip alias={alias} subtitle={subtitle} />
      ) : (
        <SectionContent mod={mod} viewport={viewport} pageName={pageName} alias={alias} />
      )}
    </div>
  );
});

/* ─── Strip para secciones ocultas (mantiene el índice de orden alineado) ── */
function HiddenStrip({ alias, subtitle }: { alias: string; subtitle: string }) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 8,
        padding: "10px 16px",
        background: "var(--surface-page)",
        borderTop: "0.5px dashed var(--border-ui)",
        borderBottom: "0.5px dashed var(--border-ui)",
        color: "var(--text-tertiary)",
        fontSize: 11,
      }}
    >
      <EyeOffMini />
      <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{alias}</span>
      <span>· {subtitle}</span>
    </div>
  );
}

function EyeOffMini() {
  return (
    <span
      aria-hidden="true"
      style={{ width: 14, height: 14, display: "inline-flex", color: "var(--text-tertiary)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
      </svg>
    </span>
  );
}

/* ─── Render del contenido según el tipo de sección ──────────────────────── */
function SectionContent({
  mod,
  viewport,
  pageName,
  alias,
}: {
  mod: BuilderModule;
  viewport: ViewportMode;
  pageName: string;
  alias: string;
}) {
  const kind = sectionKind(mod);
  switch (kind) {
    case "hero":
      return <HeroBlock viewport={viewport} pageName={pageName} alias={alias} />;
    case "rooms":
      return <RoomsBlock viewport={viewport} title={alias} />;
    case "gallery":
      return <GalleryBlock title={alias} />;
    case "text":
      return <TextBlock title={alias} accent={mod.origin === "ai"} />;
    default:
      return <GenericBlock title={alias} subtitle={sectionSubtitle(mod)} />;
  }
}

type SectionKind = "hero" | "rooms" | "gallery" | "text" | "generic";

function sectionKind(mod: BuilderModule): SectionKind {
  switch (mod.icon) {
    case "layout":
      return "hero";
    case "layout-grid":
      return "rooms";
    case "images":
    case "image":
      return "gallery";
    case "columns":
    case "type":
    case "sparkles":
    case "quote":
      return "text";
    default:
      return "generic";
  }
}

/* ─── Bloques de contenido (mock representativo por tipo) ─────────────────── */
function HeroBlock({ viewport, pageName, alias }: { viewport: ViewportMode; pageName: string; alias: string }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{
        minHeight: viewport === "mobile" ? 220 : 320,
        backgroundImage: `url(${HOTEL_IMAGES.hero})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
      }}
    >
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, #1a1a2ed9, #e84a2c99)" }}
      />
      <div className="relative" style={{ padding: 32, textAlign: "center", zIndex: 1 }}>
        <p style={{ fontSize: 11, opacity: 0.85, letterSpacing: "0.1em", marginBottom: 8, textTransform: "uppercase" }}>
          {pageName === "Inicio" ? "Hotel boutique · Buenos Aires" : pageName}
        </p>
        <h1 style={{ fontSize: viewport === "mobile" ? 22 : 32, fontWeight: 700, textShadow: "0 1px 6px rgba(0,0,0,0.3)", marginBottom: 10 }}>
          Reservá directo, mejor precio
        </h1>
        <p style={{ fontSize: 13, opacity: 0.95, marginBottom: 18, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
          Desayuno gourmet y atención personalizada en el corazón de Palermo.
        </p>
        <button
          type="button"
          style={{
            height: 36,
            padding: "0 24px",
            background: "#fff",
            border: "none",
            borderRadius: 18,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--brand)",
            cursor: "default",
          }}
        >
          Ver disponibilidad
        </button>
      </div>
    </div>
  );
}

function RoomsBlock({ viewport, title }: { viewport: ViewportMode; title: string }) {
  return (
    <div style={{ padding: 32 }}>
      <SectionLabel>{title}</SectionLabel>
      <div className="grid" style={{ gridTemplateColumns: viewport === "mobile" ? "1fr" : "repeat(3, 1fr)", gap: 14 }}>
        {HOTEL_IMAGES.rooms.slice(0, 3).map((src, i) => (
          <div key={i} style={{ background: "var(--surface-page)", borderRadius: 6, overflow: "hidden" }}>
            <div
              aria-hidden="true"
              style={{ height: 120, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
            <div style={{ padding: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                {["Suite Premium", "Habitación Estándar", "Suite Familiar"][i]}
              </p>
              <p style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 2 }}>
                Desde {["$180", "$120", "$240"][i]}/noche
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryBlock({ title }: { title: string }) {
  return (
    <div style={{ padding: "0 32px 32px" }}>
      <SectionLabel>{title}</SectionLabel>
      <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
        {HOTEL_IMAGES.gallery.map((src, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{ aspectRatio: "1.2", backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: 4 }}
          />
        ))}
      </div>
    </div>
  );
}

function TextBlock({ title, accent }: { title: string; accent: boolean }) {
  return (
    <div style={{ padding: 32 }}>
      <SectionLabel>{title}</SectionLabel>
      <div
        className="grid"
        style={{ gridTemplateColumns: "1.4fr 1fr", gap: 20, alignItems: "center" }}
      >
        <div className="flex flex-col" style={{ gap: 8 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{title}</h3>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Un espacio pensado para que tu estadía sea memorable. Contanos qué buscás y lo hacemos posible.
          </p>
          <button
            type="button"
            style={{
              alignSelf: "flex-start",
              height: 32,
              padding: "0 18px",
              marginTop: 6,
              background: accent ? "var(--ai-gradient)" : "var(--brand)",
              border: "none",
              borderRadius: 16,
              fontSize: 12,
              fontWeight: 600,
              color: "#fff",
              cursor: "default",
            }}
          >
            Conocer más
          </button>
        </div>
        <div
          aria-hidden="true"
          style={{
            aspectRatio: "1.1",
            backgroundImage: `url(${HOTEL_IMAGES.rooms[1] ?? HOTEL_IMAGES.hero})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 8,
          }}
        />
      </div>
    </div>
  );
}

function GenericBlock({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        minHeight: 120,
        padding: 24,
        background: "var(--surface-page)",
        borderTop: "0.5px solid var(--border-ui)",
        borderBottom: "0.5px solid var(--border-ui)",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{title}</p>
      <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>{subtitle}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 10,
        color: "var(--text-tertiary)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 12,
      }}
    >
      {children}
    </p>
  );
}

/* ─── Chrome del sitio (header/footer simulados) ─────────────────────────── */
function SiteHeader({ highlighted }: { highlighted: boolean }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        height: 56,
        padding: "0 32px",
        background: "#fff",
        borderBottom: "0.5px solid var(--border-ui)",
        outline: highlighted ? "2px solid var(--accent-info)" : "none",
        outlineOffset: -2,
      }}
    >
      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--brand)" }}>HOTEL</span>
      <div className="flex items-center" style={{ gap: 24, fontSize: 11, color: "var(--text-secondary)" }}>
        <span>INICIO</span>
        <span>HABITACIONES</span>
        <span>EXPERIENCIAS</span>
        <span>CONTACTO</span>
      </div>
      <button
        type="button"
        style={{
          height: 28,
          padding: "0 14px",
          background: "var(--brand)",
          border: "none",
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          color: "#fff",
          cursor: "default",
        }}
      >
        Reservar
      </button>
    </div>
  );
}

function SiteFooter({ highlighted }: { highlighted: boolean }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: "20px 32px",
        background: "var(--text-primary)",
        color: "#fff",
        outline: highlighted ? "2px solid var(--accent-info)" : "none",
        outlineOffset: -2,
      }}
    >
      <div className="flex flex-col" style={{ gap: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--brand)" }}>HOTEL</span>
        <span style={{ fontSize: 10, opacity: 0.7 }}>© 2026 · Todos los derechos reservados</span>
      </div>
      <div className="flex items-center" style={{ gap: 16, fontSize: 10, opacity: 0.8 }}>
        <span>Términos</span>
        <span>Privacidad</span>
        <span>Contacto</span>
      </div>
    </div>
  );
}

function PlaceholderBody({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: 280, padding: 24, background: "var(--surface-page)" }}>
      <p style={{ fontSize: 12, color: "var(--text-tertiary)", textAlign: "center", maxWidth: 360, lineHeight: 1.5 }}>
        {label}. Los cambios se aplican a todas las páginas del sitio.
      </p>
    </div>
  );
}
