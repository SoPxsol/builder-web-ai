import { useLayoutEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  GripVertical,
  Image as ImageIcon,
  Link2,
  Plus,
  Trash2,
  Video,
  X,
} from "lucide-react";
import {
  BLOCK_BG_PRESETS,
  BLOCK_DEF_BY_TYPE,
  createBlock,
  MIME_BLOCK_ID,
  MIME_BLOCK_TYPE,
  newBlockId,
  readableInk,
  type ArticleBlock,
  type BlockType,
} from "../../types/articleBlocks";
import { AlignLeft, AlignCenter } from "lucide-react";

const DEMO_IMG =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=70&w=1200";

interface Props {
  blocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
  /**
   * Permite reordenar arrastrando y soltar desde la paleta. En mobile se apaga
   * (brief §4): el ajuste fino con el dedo se difiere a desktop. Reordenar sigue
   * disponible con los botones subir/bajar de la toolbar de cada bloque.
   */
  dragEnabled?: boolean;
}

/**
 * BlockCanvas — lienzo central del editor de artículo.
 *
 * Renderiza la lista de bloques con edición inline (cada tipo trae su propio
 * mini-editor) y permite:
 *   - soltar un componente de la paleta entre dos bloques (inserta),
 *   - reordenar arrastrando por el grip,
 *   - subir/bajar/duplicar/eliminar desde la toolbar de cada bloque.
 *
 * La data viaja siempre hacia arriba vía onChange(blocks); este componente no
 * guarda los bloques en estado propio (single source of truth en el artículo).
 */
