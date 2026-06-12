import { createContext, useContext } from "react";
import { Calendar, Clock, Facebook, Link2, PlayCircle, Twitter, User } from "lucide-react";
import type { BlogArticle } from "../../types/article";
import type { ArticleBlock, ArticleLayout } from "../../types/articleBlocks";
import { readableInk } from "../../types/articleBlocks";
import { DEFAULT_PREVIEW_THEME, type PreviewTheme } from "./previewTheme";

const ThemeCtx = createContext<PreviewTheme>(DEFAULT_PREVIEW_THEME);
const useTheme = () => useContext(ThemeCtx);

const RELATED = [
  { eyebrow: "Aventura", title: "Trekking en los Andes para todos los niveles", date: "22 abr 2026" },
  { eyebrow: "Vinos", title: "Las 5 bodegas boutique del Valle de Uco", date: "8 mayo 2026" },
  { eyebrow: "Gastronomía", title: "Alta cocina mendocina: los platos que definen la región", date: "3 mayo 2026" },
];

interface Props {
  article: BlogArticle;
  blocks: ArticleBlock[];
  layout: ArticleLayout;
  /** Override del tema del sitio (colores/tipografías reales de la marca). */
  theme?: Partial<PreviewTheme>;
}

/**
 * ArticlePreviewFull — vista previa fiel del artículo publicado.
 *
 * Renderiza el hero, el cuerpo por bloques y el chrome opcional (columna
 * derecha sticky con CTA + relacionados + newsletter, y la grilla "Más
 * artículos para vos" al pie), según los toggles de `layout`.
 */
export function ArticlePreviewFull({ article, blocks, layout, theme }: Props) {
  const t: PreviewTheme = { ...DEFAULT_PREVIEW_THEME, ...theme };
  const hasSidebar = layout.sidebar && (layout.sidebarCta || layout.related || layout.newsletter);

  return (
    <ThemeCtx.Provider value={t}>
      <div style={{ background: t.bg, color: t.ink, fontFamily: t.serif, minHeight: "100%" }}>
        {/* ── Hero ── */}
        <Hero article={article} />

        {/* ── Cuerpo + sidebar ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: hasSidebar ? "minmax(0,1fr) 300px" : "minmax(0,1fr)",
            gap: 48,
            maxWidth: 1080,
            margin: "0 auto",
            padding: "48px 40px",
          }}
        >
          <main style={{ minWidth: 0 }}>
            {blocks.length === 0 ? (
              <p style={{ color: t.inkFaint, fontStyle: "italic" }}>Sin contenido todavía.</p>
            ) : (
              blocks.map((b, i) => <BlockView key={b.id} block={b} number={numberFor(blocks, i)} />)
            )}
          </main>

          {hasSidebar && (
            <aside style={{ alignSelf: "start", position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 32 }}>
              {layout.sidebarCta && <SidebarCta layout={layout} />}
              {layout.related && <RelatedList />}
              {layout.newsletter && <Newsletter />}
            </aside>
          )}
        </div>

        {/* ── Más artículos ── */}
        {layout.moreArticles && <MoreArticles />}
      </div>
    </ThemeCtx.Provider>
  );
}

/* ─── Numeración de headings (igual que el canvas) ─────────────────────── */
function numberFor(blocks: ArticleBlock[], index: number): number | undefined {
  let n = 0;
  for (let i = 0; i <= index; i++) {
    const b = blocks[i];
    if (b.type === "heading" && b.numbered) n += 1;
  }
  const cur = blocks[index];
  return cur.type === "heading" && cur.numbered ? n : undefined;
}

/* ════════════════════════════════════════════════════════════════════════
 * Hero
 * ════════════════════════════════════════════════════════════════════════ */

