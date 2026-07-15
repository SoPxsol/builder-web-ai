import { forwardRef, useEffect, useRef, useState } from "react";
import {
  CalendarCheck,
  Copy,
  Globe,
  GripVertical,
  Heart,
  KeyRound,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  Trash2,
  User,
  type LucideIcon,
} from "lucide-react";
import type { BuilderModule, BuilderTab, NavConfig, ViewportMode } from "../../types/builder";
import { DEFAULT_NAV_CONFIG } from "../../types/builder";
import { HOTEL_IMAGES } from "../wizard/preview/hotelImages";
import { BUILDER_COPY } from "./copy";
import { displayAlias, sectionSubtitle } from "./sectionMeta";

/* ─── Resolver de íconos del nav (nombre lógico → componente lucide) ────────
 * Solo los íconos que aparecen en UtilityAction.icon del NavConfig.
 * No usamos dynamic import para mantener el bundle determinístico.
 * Mismo set curado que el selector visual de HeaderConfigPanel (IconPicker) —
 * si agregás un ícono acá, agregalo también ahí. */
const NAV_ICON_MAP: Record<string, LucideIcon> = {
  "calendar-check": CalendarCheck,
  "message-circle": MessageCircle,
  sparkles: Sparkles,
  "key-round": KeyRound,
  user: User,
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
  star: Star,
  menu: Menu,
  globe: Globe,
  tag: Tag,
  heart: Heart,
};

function NavIcon({ name, size = 14 }: { name?: string; size?: number }) {
  if (!name) return null;
  const Icon = NAV_ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} aria-hidden="true" />;
}

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
  /** Configuración del header. Solo se usa cuando activeTab === "header". */
  navConfig?: NavConfig;
  onSelectModule: (id: string) => void;
  /** Mismo motor de reordenamiento que el panel: mover a posición final. */
  onReorderModule: (fromId: string, toIndex: number) => void;
  /** Drop de componente del palette → insertar en `atIndex`. */
  onAddFromPalette: (componentId: string, atIndex?: number) => void;
  /** Acciones al hover sobre una sección. */
  onEditModule: (id: string) => void;
  onDuplicateModule: (id: string) => void;
  onRequestDeleteModule: (id: string) => void;
}