export function BlockCanvas({ blocks, onChange, dragEnabled = true }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  /* ─── Mutaciones ─────────────────────────────────────────────────────── */
  function update(id: string, patch: Partial<ArticleBlock>) {
    onChange(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as ArticleBlock) : b)));
  }
  function insertAt(block: ArticleBlock, index: number) {
    const next = [...blocks];
    next.splice(index, 0, block);
    onChange(next);
    setSelectedId(block.id);
  }
  function move(id: string, toIndex: number) {
    const from = blocks.findIndex((b) => b.id === id);
    if (from < 0) return;
    const next = [...blocks];
    const [item] = next.splice(from, 1);
    const ins = from < toIndex ? toIndex - 1 : toIndex;
    next.splice(ins, 0, item);
    onChange(next);
  }
  function moveBy(id: string, dir: -1 | 1) {
    const i = blocks.findIndex((b) => b.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  function duplicate(id: string) {
    const i = blocks.findIndex((b) => b.id === id);
    if (i < 0) return;
    const copy = { ...blocks[i], id: newBlockId() } as ArticleBlock;
    const next = [...blocks];
    next.splice(i + 1, 0, copy);
    onChange(next);
    setSelectedId(copy.id);
  }
  function remove(id: string) {
    onChange(blocks.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  /* ─── Drop handling ──────────────────────────────────────────────────── */
  function dragHasPayload(e: React.DragEvent) {
    const t = Array.from(e.dataTransfer.types);
    return t.includes(MIME_BLOCK_TYPE) || t.includes(MIME_BLOCK_ID);
  }
  function handleDrop(e: React.DragEvent, index: number) {
    e.preventDefault();
    const newType = e.dataTransfer.getData(MIME_BLOCK_TYPE) as BlockType | "";
    const moveId = e.dataTransfer.getData(MIME_BLOCK_ID);
    setDropIndex(null);
    setDraggingId(null);
    if (newType) insertAt(createBlock(newType), index);
    else if (moveId) move(moveId, index);
  }

  /* Numeración automática de los headings con numbered=true. */
  const headingNumbers = computeHeadingNumbers(blocks);

  return (
    <div className="flex flex-col">
      {blocks.length === 0 && dropIndex === null ? (
        <EmptyState dragEnabled={dragEnabled} />
      ) : null}

      {blocks.map((block, i) => (
        <div key={block.id}>
          <DropZone
            enabled={dragEnabled}
            active={dropIndex === i}
            onOver={(e) => {
              if (dragHasPayload(e)) {
                e.preventDefault();
                setDropIndex(i);
              }
            }}
            onLeave={() => setDropIndex((c) => (c === i ? null : c))}
            onDrop={(e) => handleDrop(e, i)}
          />
          <BlockShell
            block={block}
            index={i}
            count={blocks.length}
            selected={selectedId === block.id}
            dimmed={draggingId === block.id}
            dragEnabled={dragEnabled}
            number={headingNumbers[block.id]}
            onSelect={() => setSelectedId(block.id)}
            onDragStart={(e) => {
              e.dataTransfer.setData(MIME_BLOCK_ID, block.id);
              e.dataTransfer.effectAllowed = "move";
              setDraggingId(block.id);
            }}
            onDragEnd={() => {
              setDraggingId(null);
              setDropIndex(null);
            }}
            onUpdate={(patch) => update(block.id, patch)}
            onMoveUp={() => moveBy(block.id, -1)}
            onMoveDown={() => moveBy(block.id, 1)}
            onDuplicate={() => duplicate(block.id)}
            onRemove={() => remove(block.id)}
          />
        </div>
      ))}

      {/* Drop zone final (append) */}
      <DropZone
        enabled={dragEnabled}
        active={dropIndex === blocks.length}
        tall={blocks.length === 0}
        onOver={(e) => {
          if (dragHasPayload(e)) {
            e.preventDefault();
            setDropIndex(blocks.length);
          }
        }}
        onLeave={() => setDropIndex((c) => (c === blocks.length ? null : c))}
        onDrop={(e) => handleDrop(e, blocks.length)}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Numeración de headings
 * ════════════════════════════════════════════════════════════════════════ */

function computeHeadingNumbers(blocks: ArticleBlock[]): Record<string, number> {
  const out: Record<string, number> = {};
  let n = 0;
  for (const b of blocks) {
    if (b.type === "heading" && b.numbered) {
      n += 1;
      out[b.id] = n;
    }
  }
  return out;
}

/* ════════════════════════════════════════════════════════════════════════
 * Drop zone entre bloques
 * ════════════════════════════════════════════════════════════════════════ */

function DropZone({
  enabled = true,
  active,
  tall,
  onOver,
  onLeave,
  onDrop,
}: {
  enabled?: boolean;
  active: boolean;
  tall?: boolean;
  onOver: (e: React.DragEvent) => void;
  onLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  // Sin DnD (mobile) la zona es solo un espaciador inerte entre bloques.
  if (!enabled) {
    return <div aria-hidden="true" style={{ height: tall ? 8 : 6 }} />;
  }
  return (
    <div
      onDragOver={onOver}
      onDragLeave={onLeave}
      onDrop={onDrop}
      aria-hidden="true"
      style={{
        height: active ? 28 : tall ? 56 : 10,
        display: "flex",
        alignItems: "center",
        transition: "height 0.12s ease",
      }}
    >
      <div
        style={{
          height: active ? 3 : tall ? 2 : 0,
          width: "100%",
          borderRadius: 2,
          background: active ? "var(--accent-info)" : tall ? "var(--border-ui)" : "transparent",
          border: tall && !active ? "1px dashed var(--border-ui)" : "none",
          opacity: tall && !active ? 0.7 : 1,
        }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Estado vacío
 * ════════════════════════════════════════════════════════════════════════ */

function EmptyState({ dragEnabled = true }: { dragEnabled?: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        padding: "48px 24px",
        border: "1px dashed var(--border-ui)",
        borderRadius: 10,
        gap: 6,
        textAlign: "center",
      }}
    >
      <Plus size={20} style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", margin: 0 }}>
        Empezá a armar tu artículo
      </p>
      <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: 0, maxWidth: 280, lineHeight: 1.5 }}>
        {dragEnabled
          ? "Arrastrá un componente desde la izquierda o hacé clic en él para sumarlo acá."
          : "Tocá “Componentes” abajo y elegí qué sumar al artículo."}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell de bloque — toolbar + editor según tipo
 * ════════════════════════════════════════════════════════════════════════ */

function BlockShell({
  block,
  index,
  count,
  selected,
  dimmed,
  dragEnabled = true,
  number,
  onSelect,
  onDragStart,
  onDragEnd,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
}: {
  block: ArticleBlock;
  index: number;
  count: number;
  selected: boolean;
  dimmed: boolean;
  dragEnabled?: boolean;
  number?: number;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onUpdate: (patch: Partial<ArticleBlock>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const [hover, setHover] = useState(false);
  const def = BLOCK_DEF_BY_TYPE[block.type];
  // Sin hover en touch: con DnD apagado mostramos siempre el chrome para que la
  // toolbar (subir/bajar/duplicar/eliminar) sea alcanzable con el dedo.
  const showChrome = hover || selected || !dragEnabled;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onSelect}
      style={{
        position: "relative",
        padding: "10px 12px",
        borderRadius: 8,
        border: selected ? "1px solid var(--accent-info)" : "1px solid transparent",
        background: selected ? "var(--accent-info-bg)" : showChrome ? "var(--surface-page)" : "transparent",
        opacity: dimmed ? 0.4 : 1,
        transition: "background 0.12s ease, border-color 0.12s ease",
      }}
    >
      {/* Etiqueta de tipo + toolbar */}
      <div
        className="flex items-center justify-between"
        style={{
          height: dragEnabled ? 18 : 32,
          marginBottom: showChrome ? 6 : 0,
          opacity: showChrome ? 1 : 0,
          transition: "opacity 0.12s ease",
          pointerEvents: showChrome ? "auto" : "none",
        }}
      >
        {dragEnabled ? (
          <span
            className="flex items-center"
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            title="Arrastrá para reordenar"
            style={{ gap: 4, cursor: "grab" }}
          >
            <GripVertical size={12} style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--text-tertiary)",
              }}
            >
              {def.name}
            </span>
          </span>
        ) : (
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--text-tertiary)",
            }}
          >
            {def.name}
          </span>
        )}
        <div className="flex items-center" style={{ gap: dragEnabled ? 1 : 4 }}>
          <ToolbarBtn icon={ArrowUp} label="Subir" big={!dragEnabled} disabled={index === 0} onClick={onMoveUp} />
          <ToolbarBtn icon={ArrowDown} label="Bajar" big={!dragEnabled} disabled={index === count - 1} onClick={onMoveDown} />
          <ToolbarBtn icon={Copy} label="Duplicar" big={!dragEnabled} onClick={onDuplicate} />
          <ToolbarBtn icon={Trash2} label="Eliminar" big={!dragEnabled} danger onClick={onRemove} />
        </div>
      </div>

      {/* Editor del bloque */}
      <BlockEditor block={block} number={number} onUpdate={onUpdate} />
    </div>
  );
}

function ToolbarBtn({
  icon: Icon,
  label,
  onClick,
  disabled,
  danger,
  big,
}: {
  icon: typeof ArrowUp;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  /** Variante de mayor tamaño (touch target cómodo en mobile). */
  big?: boolean;
}) {
  const size = big ? 32 : 22;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex items-center justify-center transition-colors hover:bg-[#fff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{
        width: size,
        height: size,
        background: big ? "var(--surface-card)" : "transparent",
        border: big ? "0.5px solid var(--border-ui)" : "none",
        borderRadius: big ? 6 : 4,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.3 : 1,
        outlineColor: "var(--accent-info)",
      }}
    >
      <Icon size={big ? 15 : 12} style={{ color: danger ? "var(--destructive)" : "var(--text-secondary)" }} aria-hidden="true" />
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Editores por tipo de bloque
 * ════════════════════════════════════════════════════════════════════════ */

function BlockEditor({
  block,
  number,
  onUpdate,
}: {
  block: ArticleBlock;
  number?: number;
  onUpdate: (patch: Partial<ArticleBlock>) => void;
}) {
  switch (block.type) {
    case "heading":
      return (
        <div className="flex flex-col" style={{ gap: 6 }}>
          <div className="flex items-center" style={{ gap: 6, flexWrap: "wrap" }}>
            <Segmented
              options={[
                { value: 2, label: "H2" },
                { value: 3, label: "H3" },
              ]}
              value={block.level}
              onChange={(v) => onUpdate({ level: v as 2 | 3 })}
            />
            <AlignControl value={block.align ?? "left"} onChange={(align) => onUpdate({ align })} />
            <Toggle
              label="Numerar"
              on={block.numbered}
              onClick={() => onUpdate({ numbered: !block.numbered })}
            />
          </div>
          <div
            className="flex items-baseline"
            style={{ gap: 8, justifyContent: (block.align ?? "left") === "center" ? "center" : "flex-start" }}
          >
            {block.numbered && number != null && (
              <span
                style={{
                  fontSize: block.level === 2 ? 22 : 18,
                  fontWeight: 700,
                  color: "var(--text-tertiary)",
                  flexShrink: 0,
                }}
              >
                {number}.
              </span>
            )}
            <input
              type="text"
              value={block.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              placeholder="Título de la sección"
              aria-label="Texto del encabezado"
              style={{
                flex: (block.align ?? "left") === "center" ? "0 1 auto" : 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: block.level === 2 ? 22 : 18,
                fontWeight: 700,
                lineHeight: 1.25,
                color: "var(--text-primary)",
                fontFamily: "inherit",
                minWidth: 0,
                textAlign: block.align ?? "left",
              }}
            />
          </div>
        </div>
      );

    case "paragraph": {
      const variant = block.variant ?? "normal";
      const align = block.align ?? "left";
      const size = variant === "lead" ? 17 : variant === "small" ? 13 : 15;
      return (
        <div className="flex flex-col" style={{ gap: 8 }}>
          <div className="flex items-center" style={{ gap: 6, flexWrap: "wrap" }}>
            <Segmented
              options={[
                { value: "normal", label: "Normal" },
                { value: "lead", label: "Destacado" },
                { value: "small", label: "Pequeño" },
              ]}
              value={variant}
              onChange={(v) => onUpdate({ variant: v as "normal" | "lead" | "small" })}
            />
            <AlignControl value={align} onChange={(a) => onUpdate({ align: a })} />
          </div>
          <AutoTextarea
            value={block.text}
            onChange={(text) => onUpdate({ text })}
            placeholder="Escribí el párrafo…"
            style={{
              fontSize: size,
              lineHeight: 1.7,
              color: variant === "small" ? "var(--text-secondary)" : "var(--text-primary)",
              fontStyle: variant === "lead" ? "italic" : "normal",
              textAlign: align,
            }}
          />
        </div>
      );
    }

    case "list":
      return (
        <div className="flex flex-col" style={{ gap: 8 }}>
          <Segmented
            options={[
              { value: "bullet", label: "• Viñetas" },
              { value: "number", label: "1. Numerada" },
            ]}
            value={block.ordered ? "number" : "bullet"}
            onChange={(v) => onUpdate({ ordered: v === "number" })}
          />
          <div className="flex flex-col" style={{ gap: 4 }}>
            {block.items.map((item, idx) => (
              <div key={idx} className="flex items-center" style={{ gap: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text-tertiary)", width: 16, flexShrink: 0 }}>
                  {block.ordered ? `${idx + 1}.` : "•"}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const items = [...block.items];
                    items[idx] = e.target.value;
                    onUpdate({ items });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const items = [...block.items];
                      items.splice(idx + 1, 0, "");
                      onUpdate({ items });
                    }
                  }}
                  placeholder={`Ítem ${idx + 1}`}
                  className="flex-1"
                  style={inlineField}
                />
                <RemoveRowBtn
                  onClick={() => onUpdate({ items: block.items.filter((_, k) => k !== idx) })}
                  disabled={block.items.length <= 1}
                />
              </div>
            ))}
          </div>
          <AddRowBtn label="Agregar ítem" onClick={() => onUpdate({ items: [...block.items, ""] })} />
        </div>
      );

    case "quote":
      return (
        <div
          className="flex flex-col"
          style={{ gap: 6, borderLeft: "3px solid var(--border-ui)", paddingLeft: 12 }}
        >
          <AutoTextarea
            value={block.text}
            onChange={(text) => onUpdate({ text })}
            placeholder="Frase a destacar…"
            style={{ fontSize: 16, fontStyle: "italic", lineHeight: 1.5, color: "var(--text-primary)" }}
          />
          <input
            type="text"
            value={block.author}
            onChange={(e) => onUpdate({ author: e.target.value })}
            placeholder="— Autor (opcional)"
            style={{ ...inlineField, fontSize: 12, color: "var(--text-secondary)" }}
          />
        </div>
      );

    case "image":
      return (
        <div className="flex flex-col" style={{ gap: 8 }}>
          {block.url ? (
            <img
              src={block.url}
              alt={block.alt}
              style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 8, border: "0.5px solid var(--border-ui)" }}
            />
          ) : (
            <div
              className="flex flex-col items-center justify-center"
              style={{ height: 120, background: "var(--surface-card)", border: "1px dashed var(--border-ui)", borderRadius: 8, gap: 6 }}
            >
              <ImageIcon size={18} style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
              <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Sin imagen</span>
            </div>
          )}
          <FieldWithIcon icon={Link2}>
            <input
              type="text"
              value={block.url}
              onChange={(e) => onUpdate({ url: e.target.value })}
              placeholder="URL de la imagen"
              className="flex-1"
              style={{ ...inlineField, fontSize: 11 }}
            />
            <button type="button" onClick={(e) => { e.stopPropagation(); onUpdate({ url: DEMO_IMG }); }} style={linkBtn}>
              Usar demo
            </button>
          </FieldWithIcon>
          <input
            type="text"
            value={block.caption}
            onChange={(e) => onUpdate({ caption: e.target.value })}
            placeholder="Epígrafe (texto debajo de la imagen)"
            style={{ ...boxField, fontSize: 12 }}
          />
          <input
            type="text"
            value={block.alt}
            onChange={(e) => onUpdate({ alt: e.target.value })}
            placeholder="Texto alternativo (accesibilidad / SEO)"
            style={{ ...boxField, fontSize: 11, color: "var(--text-secondary)" }}
          />
        </div>
      );

    case "gallery":
      return (
        <div className="flex flex-col" style={{ gap: 8 }}>
          {block.images.map((img, idx) => (
            <div key={img.id} className="flex items-center" style={{ gap: 8 }}>
              <span
                aria-hidden="true"
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 40, height: 32, borderRadius: 6, flexShrink: 0,
                  background: img.url ? `url(${img.url}) center/cover` : "var(--surface-card)",
                  border: "0.5px solid var(--border-ui)",
                }}
              >
                {!img.url && <ImageIcon size={12} style={{ color: "var(--text-tertiary)" }} />}
              </span>
              <div className="flex flex-col flex-1 min-w-0" style={{ gap: 3 }}>
                <input
                  type="text"
                  value={img.url}
                  onChange={(e) => updateGalleryRow(block, onUpdate, idx, { url: e.target.value })}
                  placeholder="URL de la imagen"
                  style={{ ...boxField, fontSize: 11 }}
                />
                <input
                  type="text"
                  value={img.caption}
                  onChange={(e) => updateGalleryRow(block, onUpdate, idx, { caption: e.target.value })}
                  placeholder="Epígrafe (opcional)"
                  style={{ ...boxField, fontSize: 10, color: "var(--text-secondary)" }}
                />
              </div>
              <RemoveRowBtn
                onClick={() => onUpdate({ images: block.images.filter((_, k) => k !== idx) })}
                disabled={block.images.length <= 1}
              />
            </div>
          ))}
          <AddRowBtn
            label="Agregar imagen"
            onClick={() => onUpdate({ images: [...block.images, { id: newBlockId(), url: "", caption: "" }] })}
          />
        </div>
      );

    case "video":
      return (
        <div className="flex flex-col" style={{ gap: 8 }}>
          <div
            className="flex flex-col items-center justify-center"
            style={{
              height: 140,
              borderRadius: 8,
              gap: 6,
              background: block.url ? "var(--text-primary)" : "var(--surface-card)",
              border: block.url ? "none" : "1px dashed var(--border-ui)",
              color: block.url ? "#fff" : "var(--text-tertiary)",
            }}
          >
            <Video size={22} aria-hidden="true" />
            <span style={{ fontSize: 10 }}>{block.url ? "Video embebido" : "Sin video"}</span>
          </div>
          <FieldWithIcon icon={Link2}>
            <input
              type="text"
              value={block.url}
              onChange={(e) => onUpdate({ url: e.target.value })}
              placeholder="URL de YouTube o Vimeo"
              className="flex-1"
              style={{ ...inlineField, fontSize: 11 }}
            />
          </FieldWithIcon>
          <input
            type="text"
            value={block.caption}
            onChange={(e) => onUpdate({ caption: e.target.value })}
            placeholder="Epígrafe (opcional)"
            style={{ ...boxField, fontSize: 12 }}
          />
        </div>
      );

    case "callout": {
      const bg = block.bg ?? "#1c1a17";
      const ink = readableInk(bg);
      const soft = ink === "#ffffff" ? "rgba(255,255,255,0.85)" : "rgba(28,26,23,0.72)";
      return (
        <div className="flex flex-col" style={{ gap: 8 }}>
          <BgSwatches value={block.bg} onChange={(bg) => onUpdate({ bg })} />
          <div className="flex flex-col" style={{ gap: 8, background: bg, borderRadius: 8, padding: 14 }}>
            <input
              type="text"
              value={block.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="Rótulo (ej. Consejo del concierge)"
              style={{
                background: "transparent", border: "none", outline: "none",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                color: "#9a8a5f", fontFamily: "inherit",
              }}
            />
            <input
              type="text"
              value={block.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Título del consejo (opcional)"
              style={{
                background: "transparent", border: "none", outline: "none",
                fontSize: 14, fontWeight: 700, color: ink, fontFamily: "inherit",
              }}
            />
            <AutoTextarea
              value={block.text}
              onChange={(text) => onUpdate({ text })}
              placeholder="Texto del consejo…"
              style={{ fontSize: 13, lineHeight: 1.6, color: soft }}
            />
          </div>
        </div>
      );
    }

    case "databox":
      return (
        <div
          className="flex flex-col"
          style={{ gap: 8, background: "var(--surface-card)", border: "0.5px solid var(--border-ui)", borderRadius: 8, padding: 12 }}
        >
          <input
            type="text"
            value={block.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Título de la caja"
            style={{ ...inlineField, fontSize: 13, fontWeight: 700 }}
          />
          {block.rows.map((row, idx) => (
            <div key={row.id} className="flex items-center" style={{ gap: 6 }}>
              <input
                type="text"
                value={row.label}
                onChange={(e) => updateDataRow(block, onUpdate, idx, { label: e.target.value })}
                placeholder="Dato"
                style={{ ...boxField, fontSize: 11, fontWeight: 600, width: 120, flexShrink: 0 }}
              />
              <input
                type="text"
                value={row.value}
                onChange={(e) => updateDataRow(block, onUpdate, idx, { value: e.target.value })}
                placeholder="Valor"
                className="flex-1"
                style={{ ...boxField, fontSize: 11 }}
              />
              <RemoveRowBtn
                onClick={() => onUpdate({ rows: block.rows.filter((_, k) => k !== idx) })}
                disabled={block.rows.length <= 1}
              />
            </div>
          ))}
          <AddRowBtn
            label="Agregar fila"
            onClick={() => onUpdate({ rows: [...block.rows, { id: newBlockId(), label: "", value: "" }] })}
          />
        </div>
      );

    case "faq":
      return (
        <div className="flex flex-col" style={{ gap: 10 }}>
          <input
            type="text"
            value={block.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Título (ej. Preguntas frecuentes)"
            style={{ ...inlineField, fontSize: 15, fontWeight: 700 }}
          />
          {block.items.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-col"
              style={{ gap: 4, background: "var(--surface-card)", border: "0.5px solid var(--border-ui)", borderRadius: 8, padding: "8px 10px" }}
            >
              <div className="flex items-center" style={{ gap: 8 }}>
                <input
                  type="text"
                  value={item.q}
                  onChange={(e) => updateFaqRow(block, onUpdate, idx, { q: e.target.value })}
                  placeholder={`Pregunta ${idx + 1}`}
                  className="flex-1"
                  style={{ ...inlineField, fontSize: 13, fontWeight: 600 }}
                />
                <RemoveRowBtn
                  onClick={() => onUpdate({ items: block.items.filter((_, k) => k !== idx) })}
                  disabled={block.items.length <= 1}
                />
              </div>
              <AutoTextarea
                value={item.a}
                onChange={(a) => updateFaqRow(block, onUpdate, idx, { a })}
                placeholder="Respuesta…"
                style={{ fontSize: 12, lineHeight: 1.55, color: "var(--text-secondary)" }}
              />
            </div>
          ))}
          <AddRowBtn
            label="Agregar pregunta"
            onClick={() => onUpdate({ items: [...block.items, { id: newBlockId(), q: "", a: "" }] })}
          />
        </div>
      );

    case "cta": {
      const bg = block.bg ?? "#ffffff";
      const ink = readableInk(bg);
      const soft = ink === "#ffffff" ? "rgba(255,255,255,0.8)" : "var(--text-secondary)";
      // El botón usa dorado del sitio; su texto se acomoda por contraste.
      const btnBg = "#9a8a5f";
      const btnInk = readableInk(btnBg);
      return (
        <div className="flex flex-col" style={{ gap: 8 }}>
          <BgSwatches value={block.bg} onChange={(bg) => onUpdate({ bg })} />
          <div
            className="flex flex-col items-center"
            style={{ gap: 8, background: bg, border: "0.5px solid var(--border-ui)", borderRadius: 10, padding: 16, textAlign: "center" }}
          >
            <input
              type="text"
              value={block.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Título del CTA"
              style={{ ...inlineField, fontSize: 16, fontWeight: 700, textAlign: "center", color: ink }}
            />
            <AutoTextarea
              value={block.text}
              onChange={(text) => onUpdate({ text })}
              placeholder="Texto de apoyo…"
              style={{ fontSize: 12, lineHeight: 1.5, color: soft, textAlign: "center" }}
            />
            <span className="flex items-center" style={{ background: btnBg, borderRadius: 6, padding: "0 12px", height: 34 }}>
              <input
                type="text"
                value={block.button}
                onChange={(e) => onUpdate({ button: e.target.value })}
                placeholder="Texto del botón"
                style={{
                  background: "transparent", border: "none", outline: "none",
                  fontSize: 12, fontWeight: 600, color: btnInk, textAlign: "center", fontFamily: "inherit",
                  width: Math.max(90, (block.button.length + 2) * 7),
                }}
              />
            </span>
          </div>
        </div>
      );
    }

    case "button":
      return (
        <div className="flex flex-col" style={{ gap: 8 }}>
          <div
            className="flex"
            style={{ justifyContent: block.align === "center" ? "center" : block.align === "right" ? "flex-end" : "flex-start" }}
          >
            <span className="flex items-center" style={{ background: "var(--brand)", borderRadius: 6, padding: "0 14px", height: 36 }}>
              <input
                type="text"
                value={block.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                placeholder="Texto del botón"
                style={{
                  background: "transparent", border: "none", outline: "none",
                  fontSize: 13, fontWeight: 600, color: "#fff", textAlign: "center", fontFamily: "inherit",
                  width: Math.max(90, (block.label.length + 2) * 8),
                }}
              />
            </span>
          </div>
          <div className="flex items-center" style={{ gap: 8 }}>
            <Segmented
              options={[
                { value: "left", label: "Izq." },
                { value: "center", label: "Centro" },
                { value: "right", label: "Der." },
              ]}
              value={block.align}
              onChange={(v) => onUpdate({ align: v as "left" | "center" | "right" })}
            />
            <FieldWithIcon icon={Link2}>
              <input
                type="text"
                value={block.href}
                onChange={(e) => onUpdate({ href: e.target.value })}
                placeholder="Enlace (URL o /reservar)"
                className="flex-1"
                style={{ ...inlineField, fontSize: 11 }}
              />
            </FieldWithIcon>
          </div>
        </div>
      );

    case "divider":
      return (
        <div className="flex items-center justify-center" style={{ padding: "8px 0" }}>
          <span style={{ height: 1, width: "100%", background: "var(--border-ui)" }} />
        </div>
      );

    case "tags":
      return (
        <div className="flex flex-col" style={{ gap: 8 }}>
          {block.tags.length > 0 && (
            <div className="flex items-center" style={{ gap: 6, flexWrap: "wrap" }}>
              {block.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="flex items-center"
                  style={{
                    gap: 4, padding: "3px 4px 3px 10px", borderRadius: 13,
                    border: "0.5px solid var(--border-ui)", background: "var(--surface-card)",
                    fontSize: 11, color: "var(--text-secondary)",
                  }}
                >
                  {t}
                  <button
                    type="button"
                    aria-label={`Quitar ${t}`}
                    onClick={(e) => { e.stopPropagation(); onUpdate({ tags: block.tags.filter((_, k) => k !== idx) }); }}
                    className="flex items-center justify-center"
                    style={{ width: 16, height: 16, background: "transparent", border: "none", borderRadius: 8, cursor: "pointer" }}
                  >
                    <X size={10} style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <input
            type="text"
            placeholder="Escribí una etiqueta y Enter…"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const val = e.currentTarget.value.trim();
                if (val) {
                  onUpdate({ tags: [...block.tags, val] });
                  e.currentTarget.value = "";
                }
              }
            }}
            style={{ ...boxField, fontSize: 12 }}
          />
        </div>
      );

    case "share":
      return (
        <div className="flex items-center" style={{ gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
            Compartir
          </span>
          {["f", "t", "in", "🔗"].map((s, i) => (
            <span
              key={i}
              className="flex items-center justify-center"
              style={{ width: 28, height: 28, borderRadius: 14, border: "0.5px solid var(--border-ui)", fontSize: 11, color: "var(--text-secondary)" }}
            >
              {s}
            </span>
          ))}
          <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontStyle: "italic" }}>
            (se configura solo al publicar)
          </span>
        </div>
      );
  }
}

/* ─── Helpers de filas anidadas ────────────────────────────────────────── */

function updateGalleryRow(
  block: Extract<ArticleBlock, { type: "gallery" }>,
  onUpdate: (patch: Partial<ArticleBlock>) => void,
  idx: number,
  patch: Partial<{ url: string; caption: string }>,
) {
  const images = block.images.map((im, k) => (k === idx ? { ...im, ...patch } : im));
  onUpdate({ images });
}

function updateDataRow(
  block: Extract<ArticleBlock, { type: "databox" }>,
  onUpdate: (patch: Partial<ArticleBlock>) => void,
  idx: number,
  patch: Partial<{ label: string; value: string }>,
) {
  const rows = block.rows.map((r, k) => (k === idx ? { ...r, ...patch } : r));
  onUpdate({ rows });
}

function updateFaqRow(
  block: Extract<ArticleBlock, { type: "faq" }>,
  onUpdate: (patch: Partial<ArticleBlock>) => void,
  idx: number,
  patch: Partial<{ q: string; a: string }>,
) {
  const items = block.items.map((it, k) => (k === idx ? { ...it, ...patch } : it));
  onUpdate({ items });
}

/* ════════════════════════════════════════════════════════════════════════
 * Controles compartidos
 * ════════════════════════════════════════════════════════════════════════ */

const inlineField: React.CSSProperties = {
  background: "transparent",
  border: "none",
  outline: "none",
  fontSize: 13,
  color: "var(--text-primary)",
  fontFamily: "inherit",
  minWidth: 0,
};

const boxField: React.CSSProperties = {
  background: "var(--surface-page)",
  border: "0.5px solid var(--border-ui)",
  borderRadius: 5,
  outline: "none",
  padding: "5px 8px",
  fontSize: 12,
  color: "var(--text-primary)",
  fontFamily: "inherit",
  minWidth: 0,
  boxSizing: "border-box",
};

const linkBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 10,
  fontWeight: 600,
  color: "var(--accent-info)",
  cursor: "pointer",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

function AutoTextarea({
  value,
  onChange,
  placeholder,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      style={{
        width: "100%",
        background: "transparent",
        border: "none",
        outline: "none",
        resize: "none",
        overflow: "hidden",
        fontFamily: "inherit",
        ...style,
      }}
    />
  );
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="flex items-center"
      style={{ background: "var(--surface-card)", border: "0.5px solid var(--border-ui)", borderRadius: 6, padding: 2, gap: 2 }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(o.value); }}
            style={{
              padding: "3px 8px",
              background: active ? "var(--text-primary)" : "transparent",
              border: "none",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: active ? 600 : 500,
              color: active ? "#fff" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-pressed={on}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 9px",
        height: 26,
        // Estado on/off → verde (status), no coral (reservado a CTAs) ni azul
        // (reservado a hints). Misma convención que el switch canónico de la app.
        background: on ? "var(--wizard-success-light)" : "var(--surface-card)",
        border: on ? "0.5px solid var(--status-active)" : "0.5px solid var(--border-ui)",
        borderRadius: 6,
        fontSize: 10,
        fontWeight: 600,
        color: on ? "var(--wizard-success-dark)" : "var(--text-secondary)",
        cursor: "pointer",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 18, height: 11, borderRadius: 6, padding: 1, display: "flex",
          background: on ? "var(--status-active)" : "var(--border-ui)",
          justifyContent: on ? "flex-end" : "flex-start",
          transition: "background 0.15s ease",
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: 5, background: "#fff" }} />
      </span>
      {label}
    </button>
  );
}

