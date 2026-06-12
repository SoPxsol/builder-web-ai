/**
 * Generador de HTML semántico del artículo a partir de sus bloques.
 *
 * Alimenta la vista «Código» del editor (solo lectura). No pretende ser el
 * HTML exacto que publica el backend — es una representación legible y fiel de
 * la estructura para que el hotelero (o un dev) entienda cómo queda el artículo.
 */
import type { BlogArticle } from "../../types/article";
import type { ArticleBlock, ArticleLayout } from "../../types/articleBlocks";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attr(name: string, value: string | undefined): string {
  return value ? ` ${name}="${esc(value)}"` : "";
}

function indent(lines: string[], pad: number): string {
  const p = " ".repeat(pad);
  return lines.map((l) => p + l).join("\n");
}

function blockHtml(block: ArticleBlock, number?: number): string {
  switch (block.type) {
    case "heading": {
      const tag = block.level === 2 ? "h2" : "h3";
      const align = block.align === "center" ? ` style="text-align:center"` : "";
      const num = block.numbered && number != null ? `${number}. ` : "";
      return `<${tag}${align}>${num}${esc(block.text)}</${tag}>`;
    }
    case "paragraph": {
      const cls = block.variant && block.variant !== "normal" ? ` class="${block.variant}"` : "";
      const align = block.align === "center" ? ` style="text-align:center"` : "";
      return `<p${cls}${align}>${esc(block.text)}</p>`;
    }
    case "list": {
      const tag = block.ordered ? "ol" : "ul";
      const items = block.items.filter(Boolean).map((it) => `  <li>${esc(it)}</li>`).join("\n");
      return `<${tag}>\n${items}\n</${tag}>`;
    }
    case "quote":
      return [
        `<blockquote>`,
        `  <p>${esc(block.text)}</p>`,
        block.author ? `  <cite>${esc(block.author)}</cite>` : "",
        `</blockquote>`,
      ].filter(Boolean).join("\n");
    case "image":
      return [
        `<figure>`,
        `  <img${attr("src", block.url)}${attr("alt", block.alt)} />`,
        block.caption ? `  <figcaption>${esc(block.caption)}</figcaption>` : "",
        `</figure>`,
      ].filter(Boolean).join("\n");
    case "gallery":
      return [
        `<div class="gallery">`,
        ...block.images.map((im) => `  <figure><img${attr("src", im.url)}${attr("alt", im.caption)} />${im.caption ? `<figcaption>${esc(im.caption)}</figcaption>` : ""}</figure>`),
        `</div>`,
      ].join("\n");
    case "video":
      return [
        `<figure class="video">`,
        `  <iframe${attr("src", block.url)} allowfullscreen></iframe>`,
        block.caption ? `  <figcaption>${esc(block.caption)}</figcaption>` : "",
        `</figure>`,
      ].filter(Boolean).join("\n");
    case "callout":
      return [
        `<aside class="callout"${attr("style", block.bg ? `background:${block.bg}` : undefined)}>`,
        block.label ? `  <p class="eyebrow">${esc(block.label)}</p>` : "",
        block.title ? `  <p class="callout__title">${esc(block.title)}</p>` : "",
        `  <p>${esc(block.text)}</p>`,
        `</aside>`,
      ].filter(Boolean).join("\n");
    case "databox":
      return [
        `<div class="databox">`,
        block.title ? `  <p class="databox__title">${esc(block.title)}</p>` : "",
        `  <dl>`,
        ...block.rows.filter((r) => r.label || r.value).map((r) => `    <div><dt>${esc(r.label)}</dt><dd>${esc(r.value)}</dd></div>`),
        `  </dl>`,
        `</div>`,
      ].filter(Boolean).join("\n");
    case "faq":
      return [
        `<section class="faq">`,
        block.title ? `  <h2>${esc(block.title)}</h2>` : "",
        ...block.items.filter((it) => it.q || it.a).map((it) =>
          `  <details>\n    <summary>${esc(it.q)}</summary>\n    <p>${esc(it.a)}</p>\n  </details>`),
        `</section>`,
      ].filter(Boolean).join("\n");
    case "cta":
      return [
        `<div class="cta"${attr("style", block.bg ? `background:${block.bg}` : undefined)}>`,
        `  <p class="cta__title">${esc(block.title)}</p>`,
        `  <p>${esc(block.text)}</p>`,
        `  <a class="btn" href="#">${esc(block.button)}</a>`,
        `</div>`,
      ].join("\n");
    case "button": {
      const align = block.align !== "left" ? ` style="text-align:${block.align}"` : "";
      return `<p${align}><a class="btn" href="${esc(block.href || "#")}">${esc(block.label)}</a></p>`;
    }
    case "divider":
      return `<hr />`;
    case "tags":
      return [
        `<ul class="tags">`,
        ...block.tags.map((t) => `  <li>${esc(t)}</li>`),
        `</ul>`,
      ].join("\n");
    case "share":
      return [
        `<div class="share">`,
        `  <span>Compartir</span>`,
        `  <a href="#" aria-label="Facebook">f</a>`,
        `  <a href="#" aria-label="Twitter">t</a>`,
        `  <a href="#" aria-label="Copiar enlace">link</a>`,
        `</div>`,
      ].join("\n");
  }
}