export function Canvas({
  canvasWidth,
  viewport,
  activeTab,
  pageName,
  modules,
  propertyValues,
  selectedId,
  navConfig,
  onSelectModule,
  onReorderModule,
  onAddFromPalette,
  onEditModule,
  onDuplicateModule,
  onRequestDeleteModule,
}: CanvasProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* Drawer del header preview: estado levantado acá (antes vivía dentro de
     NavHeaderPreview) para que el scrim + panel puedan cubrir todo el marco
     del canvas y no solo el wrapper del header. Ver Fix WEB-686 #2. */
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Scroll/resalte bidireccional: al cambiar la selección, traer la sección
     a la vista en el canvas. block "nearest" minimiza el salto si ya se ve. */
  useEffect(() => {
    if (!selectedId) return;
    rowRefs.current[selectedId]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  /* Si el viewport deja de ser mobile, cerramos el drawer (evita que quede
     "abierto" en memoria y reaparezca al volver a mobile más tarde). */
  useEffect(() => {
    if (viewport !== "mobile") setDrawerOpen(false);
  }, [viewport]);

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

  /* El header configurado (navConfig) persiste en los tabs Header y Página:
     misma NavHeaderPreview en ambos, la única diferencia es si se dibuja el
     outline de edición (solo en Header, ver `editing` más abajo). */
  const showHeaderPreview = activeTab === "header" || isPageTab;
  const cfg = navConfig ?? DEFAULT_NAV_CONFIG;
  const isMobileViewport = viewport === "mobile";
  const bottomBarActive =
    showHeaderPreview &&
    isMobileViewport &&
    cfg.bottomBar.visible &&
    (cfg.mobileLayout === "both" || cfg.mobileLayout === "bottom");
  /* Sticky solo aplica en desktop/tablet. Cuando está activo, el marco pasa
     a tener alto acotado + scroll interno (ver estilos del frame) para que
     position:sticky del header tenga un scrollport real donde pinnear. */
  const stickyPreviewActive = showHeaderPreview && cfg.mainBar.sticky && !isMobileViewport;

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
          /* position:relative → containing block de la bottom bar y el drawer
             del header, que ahora se posicionan a nivel del MARCO completo
             (no del wrapper corto del header). Ver NavBottomBarPreview /
             NavDrawerPreview más abajo. */
          position: "relative",
          overflowX: "hidden",
          /* overflow-y:auto solo cuando el sticky preview está activo: le da
             al marco un scrollport real donde position:sticky del header
             puede pinnear. Fuera de ese caso se mantiene "hidden" como antes
             (recorte de esquinas redondeadas, sin scroll interno). */
          overflowY: stickyPreviewActive ? "auto" : "hidden",
          maxHeight: stickyPreviewActive ? 640 : undefined,
          minHeight: 600,
          paddingBottom: bottomBarActive ? 56 : 0,
          fontFamily: "var(--font-sans)",
        }}
      >
        {/* El header persiste en Header y Página con la misma navConfig; el
            outline de edición solo se dibuja en el tab Header (ver `editing`). */}
        {showHeaderPreview && (
          <NavHeaderPreview
            navConfig={cfg}
            viewport={viewport}
            editing={activeTab === "header"}
            drawerOpen={drawerOpen}
            onToggleDrawer={() => setDrawerOpen((prev) => !prev)}
          />
        )}

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
                  onEdit={() => onEditModule(mod.id)}
                  onDuplicate={() => onDuplicateModule(mod.id)}
                  onDelete={() => onRequestDeleteModule(mod.id)}
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

        {/* Bottom bar y drawer del header, fijados al MARCO completo (no al
            header) — ver Fix WEB-686 #2. */}
        {bottomBarActive && <NavBottomBarPreview cfg={cfg} />}
        {showHeaderPreview && (
          <NavDrawerPreview
            cfg={cfg}
            open={drawerOpen && isMobileViewport}
            onClose={() => setDrawerOpen(false)}
          />
        )}
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
          background: "var(--drop-indicator)",
          margin: "0 12px",
          borderRadius: 2,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.6)",
        }}
      />
    </div>
  );
}

/* ─── Botón de acción del toolbar de hover (canvas) ──────────────────────── */
function CanvasActionButton({
  label,
  onClick,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex items-center justify-center transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{
        width: 24,
        height: 24,
        background: "transparent",
        border: "none",
        borderRadius: 5,
        cursor: "pointer",
        color: destructive ? "var(--destructive)" : "var(--text-secondary)",
        outlineColor: "var(--accent-info)",
      }}
    >
      {children}
    </button>
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
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onRowDragOver: (e: React.DragEvent) => void;
}

