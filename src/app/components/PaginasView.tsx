import { useState } from "react";
import { Plus, Pencil, Eye, Copy, Trash2, Globe, FileText, MoreHorizontal, Home, BedDouble, Phone, Star, Image as ImageIcon, Info } from "lucide-react";
import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";
import { Button } from "./ui/button";
import { ConfirmDestructiveDialog } from "./ui/confirm-destructive-dialog";

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  updatedAt: string;
  isHome: boolean;
  Icon: React.ElementType;
}

const DEFAULT_PAGES: Page[] = [
  { id: "inicio",        title: "Inicio",            slug: "/",             status: "published", updatedAt: "hace 2 días",    isHome: true,  Icon: Home        },
  { id: "habitaciones",  title: "Habitaciones",      slug: "/habitaciones", status: "published", updatedAt: "hace 5 días",    isHome: false, Icon: BedDouble   },
  { id: "contacto",      title: "Contacto",          slug: "/contacto",     status: "published", updatedAt: "hace 1 semana",  isHome: false, Icon: Phone       },
  { id: "galeria",       title: "Galería",            slug: "/galeria",      status: "draft",     updatedAt: "hace 2 semanas", isHome: false, Icon: ImageIcon   },
  { id: "servicios",     title: "Servicios",          slug: "/servicios",    status: "draft",     updatedAt: "hace 3 semanas", isHome: false, Icon: Star        },
  { id: "nosotros",      title: "Nosotros",           slug: "/nosotros",     status: "published", updatedAt: "hace 1 mes",     isHome: false, Icon: Info        },
];

