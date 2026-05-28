import { useState } from "react";
import { Pencil } from "lucide-react";
import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";
import { Button } from "./ui/button";

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
  openCreateArticle?: () => void;
}

type PostStatus = "published" | "draft";
type BlogFilter = "all" | "published" | "draft";

interface Post {
  id: number;
  title: string;
  category: string;
  status: PostStatus;
}

const posts: Post[] = [
  { id: 1, title: "5 razones para reservar directo con nosotros", category: "Consejos de viaje", status: "published" },
  { id: 2, title: "Qué hacer en Playa del Carmen en temporada alta", category: "Destino", status: "published" },
  { id: 3, title: "Blog Test 1", category: "Sin categoría", status: "draft" },
  { id: 4, title: "Test 2", category: "Sin categoría", status: "draft" },
];

const filterBtns: { id: BlogFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "published", label: "Publicados" },
  { id: "draft", label: "Borradores" },
];

export function BlogView({ siteName, navigate, openCreateArticle }: Props) {
  const [filter, setFilter] = useState<BlogFilter>("all");

  const filtered = posts.filter((p) => filter === "all" || p.status === filter);

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 860, margin: "0 auto" }}>
        <ViewHeader
          backTo="paginas"
          eyebrow={siteName}
          title="Blog"
          navigate={navigate}
          action={
            <Button variant="primary" onClick={openCreateArticle}>
              + Nuevo post
            </Button>
          }
        />

      {/* Filter tabs sub-bar */}
      <div className="flex items-center gap-1 mb-4">
        {filterBtns.map((btn) => {
          const active = filter === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className="h-5 px-4 transition-opacity hover:opacity-80"
              style={{
                background: active ? "var(--text-primary)" : "var(--badge-neutral-bg)",
                border: active ? "none" : "0.5px solid var(--border-ui)",
                borderRadius: "var(--radius-dot)",
                fontSize: "var(--font-size-sm)",
                fontWeight: active ? 500 : 400,
                color: active ? "#fff" : "var(--text-secondary)",
              }}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1">
        {filtered.map((post) => {
          const isPublished = post.status === "published";
          return (
            <div key={post.id} className="flex items-center justify-between px-4" style={{ background: "var(--surface-card)", borderRadius: "var(--radius-item)", border: "0.5px solid var(--border-ui)", height: 44, opacity: isPublished ? 1 : 0.7 }}>
              <div className="flex items-center gap-3">
                <div className="h-7 w-10 flex-shrink-0" style={{ background: "var(--badge-neutral-bg)", borderRadius: "var(--radius-dot)" }} />
                <div>
                  <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.3 }}>{post.title}</p>
                  <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>{post.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={openCreateArticle}
                  aria-label={`Editar post: ${post.title}`}
                  className="flex items-center justify-center transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                  style={{ width: 44, height: 28, background: "var(--badge-neutral-bg)", borderRadius: "var(--radius-dot)", border: "none", outlineColor: "var(--ring)", cursor: "pointer" }}
                >
                  <Pencil size={11} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
                </button>
                <span className="px-2 h-[18px] flex items-center" style={{
                  background: isPublished ? "var(--badge-green-bg)" : "var(--badge-neutral-bg)",
                  borderRadius: "var(--radius-dot)",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 500,
                  color: isPublished ? "var(--badge-green-text)" : "var(--text-secondary)",
                }}>
                  {isPublished ? "Publicado" : "Borrador"}
                </span>
              </div>
            </div>
          );
        })}

        <div className="mt-2">
          <span className="inline-flex items-center px-3 h-6" style={{ background: "var(--badge-blue-bg)", borderRadius: 5, fontSize: "var(--font-size-sm)", color: "var(--badge-blue-text)" }}>
            ✦ IA disponible · 163 prompts restantes
          </span>
        </div>
      </div>
      </div>
    </main>
  );
}