/** Numeración acumulada de headings con numbered=true. */
function headingNumbers(blocks: ArticleBlock[]): Record<string, number> {
  const out: Record<string, number> = {};
  let n = 0;
  for (const b of blocks) {
    if (b.type === "heading" && b.numbered) out[b.id] = ++n;
  }
  return out;
}

export function blocksToHtml(article: BlogArticle, blocks: ArticleBlock[], layout: ArticleLayout): string {
  const nums = headingNumbers(blocks);
  const body = blocks.map((b) => blockHtml(b, nums[b.id])).join("\n\n");

  const hero = [
    `<header class="post__hero">`,
    `  <nav class="breadcrumb"><a href="/">Inicio</a> / <a href="/blog">Blog</a> / <span>${esc(article.title || "Artículo")}</span></nav>`,
    article.category ? `  <p class="eyebrow">${esc(article.category)}</p>` : "",
    `  <h1>${esc(article.title || "Artículo sin título")}</h1>`,
    `  <div class="post__meta"><time>${esc(article.updatedAt.slice(0, 10))}</time> · <span>5 min lectura</span></div>`,
  ].filter(Boolean).join("\n");

  const sidebar = layout.sidebar
    ? [
        `  <aside class="post__sidebar">`,
        layout.sidebarCta
          ? `    <div class="card-cta"><p>${esc(layout.sidebarCtaTitle)}</p><p>${esc(layout.sidebarCtaText)}</p><a class="btn" href="#">${esc(layout.sidebarCtaButton)}</a></div>`
          : "",
        layout.related ? `    <div class="related"><p class="eyebrow">También te puede interesar</p><!-- artículos relacionados --></div>` : "",
        layout.newsletter ? `    <form class="newsletter"><label>Newsletter</label><input type="email" placeholder="tu@email.com" /><button>Suscribirse</button></form>` : "",
        `  </aside>`,
      ].filter(Boolean).join("\n")
    : "";

  const more = layout.moreArticles
    ? `\n  <section class="more-articles">\n    <h2>Más artículos para vos</h2>\n    <!-- grilla de artículos -->\n  </section>`
    : "";

  return [
    `<article class="post">`,
    indent(hero.split("\n"), 2),
    ``,
    `  <div class="post__layout">`,
    `    <main class="post__body">`,
    indent(body.split("\n"), 6),
    `    </main>`,
    sidebar ? indent(sidebar.split("\n"), 2) : "",
    `  </div>`,
    more,
    `</article>`,
  ].filter((l) => l !== "").join("\n");
}