function PageRow({ page, onEdit, onPreview, onDelete }: { page: Page; onEdit: () => void; onPreview: () => void; onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isPublished = page.status === "published";

  return (
    <div
      className="flex items-center gap-3 px-4 transition-colors hover:opacity-90"
      style={{ height: 52, borderBottom: "0.5px solid var(--border-ui)", background: "var(--surface-card)" }}
    >
      {/* Icon */}
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, borderRadius: "var(--radius-icon)", background: "var(--surface-page)", border: "0.5px solid var(--border-ui)" }}>
        <page.Icon size={14} style={{ color: "var(--text-secondary)" }} />
      </div>

      {/* Title + slug */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "var(--font-size-lg)", fontWeight: 500, color: "var(--text-primary)" }}>{page.title}</span>
          {page.isHome && (
            <span className="flex items-center px-1.5" style={{ height: 16, background: "var(--badge-blue-bg)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-xs)", fontWeight: 500, color: "var(--badge-blue-text)" }}>
              Principal
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Globe size={9} style={{ color: "var(--text-tertiary)" }} />
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)" }}>{page.slug}</span>
        </div>
      </div>

      {/* Status */}
      <div className="flex-shrink-0" style={{ width: 88 }}>
        <span
          className="inline-flex items-center px-2"
          style={{
            height: 20,
            background: isPublished ? "var(--badge-green-bg)" : "var(--surface-page)",
            borderRadius: "var(--radius-dot)",
            fontSize: "var(--font-size-xs)",
            fontWeight: 500,
            color: isPublished ? "var(--badge-green-text)" : "var(--text-tertiary)",
            border: isPublished ? "none" : "0.5px solid var(--border-ui)",
          }}
        >
          {isPublished ? "Publicada" : "Borrador"}
        </span>
      </div>

      {/* Updated */}
      <span className="flex-shrink-0" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)", width: 96, textAlign: "right" }}>
        {page.updatedAt}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 h-7 transition-opacity hover:opacity-80"
          style={{ background: "var(--brand)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: 500, color: "#fff", border: "none", cursor: "pointer" }}
        >
          <Pencil size={10} /> Editar
        </button>
        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 px-3 h-7 transition-opacity hover:opacity-80"
          style={{ background: "var(--surface-page)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", color: "var(--text-secondary)", border: "0.5px solid var(--border-ui)", cursor: "pointer" }}
        >
          <Eye size={10} />
        </button>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center justify-center h-7 transition-opacity hover:opacity-70"
            style={{ width: 28, background: menuOpen ? "var(--surface-page)" : "transparent", borderRadius: "var(--radius-nav)", border: menuOpen ? "0.5px solid var(--border-ui)" : "0.5px solid transparent", cursor: "pointer" }}
          >
            <MoreHorizontal size={13} style={{ color: "var(--text-secondary)" }} />
          </button>
          {menuOpen && (
            <div
              className="absolute"
              style={{ top: 32, right: 0, zIndex: 100, background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", minWidth: 160, overflow: "hidden", padding: "4px 0" }}
            >
              {[{ Icon: Copy, label: "Duplicar página" }, { Icon: Globe, label: isPublished ? "Despublicar" : "Publicar" }].map(({ Icon, label }) => (
                <button
                  key={label}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 h-8 transition-colors hover:opacity-80"
                  style={{ background: "transparent", fontSize: "var(--font-size-md)", color: "var(--text-primary)", textAlign: "left", border: "none", cursor: "pointer" }}
                >
                  <Icon size={12} style={{ color: "var(--text-secondary)" }} />{label}
                </button>
              ))}
              <div style={{ height: "0.5px", background: "var(--border-ui)", margin: "4px 0" }} />
              {!page.isHome && (
                <button
                  onClick={() => { setMenuOpen(false); onDelete(); }}
                  className="flex items-center gap-2.5 w-full px-3 h-8 transition-colors hover:opacity-80"
                  style={{ background: "transparent", fontSize: "var(--font-size-md)", color: "var(--destructive)", textAlign: "left", border: "none", cursor: "pointer" }}
                >
                  <Trash2 size={12} style={{ color: "var(--destructive)" }} />Eliminar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PaginasView({ siteName, navigate }: Props) {
  const [pages, setPages] = useState<Page[]>(DEFAULT_PAGES);
  const [pendingDelete, setPendingDelete] = useState<Page | null>(null);

  function addPage() {
    navigate("editor");
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    setPages((prev) => prev.filter((p) => p.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  const published = pages.filter((p) => p.status === "published").length;
  const drafts = pages.filter((p) => p.status === "draft").length;

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 860, margin: "0 auto" }}>
        <ViewHeader
          backTo="mis-sitios"
          backLabel="Volver a Mis Sitios"
          eyebrow={siteName}
          title="Páginas"
          navigate={navigate}
          action={
            <Button variant="primary" onClick={addPage} leftIcon={<Plus size={12} />}>
              Nueva página
            </Button>
          }
        />
        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4">
          <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}>
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{pages.length}</span> páginas en total
          </span>
          <span style={{ width: 1, height: 12, background: "var(--border-ui)", display: "inline-block" }} />
          <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}>
            <span style={{ fontWeight: 600, color: "var(--badge-green-text)" }}>{published}</span> publicadas
          </span>
          <span style={{ width: 1, height: 12, background: "var(--border-ui)", display: "inline-block" }} />
          <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}>
            <span style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>{drafts}</span> borradores
          </span>
        </div>

        {/* Table */}
        <div style={{ borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", overflow: "hidden" }}>
          {/* Table header */}
          <div
            className="flex items-center gap-3 px-4"
            style={{ height: 36, background: "var(--surface-page)", borderBottom: "0.5px solid var(--border-ui)" }}
          >
            <div style={{ width: 32, flexShrink: 0 }} />
            <span className="flex-1" style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Página</span>
            <span style={{ width: 88, fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>Estado</span>
            <span style={{ width: 96, fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right", flexShrink: 0 }}>Modificada</span>
            <div style={{ width: 130, flexShrink: 0 }} />
          </div>

          {/* Rows */}
          {pages.map((page) => (
            <PageRow
              key={page.id}
              page={page}
              onEdit={() => navigate("editor")}
              onPreview={() => {}}
              onDelete={() => setPendingDelete(page)}
            />
          ))}
        </div>

        <ConfirmDestructiveDialog
          open={pendingDelete !== null}
          title="Eliminar página"
          description="Vas a eliminar la página"
          resourceName={pendingDelete?.title}
          confirmLabel="Eliminar página"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />

        {/* Empty state when no pages */}
        {pages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileText size={32} style={{ color: "var(--text-tertiary)" }} />
            <p style={{ fontSize: "var(--font-size-lg)", color: "var(--text-tertiary)" }}>No hay páginas todavía</p>
            <button onClick={addPage} className="flex items-center gap-1.5 px-4 h-8" style={{ background: "var(--brand)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: 500, color: "#fff", border: "none", cursor: "pointer" }}>
              <Plus size={12} /> Crear primera página
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