function Hero({ article }: { article: BlogArticle }) {
  const t = useTheme();
  const cover = article.coverImageUrl;
  return (
    <header
      style={{
        position: "relative",
        minHeight: 340,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "40px",
        color: "#fff",
        background: cover
          ? `linear-gradient(to top, rgba(20,18,15,0.82) 0%, rgba(20,18,15,0.25) 60%, rgba(20,18,15,0.45) 100%), url(${cover}) center/cover`
          : "linear-gradient(135deg, #3a352d, #1c1a17)",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", width: "100%" }}>
        {/* Breadcrumb */}
        <nav style={{ display: "flex", gap: 8, fontFamily: t.sans, fontSize: 12, opacity: 0.7, marginBottom: 16 }}>
          <span>Inicio</span><span>/</span><span>Blog</span><span>/</span>
          <span style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {article.title || "Artículo"}
          </span>
        </nav>
        {article.category && (
          <p style={{ fontFamily: t.sans, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.85, margin: "0 0 12px" }}>
            — {article.category}
          </p>
        )}
        <h1 style={{ fontSize: 48, fontWeight: 500, lineHeight: 1.08, margin: 0, maxWidth: 760 }}>
          {article.title || "Artículo sin título"}
        </h1>
        <div style={{ display: "flex", gap: 24, marginTop: 22, fontFamily: t.sans, fontSize: 13, opacity: 0.85, flexWrap: "wrap" }}>
          <Meta icon={Calendar} text={formatDate(article.updatedAt)} />
          <Meta icon={Clock} text="5 min lectura" />
          <Meta icon={User} text="Por el equipo del hotel" />
        </div>
      </div>
    </header>
  );
}

function Meta({ icon: Icon, text }: { icon: typeof Calendar; text: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
      <Icon size={14} aria-hidden="true" /> {text}
    </span>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

/* ════════════════════════════════════════════════════════════════════════
 * Bloques del cuerpo
 * ════════════════════════════════════════════════════════════════════════ */

function BlockView({ block, number }: { block: ArticleBlock; number?: number }) {
  const t = useTheme();
  const mb = 24;
  switch (block.type) {
    case "heading":
      return (
        <h2
          style={{
            fontSize: block.level === 2 ? 30 : 23,
            fontWeight: 500,
            lineHeight: 1.2,
            color: t.ink,
            margin: `${mb + 12}px 0 ${mb - 8}px`,
            textAlign: block.align ?? "left",
          }}
        >
          {block.numbered && number != null ? `${number}. ` : ""}
          {block.text || "Encabezado"}
        </h2>
      );

    case "paragraph": {
      const variant = block.variant ?? "normal";
      const size = variant === "lead" ? 21 : variant === "small" ? 14 : 17;
      return (
        <p
          style={{
            fontSize: size,
            lineHeight: variant === "lead" ? 1.5 : 1.75,
            color: variant === "small" ? t.inkSoft : t.ink,
            fontStyle: variant === "lead" ? "italic" : "normal",
            textAlign: block.align ?? "left",
            margin: `0 0 ${mb}px`,
            whiteSpace: "pre-wrap",
          }}
        >
          {block.text || <span style={{ color: t.inkFaint, fontStyle: "italic" }}>(párrafo vacío)</span>}
        </p>
      );
    }

    case "list": {
      const items = block.items.filter(Boolean);
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag style={{ margin: `0 0 ${mb}px`, paddingLeft: 24, fontSize: 17, lineHeight: 1.7, color: t.ink }}>
          {items.map((it, i) => (
            <li key={i} style={{ marginBottom: 6 }}>{it}</li>
          ))}
        </Tag>
      );
    }

    case "quote":
      return (
        <blockquote style={{ margin: `${mb}px 0`, paddingLeft: 22, borderLeft: `3px solid ${t.accent}` }}>
          <p style={{ fontSize: 22, fontStyle: "italic", lineHeight: 1.45, color: t.ink, margin: 0 }}>
            {block.text || "Cita"}
          </p>
          {block.author && (
            <footer style={{ fontFamily: t.sans, fontSize: 13, color: t.inkSoft, marginTop: 10 }}>
              — {block.author}
            </footer>
          )}
        </blockquote>
      );

    case "image":
      return (
        <figure style={{ margin: `${mb}px 0` }}>
          {block.url ? (
            <img src={block.url} alt={block.alt} style={{ width: "100%", borderRadius: 4, display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: 280, background: t.surface, border: `1px dashed ${t.border}`, borderRadius: 4 }} />
          )}
          {block.caption && (
            <figcaption style={{ fontFamily: t.sans, fontSize: 12, color: t.inkSoft, textAlign: "center", marginTop: 10, fontStyle: "italic" }}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "gallery": {
      const imgs = block.images.filter((im) => im.url);
      return (
        <div style={{ margin: `${mb}px 0`, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {(imgs.length ? imgs : block.images).map((im) => (
            <figure key={im.id} style={{ margin: 0 }}>
              {im.url ? (
                <img src={im.url} alt={im.caption} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 4, display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: 160, background: t.surface, border: `1px dashed ${t.border}`, borderRadius: 4 }} />
              )}
              {im.caption && (
                <figcaption style={{ fontFamily: t.sans, fontSize: 11, color: t.inkSoft, marginTop: 6, fontStyle: "italic" }}>
                  {im.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      );
    }

    case "video":
      return (
        <figure style={{ margin: `${mb}px 0` }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: 4,
              background: t.dark,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            <PlayCircle size={56} strokeWidth={1} aria-hidden="true" />
          </div>
          {block.caption && (
            <figcaption style={{ fontFamily: t.sans, fontSize: 12, color: t.inkSoft, textAlign: "center", marginTop: 10, fontStyle: "italic" }}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "callout": {
      const bg = block.bg ?? t.dark;
      const ink = readableInk(bg);
      const soft = ink === "#ffffff" ? "rgba(255,255,255,0.82)" : "rgba(28,26,23,0.72)";
      return (
        <div style={{ margin: `${mb}px 0`, background: bg, borderRadius: 14, padding: "26px 30px", color: ink }}>
          {block.label && (
            <p style={{ fontFamily: t.sans, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: t.accent, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
              ✦ {block.label}
            </p>
          )}
          {block.title && (
            <p style={{ fontSize: 19, fontWeight: 500, margin: "0 0 8px", color: ink }}>{block.title}</p>
          )}
          <p style={{ fontFamily: t.sans, fontSize: 15, lineHeight: 1.65, color: soft, margin: 0 }}>
            {block.text || "Texto del consejo."}
          </p>
        </div>
      );
    }

    case "databox":
      return (
        <div style={{ margin: `${mb}px 0`, border: `1px solid ${t.border}`, borderRadius: 10, padding: "18px 22px", background: t.surface }}>
          {block.title && <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 12px" }}>{block.title}</p>}
          <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {block.rows.filter((r) => r.label || r.value).map((r) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", gap: 16, fontFamily: t.sans, fontSize: 14, borderBottom: `1px solid ${t.border}`, paddingBottom: 8 }}>
                <dt style={{ color: t.inkSoft }}>{r.label}</dt>
                <dd style={{ margin: 0, color: t.ink, fontWeight: 500, textAlign: "right" }}>{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      );

    case "faq": {
      const items = block.items.filter((it) => it.q || it.a);
      return (
        <div style={{ margin: `${mb}px 0` }}>
          {block.title && <h2 style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.2, color: t.ink, margin: "0 0 18px" }}>{block.title}</h2>}
          <div style={{ borderTop: `1px solid ${t.border}` }}>
            {items.map((it) => (
              <details key={it.id} style={{ borderBottom: `1px solid ${t.border}`, padding: "14px 0" }}>
                <summary style={{ fontFamily: t.sans, fontSize: 16, fontWeight: 600, color: t.ink, cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", gap: 12 }}>
                  {it.q || "Pregunta"}
                  <span aria-hidden="true" style={{ color: t.accent, fontWeight: 400 }}>+</span>
                </summary>
                {it.a && (
                  <p style={{ fontFamily: t.sans, fontSize: 15, lineHeight: 1.65, color: t.inkSoft, margin: "10px 0 0" }}>{it.a}</p>
                )}
              </details>
            ))}
          </div>
        </div>
      );
    }

    case "cta": {
      const bg = block.bg ?? t.dark;
      const ink = readableInk(bg);
      const soft = ink === "#ffffff" ? "rgba(255,255,255,0.8)" : "rgba(28,26,23,0.7)";
      return (
        <div style={{ margin: `${mb}px 0`, background: bg, borderRadius: 14, padding: "32px 28px", textAlign: "center", color: ink, border: ink === "#1c1a17" ? `1px solid ${t.border}` : "none" }}>
          <p style={{ fontSize: 24, fontWeight: 500, margin: "0 0 8px", color: ink }}>{block.title}</p>
          <p style={{ fontFamily: t.sans, fontSize: 15, color: soft, margin: "0 0 20px", lineHeight: 1.5 }}>
            {block.text}
          </p>
          <span style={{ display: "inline-block", background: t.accent, color: readableInk(t.accent), fontFamily: t.sans, fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "14px 34px" }}>
            {block.button || "Acción"}
          </span>
        </div>
      );
    }

    case "button":
      return (
        <div style={{ margin: `${mb}px 0`, display: "flex", justifyContent: block.align === "center" ? "center" : block.align === "right" ? "flex-end" : "flex-start" }}>
          <span style={{ display: "inline-block", background: t.accent, color: t.accentInk, fontFamily: t.sans, fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "14px 30px" }}>
            {block.label || "Botón"}
          </span>
        </div>
      );

    case "divider":
      return <hr style={{ border: "none", borderTop: `1px solid ${t.border}`, margin: `${mb + 8}px 0` }} />;

    case "tags":
      return (
        <div style={{ margin: `${mb}px 0`, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {block.tags.length ? (
            block.tags.map((tag, i) => (
              <span key={i} style={{ fontFamily: t.sans, fontSize: 14, color: t.inkSoft, border: `1px solid ${t.border}`, borderRadius: 24, padding: "8px 20px" }}>
                {tag}
              </span>
            ))
          ) : (
            <span style={{ color: t.inkFaint, fontStyle: "italic", fontSize: 14 }}>(sin etiquetas)</span>
          )}
        </div>
      );

    case "share":
      return (
        <div style={{ margin: `${mb}px 0`, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: t.sans, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: t.inkSoft }}>
            Compartir
          </span>
          {[Facebook, Twitter, Link2].map((Icon, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 22, border: `1px solid ${t.border}`, color: t.inkSoft }}>
              <Icon size={17} aria-hidden="true" />
            </span>
          ))}
        </div>
      );
  }
}

/* ════════════════════════════════════════════════════════════════════════
 * Chrome — sidebar y footer
 * ════════════════════════════════════════════════════════════════════════ */

function SidebarCta({ layout }: { layout: ArticleLayout }) {
  const t = useTheme();
  return (
    <div style={{ background: t.dark, borderRadius: 16, padding: "26px 24px", color: "#fff" }}>
      <p style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2, margin: "0 0 12px" }}>{layout.sidebarCtaTitle}</p>
      <p style={{ fontFamily: t.sans, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.78)", margin: "0 0 20px" }}>
        {layout.sidebarCtaText}
      </p>
      <span style={{ display: "block", textAlign: "center", background: t.accent, color: t.accentInk, fontFamily: t.sans, fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "14px 18px" }}>
        {layout.sidebarCtaButton}
      </span>
    </div>
  );
}

function RelatedList() {
  const t = useTheme();
  return (
    <div>
      <p style={{ fontFamily: t.sans, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: t.inkSoft, margin: "0 0 16px" }}>
        — También te puede interesar
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {RELATED.map((r, i) => (
          <div key={i} style={{ borderTop: i ? `1px solid ${t.border}` : "none", paddingTop: i ? 18 : 0 }}>
            <p style={{ fontFamily: t.sans, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: t.inkFaint, margin: "0 0 6px" }}>
              {r.eyebrow}
            </p>
            <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.25, color: t.ink, margin: "0 0 6px" }}>{r.title}</p>
            <p style={{ fontFamily: t.sans, fontSize: 12, color: t.inkFaint, margin: 0 }}>{r.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Newsletter() {
  const t = useTheme();
  return (
    <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 24 }}>
      <p style={{ fontFamily: t.sans, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: t.inkSoft, margin: "0 0 14px" }}>
        — Newsletter
      </p>
      <p style={{ fontSize: 18, lineHeight: 1.4, color: t.ink, margin: "0 0 16px" }}>
        Recibí los mejores artículos una vez por semana.
      </p>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: "14px 16px", fontFamily: t.sans, fontSize: 14, color: t.inkFaint, marginBottom: 10 }}>
        tu@email.com
      </div>
      <div style={{ background: t.accent, color: t.accentInk, textAlign: "center", fontFamily: t.sans, fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "14px 16px" }}>
        Suscribirse
      </div>
    </div>
  );
}

function MoreArticles() {
  const t = useTheme();
  return (
    <section style={{ borderTop: `1px solid ${t.border}`, padding: "56px 40px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <h2 style={{ fontSize: 36, fontWeight: 500, margin: "0 0 32px" }}>
          Más artículos <em>para vos</em>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {RELATED.map((r, i) => (
            <article key={i} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ width: "100%", height: 200, background: t.surface, borderRadius: 4, marginBottom: 16 }} />
              <p style={{ fontFamily: t.sans, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: t.inkFaint, margin: "0 0 8px" }}>
                {r.eyebrow}
              </p>
              <p style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.25, color: t.ink, margin: "0 0 10px" }}>{r.title}</p>
              <p style={{ fontFamily: t.sans, fontSize: 13, color: t.inkFaint, margin: 0 }}>{r.date}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
