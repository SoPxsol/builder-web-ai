import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Globe,
  Loader2,
  MoreHorizontal,
  Pencil,
  RotateCw,
  Sparkles,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import type { View } from "../types";
import type { BlogArticle } from "../types/article";
import { BLOG_URL_PREFIX } from "../types/article";
import { ViewHeader } from "./ui/view-header";
import { Button } from "./ui/button";
import { ConfirmDestructiveDialog } from "./ui/confirm-destructive-dialog";

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
  articles: BlogArticle[];
  /** Abre el diálogo de creación (solo título). */
  onCreate: () => void;
  /** Abre el editor unificado del artículo. */
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  /** Reintenta la persistencia de una fila que quedó en error. */
  onRetry: (id: string) => void;
  /** Alterna publicar/despublicar desde el menú de la fila. */
  onPublishToggle: (id: string) => void;
}

type BlogFilter = "all" | "published" | "draft";

const filterBtns: { id: BlogFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "published", label: "Publicados" },
  { id: "draft", label: "Borradores" },
];

export function BlogView({
  siteName,
  navigate,
  articles,
  onCreate,
  onEdit,
  onDelete,
  onRetry,
  onPublishToggle,
}: Props) {
  const [filter, setFilter] = useState<BlogFilter>("all");
  const [pendingDelete, setPendingDelete] = useState<BlogArticle | null>(null);

  const filtered = articles.filter((a) => filter === "all" || a.status === filter);

  function confirmDelete() {
    if (!pendingDelete) return;
    onDelete(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 860, margin: "0 auto" }}>
        <ViewHeader
          backTo="paginas"
          eyebrow={siteName}
          title="Blog"
          navigate={navigate}
          action={
            <Button variant="primary" onClick={onCreate}>
              Crear nuevo artículo
            </Button>
          }
        />

        {/* Filtros */}
        <div className="flex items-center gap-1 mb-4">
          {filterBtns.map((btn) => {
            const active = filter === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className="h-6 px-4 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                style={{
                  background: active ? "var(--text-primary)" : "var(--badge-neutral-bg)",
                  border: active ? "none" : "0.5px solid var(--border-ui)",
                  borderRadius: "var(--radius-dot)",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: active ? 500 : 400,
                  color: active ? "#fff" : "var(--text-secondary)",
                  outlineColor: "var(--ring)",
                }}
              >
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* Lista */}
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-1">
            {filtered.map((article) => (
              <ArticleRow
                key={article.id}
                article={article}
                onEdit={() => onEdit(article.id)}
                onDelete={() => setPendingDelete(article)}
                onRetry={() => onRetry(article.id)}
                onPublishToggle={() => onPublishToggle(article.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileText size={32} style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
            <p style={{ fontSize: "var(--font-size-lg)", color: "var(--text-tertiary)" }}>
              {filter === "all" ? "Todavía no hay artículos" : "No hay artículos con este filtro"}
            </p>
            {filter === "all" && (
              <Button variant="primary" size="sm" onClick={onCreate}>
                Crear primer artículo
              </Button>
            )}
          </div>
        )}

        {/* Banner IA */}
        <div className="mt-4">
          <span
            className="inline-flex items-center gap-1.5 px-3 h-6"
            style={{ background: "var(--badge-blue-bg)", borderRadius: 5, fontSize: "var(--font-size-sm)", color: "var(--badge-blue-text)" }}
          >
            <Sparkles size={11} aria-hidden="true" /> IA disponible · 163 prompts restantes
          </span>
        </div>

        <ConfirmDestructiveDialog
          open={pendingDelete !== null}
          title="Eliminar artículo"
          description="Vas a eliminar el artículo"
          resourceName={pendingDelete?.title}
          confirmLabel="Eliminar artículo"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      </div>
    </main>
  );
}

/* ─── Fila ─────────────────────────────────────────────────────────────── */

function ArticleRow({
  article,
  onEdit,
  onDelete,
  onRetry,
  onPublishToggle,
}: {
  article: BlogArticle;
  onEdit: () => void;
  onDelete: () => void;
  onRetry: () => void;
  onPublishToggle: () => void;
}) {
  const isSaving = article.creation === "saving";
  const isError = article.creation === "error";
  const isPublished = article.status === "published";

  return (
    <div
      className="flex items-center justify-between px-4"
      style={{
        background: "var(--surface-card)",
        borderRadius: "var(--radius-item)",
        border: isError ? "0.5px solid var(--destructive)" : "0.5px solid var(--border-ui)",
        minHeight: 52,
        opacity: isSaving ? 0.85 : 1,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Thumb portada */}
        {article.coverImageUrl ? (
          <div
            className="flex-shrink-0"
            style={{
              height: 32,
              width: 44,
              background: `url(${article.coverImageUrl}) center/cover`,
              borderRadius: "var(--radius-dot)",
            }}
            aria-hidden="true"
          />
        ) : (
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ height: 32, width: 44, background: "var(--badge-neutral-bg)", borderRadius: "var(--radius-dot)" }}
            aria-hidden="true"
          >
            {isSaving ? (
              <Loader2 size={13} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
            ) : (
              <FileText size={13} style={{ color: "var(--text-tertiary)" }} />
            )}
          </div>
        )}

        <div className="min-w-0">
          <p
            className="truncate"
            style={{ fontSize: "var(--font-size-lg)", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.3, maxWidth: 420 }}
          >
            {article.title}
          </p>
          {/* Meta: estado transitorio o slug + categoría */}
          {isSaving ? (
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)" }}>Guardando…</span>
          ) : isError ? (
            <span className="flex items-center gap-1" style={{ fontSize: "var(--font-size-sm)", color: "var(--destructive)" }}>
              <TriangleAlert size={11} aria-hidden="true" /> No se pudo guardar
            </span>
          ) : (
            <div className="flex items-center gap-1">
              <Globe size={9} style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
              <span className="truncate" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)" }}>
                {BLOG_URL_PREFIX}
                {article.slug || "…"}
                {article.category ? ` · ${article.category}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Acciones derechas */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isError ? (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 h-7 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{ background: "var(--destructive)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: 500, color: "#fff", border: "none", cursor: "pointer", outlineColor: "var(--destructive)" }}
          >
            <RotateCw size={11} aria-hidden="true" /> Reintentar
          </button>
        ) : (
          <>
            <span
              className="px-2 flex items-center flex-shrink-0"
              style={{
                height: 20,
                background: isPublished ? "var(--badge-green-bg)" : "var(--badge-neutral-bg)",
                borderRadius: "var(--radius-dot)",
                fontSize: "var(--font-size-xs)",
                fontWeight: 600,
                color: isPublished ? "var(--badge-green-text)" : "var(--text-secondary)",
              }}
            >
              {isPublished ? "Publicado" : "Borrador"}
            </span>
            <button
              type="button"
              onClick={onEdit}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 h-7 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--brand)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: 500, color: "#fff", border: "none", cursor: "pointer", outlineColor: "var(--brand)" }}
            >
              <Pencil size={10} aria-hidden="true" /> Editar
            </button>
            <RowMenu
              isPublished={isPublished}
              disabled={isSaving}
              onEdit={onEdit}
              onPublishToggle={onPublishToggle}
              onDelete={onDelete}
            />
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Kebab de la fila ─────────────────────────────────────────────────── */

function RowMenu({
  isPublished,
  disabled,
  onEdit,
  onPublishToggle,
  onDelete,
}: {
  isPublished: boolean;
  disabled: boolean;
  onEdit: () => void;
  onPublishToggle: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Más acciones del artículo"
        className="flex items-center justify-center h-7 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          width: 28,
          background: open ? "var(--surface-page)" : "transparent",
          borderRadius: "var(--radius-nav)",
          border: open ? "0.5px solid var(--border-ui)" : "0.5px solid transparent",
          cursor: "pointer",
          outlineColor: "var(--ring)",
        }}
      >
        <MoreHorizontal size={13} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute"
          style={{
            top: 32,
            right: 0,
            zIndex: 100,
            background: "var(--surface-card)",
            borderRadius: "var(--radius-card)",
            border: "0.5px solid var(--border-ui)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            minWidth: 180,
            overflow: "hidden",
            padding: "4px 0",
          }}
        >
          <MenuItem icon={Pencil} label="Editar artículo" onClick={() => run(onEdit)} />
          <MenuItem
            icon={Globe}
            label={isPublished ? "Pasar a borrador" : "Publicar"}
            onClick={() => run(onPublishToggle)}
          />
          <div style={{ height: "0.5px", background: "var(--border-ui)", margin: "4px 0" }} />
          <MenuItem icon={Trash2} label="Eliminar" destructive onClick={() => run(onDelete)} />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  const color = destructive ? "var(--destructive)" : "var(--text-primary)";
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-3 h-8 transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
      style={{ background: "transparent", fontSize: "var(--font-size-md)", color, textAlign: "left", border: "none", cursor: "pointer", outlineColor: "var(--accent-info)" }}
    >
      <Icon size={12} style={{ color: destructive ? "var(--destructive)" : "var(--text-secondary)" }} aria-hidden="true" />
      {label}
    </button>
  );
}