function AlignControl({ value, onChange }: { value: "left" | "center"; onChange: (v: "left" | "center") => void }) {
  return (
    <div
      className="flex items-center"
      style={{ background: "var(--surface-card)", border: "0.5px solid var(--border-ui)", borderRadius: 6, padding: 2, gap: 2 }}
    >
      {([
        { v: "left" as const, Icon: AlignLeft, label: "Alinear a la izquierda" },
        { v: "center" as const, Icon: AlignCenter, label: "Centrar" },
      ]).map(({ v, Icon, label }) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            aria-label={label}
            aria-pressed={active}
            title={label}
            onClick={(e) => { e.stopPropagation(); onChange(v); }}
            className="flex items-center justify-center"
            style={{
              width: 26, height: 22, borderRadius: 4, border: "none", cursor: "pointer",
              background: active ? "var(--text-primary)" : "transparent",
            }}
          >
            <Icon size={13} style={{ color: active ? "#fff" : "var(--text-secondary)" }} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

function BgSwatches({ value, onChange }: { value: string | undefined; onChange: (v: string | undefined) => void }) {
  return (
    <div className="flex items-center" style={{ gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Fondo
      </span>
      <div className="flex items-center" style={{ gap: 5 }}>
        {BLOCK_BG_PRESETS.map((p) => {
          const selected = value === p.value;
          const isDefault = p.value === undefined;
          return (
            <button
              key={p.label}
              type="button"
              aria-label={p.label}
              aria-pressed={selected}
              title={p.label}
              onClick={(e) => { e.stopPropagation(); onChange(p.value); }}
              className="flex items-center justify-center"
              style={{
                width: 22, height: 22, borderRadius: 6, cursor: "pointer", padding: 0,
                background: isDefault ? "var(--surface-card)" : p.value,
                border: selected ? "2px solid var(--accent-info)" : "1px solid var(--border-ui)",
                position: "relative",
              }}
            >
              {isDefault && (
                <span aria-hidden="true" style={{ fontSize: 9, fontWeight: 700, color: "var(--text-tertiary)" }}>A</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FieldWithIcon({ icon: Icon, children }: { icon: typeof Link2; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center"
      style={{ gap: 6, background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 5, padding: "5px 8px" }}
    >
      <Icon size={12} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} aria-hidden="true" />
      {children}
    </div>
  );
}

function AddRowBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex items-center transition-colors hover:bg-[var(--surface-card)]"
      style={{
        alignSelf: "flex-start", gap: 5, padding: "4px 8px", background: "transparent",
        border: "0.5px dashed var(--border-ui)", borderRadius: 5, fontSize: 11, fontWeight: 600,
        color: "var(--text-secondary)", cursor: "pointer",
      }}
    >
      <Plus size={12} aria-hidden="true" /> {label}
    </button>
  );
}

function RemoveRowBtn({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label="Quitar fila"
      title="Quitar"
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex items-center justify-center flex-shrink-0 transition-colors hover:bg-[var(--surface-card)]"
      style={{
        width: 24, height: 24, background: "transparent", border: "none", borderRadius: 4,
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.3 : 1,
      }}
    >
      <X size={12} style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
    </button>
  );
}