const SectionBlock = forwardRef<HTMLDivElement, SectionBlockProps>(function SectionBlock(
  { mod, viewport, pageName, alias, subtitle, selected, dragging, onSelect, onEdit, onDuplicate, onDelete, onDragStart, onDragEnd, onRowDragOver },
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
        outline: selected ? "2px solid var(--canvas-selection)" : "none",
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

      {/* Toolbar de acciones al hover (Editar / Duplicar / Eliminar).
          Mover ↑↓ se reemplazó por el handle de arrastre. */}
      <div
        className="absolute transition-opacity group-hover:opacity-100"
        style={{
          top: 8,
          right: 8,
          zIndex: 3,
          opacity: selected ? 1 : 0,
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: 2,
          background: "rgba(255,255,255,0.94)",
          border: "0.5px solid var(--border-ui)",
          borderRadius: 7,
          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--text-secondary)",
            padding: "0 6px",
            maxWidth: 140,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {alias}
        </span>
        <CanvasActionButton label={`${BUILDER_COPY.tree.actions.edit}: ${alias}`} onClick={onEdit}>
          <SlidersHorizontal size={13} aria-hidden="true" />
        </CanvasActionButton>
        <CanvasActionButton label={`${BUILDER_COPY.tree.actions.duplicate}: ${alias}`} onClick={onDuplicate}>
          <Copy size={13} aria-hidden="true" />
        </CanvasActionButton>
        <CanvasActionButton label={`${BUILDER_COPY.tree.actions.delete}: ${alias}`} onClick={onDelete} destructive>
          <Trash2 size={13} aria-hidden="true" />
        </CanvasActionButton>
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

/* ─── Preview real del header (driven by NavConfig + viewport) ───────────── */

/** Secciones del drawer/nav visibles, ordenadas — compartido entre la nav
 * desktop (MainBar) y el drawer mobile (NavDrawerPreview). */
function getVisibleNavSections(cfg: NavConfig) {
  return [...cfg.drawerSections].filter((s) => s.visible).sort((a, b) => a.order - b.order);
}

/**
 * NavHeaderPreview — representación visual fiel del header según la
 * configuración activa. Es mock visual (no interactivo): los botones tienen
 * cursor: default, igual que HeroBlock.
 *
 * Comportamiento por viewport:
 *   - desktop / tablet: muestra barra utilitaria (si visible) + barra principal.
 *     En two-rows: util arriba, main abajo. En single-row: todo en una fila.
 *   - mobile: según mobileLayout:
 *       "top"    → solo barra superior.
 *       "both"   → barra superior + bottom bar.
 *       "bottom" → solo bottom bar (sin barra superior).
 *
 * La bottom bar y el drawer del mobile viven fuera de este componente (ver
 * NavBottomBarPreview / NavDrawerPreview en Canvas) para poder posicionarse
 * relativos al MARCO completo del canvas, no a este wrapper corto.
 *
 * Sticky (mainBar.sticky, solo desktop/tablet): el wrapper que retorna este
 * componente es el elemento que se vuelve position:sticky. Su containing
 * block es el MARCO (Canvas), que es quien habilita el scrollport real
 * (overflow-y:auto + maxHeight) cuando stickyActive. El chip "STICKY" se
 * mantiene como indicador visual además del comportamiento real.
 */
function NavHeaderPreview({
  navConfig: cfg,
  viewport,
  editing,
  drawerOpen,
  onToggleDrawer,
}: {
  navConfig: NavConfig;
  viewport: ViewportMode;
  /** Dibuja el outline de selección — solo true en el tab Header (contexto de edición). */
  editing: boolean;
  drawerOpen: boolean;
  onToggleDrawer: () => void;
}) {
  const isMobile = viewport === "mobile";
  const showTopBar = !isMobile || cfg.mobileLayout === "top" || cfg.mobileLayout === "both";
  /* Sticky solo aplica en desktop/tablet — ver nota del marco en Canvas. */
  const stickyActive = cfg.mainBar.sticky && !isMobile;

  /* Secciones visibles del nav, ordenadas por campo order (asc). */
  const visibleSections = getVisibleNavSections(cfg);

  /* Idiomas y monedas habilitados para el selector mock del drawer. */
  const enabledLanguages = cfg.languages.filter((l) => l.enabled);
  const enabledCurrencies = cfg.currencies.filter((c) => c.enabled);

  /* Logo: imagen si hay url, texto como fallback. */
  function LogoEl() {
    if (cfg.logo.type === "image" && cfg.logo.imageUrl) {
      return (
        <img
          src={cfg.logo.imageUrl}
          alt={cfg.logo.imageAlt ?? "Logo"}
          style={{ maxHeight: 32, maxWidth: 120, objectFit: "contain" }}
        />
      );
    }
    return (
      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--brand)", letterSpacing: "-0.02em" }}>
        {cfg.logo.textFallback || "HOTEL"}
      </span>
    );
  }

  /* Acción utilitaria: ícono + label en fila. */
  function UtilityChip({ label, icon }: { label: string; icon?: string }) {
    return (
      <span
        className="flex items-center"
        style={{ gap: 4, fontSize: 10, color: "var(--text-secondary)", cursor: "default" }}
      >
        <NavIcon name={icon} size={12} />
        {label}
      </span>
    );
  }

  /* Barra utilitaria (franja superior fina). */
  function UtilityBar() {
    if (!cfg.utilityBar.visible) return null;
    return (
      <div
        className="flex items-center justify-between"
        style={{
          height: 30,
          padding: "0 20px",
          background: "var(--surface-page)",
          borderBottom: "0.5px solid var(--border-ui)",
        }}
      >
        <div style={{ minWidth: 0 }}>
          {cfg.utilityBar.leftSlot && (
            <UtilityChip
              label={cfg.utilityBar.leftSlot.label}
              icon={cfg.utilityBar.leftSlot.icon}
            />
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          {cfg.utilityBar.rightSlot && (
            <UtilityChip
              label={cfg.utilityBar.rightSlot.label}
              icon={cfg.utilityBar.rightSlot.icon}
            />
          )}
        </div>
      </div>
    );
  }

  /* Barra principal (logo + nav + botón). */
  function MainBar() {
    return (
      <div
        className="flex items-center justify-between"
        style={{
          height: isMobile ? 48 : 52,
          padding: isMobile ? "0 14px" : "0 24px",
          background: "#fff",
          borderBottom: "0.5px solid var(--border-ui)",
          gap: 12,
        }}
      >
        {/* Logo */}
        <div style={{ flexShrink: 0 }}>
          <LogoEl />
        </div>

        {/* Nav items (solo desktop/tablet — mobile usa drawer) */}
        {!isMobile && (
          <div
            className="flex items-center"
            style={{ gap: 18, flex: 1, justifyContent: "center", overflow: "hidden" }}
          >
            {visibleSections.slice(0, 5).map((s) => (
              <span
                key={s.id}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  cursor: "default",
                  whiteSpace: "nowrap",
                }}
              >
                {s.label || "—"}
              </span>
            ))}
            {visibleSections.length > 5 && (
              <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                +{visibleSections.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Lado derecho: sticky chip (desktop) + botón reserva */}
        <div className="flex items-center" style={{ gap: 8, flexShrink: 0 }}>
          {!isMobile && cfg.mainBar.sticky && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: "var(--accent-info)",
                background: "var(--accent-info-bg)",
                padding: "2px 6px",
                borderRadius: 4,
                letterSpacing: "0.04em",
              }}
            >
              STICKY
            </span>
          )}
          {cfg.mainBar.showBookingButton && (
            <button
              type="button"
              style={{
                height: isMobile ? 30 : 28,
                padding: "0 12px",
                background: "var(--brand)",
                border: "none",
                borderRadius: 4,
                fontSize: isMobile ? 11 : 11,
                fontWeight: 600,
                color: "#fff",
                cursor: "default",
                whiteSpace: "nowrap",
              }}
            >
              {cfg.mainBar.bookingButtonLabel || "Reservar"}
            </button>
          )}
          {/* Hamburguesa en mobile — togglea el drawer preview */}
          {isMobile && (
            <button
              type="button"
              aria-label={BUILDER_COPY.headerConfig.drawerPreview.openMenuAriaLabel}
              aria-expanded={drawerOpen}
              onClick={onToggleDrawer}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 4,
                borderRadius: 4,
                /* Asegura target táctil de ≥44px */
                minWidth: 44,
                minHeight: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{ width: 18, height: 2, background: "var(--text-secondary)", borderRadius: 1 }}
                />
              ))}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* El wrapper que retorna este componente ES el elemento sticky (cuando
     stickyActive): su containing block es el MARCO (Canvas), que habilita
     el scrollport real para que position:sticky pinnee de verdad. El
     outline de selección solo se dibuja en contexto de edición (`editing`). */
  return (
    <div
      style={{
        outline: editing ? "2px solid var(--canvas-selection)" : "none",
        outlineOffset: -2,
        ...(stickyActive ? { position: "sticky" as const, top: 0, zIndex: 3 } : null),
      }}
    >
      {/* Layout two-rows en desktop/tablet: util arriba, main abajo.
          Single-row: colapsamos la util dentro de la main bar (se muestra igual
          porque el campo utilityBar.visible controla UtilityBar() por separado). */}
      {showTopBar && (
        <>
          {/* Utility bar siempre va encima de la main bar.
              Desktop two-rows: franja superior explícita.
              Desktop single-row: nota de preview (se integra inline en producción).
              Mobile: siempre encima de la main bar si está visible. */}
          {cfg.desktopLayout === "two-rows" && !isMobile && <UtilityBar />}
          {cfg.desktopLayout === "single-row" && !isMobile && cfg.utilityBar.visible && (
            <div
              className="flex items-center justify-between"
              style={{
                height: 24,
                padding: "0 20px",
                background: "var(--surface-page)",
                borderBottom: "0.5px solid var(--border-ui)",
                fontSize: 9,
                color: "var(--text-tertiary)",
              }}
            >
              <span style={{ fontStyle: "italic" }}>{BUILDER_COPY.headerConfig.preview.utilityBarInlineNote}</span>
            </div>
          )}
          {isMobile && <UtilityBar />}
          <MainBar />
        </>
      )}
    </div>
  );
}

/* ─── Bottom bar del preview del header — fijada al pie del MARCO completo
   del canvas (no del header), para que en mobile quede pegada al fondo de
   la pantalla simulada y no debajo del nav. Ver Canvas → bottomBarActive. */
function NavBottomBarPreview({ cfg }: { cfg: NavConfig }) {
  const sortedSlots = [...cfg.bottomBar.slots].sort((a, b) => a.order - b.order);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        height: 56,
        /* Blur real requeriría backdrop-filter sobre contenido subyacente.
           En el preview usamos un fondo semi-translúcido que lo evoca
           sin depender del contexto de stacking del canvas. */
        background: cfg.bottomBar.backdropBlur ? "rgba(255,255,255,0.88)" : "#fff",
        borderTop: "0.5px solid var(--border-ui)",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
        padding: "0 8px",
        zIndex: 4,
      }}
    >
      {sortedSlots.map((slot) => (
        <div
          key={slot.id}
          className="flex flex-col items-center"
          style={{ gap: 3, cursor: "default", flex: 1, minWidth: 0 }}
        >
          <span style={{ color: "var(--text-secondary)" }}>
            <NavIcon name={slot.action.icon} size={18} />
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 500,
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
              textAlign: "center",
            }}
          >
            {slot.action.label || "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Drawer del preview del header — panel lateral que cubre TODO el
   MARCO del canvas (no solo el wrapper del header) cuando el hotelero
   activa el hamburguer en mobile. Estado (drawerOpen) vive en Canvas para
   poder posicionar scrim + panel a nivel marco. z-index 5/6, por encima de
   la bottom bar (z 4). Solo mobile, cerrado por defecto. */
function NavDrawerPreview({
  cfg,
  open,
  onClose,
}: {
  cfg: NavConfig;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  const visibleSections = getVisibleNavSections(cfg);
  const enabledLanguages = cfg.languages.filter((l) => l.enabled);
  const enabledCurrencies = cfg.currencies.filter((c) => c.enabled);

  /* Divisor horizontal liviano, mismo tono que los bordes del header. */
  function Divider() {
    return (
      <div
        style={{
          height: "0.5px",
          background: "var(--border-ui)",
          margin: "8px 0",
        }}
      />
    );
  }

  return (
    <>
      {/* Scrim semi-translúcido — cubre el marco salvo el panel */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 5,
        }}
      />

      {/* Panel lateral — 80% del ancho del marco, desde la derecha, top a bottom */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={BUILDER_COPY.headerConfig.drawerPreview.openMenuAriaLabel}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: "80%",
          background: "#fff",
          zIndex: 6,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          overflowY: "auto",
        }}
      >
        {/* Cabecera del drawer con botón cerrar */}
        <div
          className="flex items-center justify-end"
          style={{
            height: 48,
            padding: "0 14px",
            borderBottom: "0.5px solid var(--border-ui)",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            aria-label={BUILDER_COPY.headerConfig.drawerPreview.closeMenuAriaLabel}
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              background: "none",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            {/* X compuesta por dos líneas rotadas, mismo grosor que el hamburger */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Cuerpo del drawer */}
        <div style={{ padding: "12px 16px", flex: 1 }}>
          {/* Secciones de navegación */}
          {visibleSections.length > 0 && (
            <nav aria-label={BUILDER_COPY.headerConfig.preview.drawerNavAriaLabel}>
              {visibleSections.map((section) => (
                <div
                  key={section.id}
                  style={{
                    padding: "10px 0",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    cursor: "default",
                    borderBottom: "0.5px solid var(--border-ui)",
                  }}
                >
                  {section.label || "—"}
                </div>
              ))}
            </nav>
          )}

          <Divider />

          {/* Acciones de utilidad del drawer */}
          {cfg.drawerUtility.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {cfg.drawerUtility.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center"
                  style={{
                    gap: 10,
                    padding: "8px 0",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    cursor: "default",
                  }}
                >
                  <span style={{ flexShrink: 0 }}>
                    <NavIcon name={action.icon} size={14} />
                  </span>
                  <span>{action.label || "—"}</span>
                </div>
              ))}
            </div>
          )}

          {/* Idiomas y monedas — solo cuando hay opciones habilitadas */}
          {(enabledLanguages.length > 0 || enabledCurrencies.length > 0) && (
            <>
              <Divider />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Selector de idiomas */}
                {enabledLanguages.length > 0 && (
                  <div>
                    <p
                      style={{
                        fontSize: 9,
                        color: "var(--text-tertiary)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      {BUILDER_COPY.headerConfig.drawerPreview.languagesTitle}
                    </p>
                    <div className="flex items-center" style={{ gap: 6, flexWrap: "wrap" }}>
                      {enabledLanguages.map((lang, idx) => (
                        <span
                          key={lang.code}
                          style={{
                            fontSize: 10,
                            fontWeight: idx === 0 ? 600 : 400,
                            color: idx === 0 ? "#fff" : "var(--text-secondary)",
                            background: idx === 0 ? "var(--brand)" : "var(--surface-page)",
                            border: `0.5px solid ${idx === 0 ? "transparent" : "var(--border-ui)"}`,
                            borderRadius: 4,
                            padding: "3px 8px",
                            cursor: "default",
                          }}
                        >
                          {lang.code.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selector de monedas */}
                {enabledCurrencies.length > 0 && (
                  <div>
                    <p
                      style={{
                        fontSize: 9,
                        color: "var(--text-tertiary)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      {BUILDER_COPY.headerConfig.drawerPreview.currenciesTitle}
                    </p>
                    <div className="flex items-center" style={{ gap: 6, flexWrap: "wrap" }}>
                      {enabledCurrencies.map((cur, idx) => (
                        <span
                          key={cur.code}
                          style={{
                            fontSize: 10,
                            fontWeight: idx === 0 ? 600 : 400,
                            color: idx === 0 ? "#fff" : "var(--text-secondary)",
                            background: idx === 0 ? "var(--brand)" : "var(--surface-page)",
                            border: `0.5px solid ${idx === 0 ? "transparent" : "var(--border-ui)"}`,
                            borderRadius: 4,
                            padding: "3px 8px",
                            cursor: "default",
                          }}
                        >
                          {cur.code}
                          {cur.symbol && cur.symbol !== cur.code ? ` ${cur.symbol}` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Chrome del sitio (footer simulado) ─────────────────────────────────── */
function SiteFooter({ highlighted }: { highlighted: boolean }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: "20px 32px",
        background: "var(--text-primary)",
        color: "#fff",
        outline: highlighted ? "2px solid var(--canvas-selection)" : "none",
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
