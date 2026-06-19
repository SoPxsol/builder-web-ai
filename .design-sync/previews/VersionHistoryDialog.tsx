import { VersionHistoryDialog } from "@figma/my-make-file";

const noop = () => {};

// Snapshot mínimo de bloques — el dialog solo muestra cuántos hay por versión.
const mkSnapshot = (n: number) => ({
  title: "Guía gastronómica de Buenos Aires",
  slug: "guia-gastronomica-buenos-aires",
  category: "Gastronomía",
  excerpt: "Bodegones, parrillas y cafés notables: dónde comer mejor cerca del hotel.",
  coverImageUrl:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=70&w=1200",
  blocks: Array.from({ length: n }, (_, i) => ({ id: `b-${i}`, type: "paragraph" as const, text: "" })),
  layout: {
    sidebar: true,
    sidebarCta: true,
    sidebarCtaTitle: "",
    sidebarCtaText: "",
    sidebarCtaButton: "",
    related: true,
    newsletter: true,
    moreArticles: true,
  },
});

const VERSIONS = [
  { id: "v3", savedAt: "2026-06-18T16:42:00.000Z", label: "Actualización", snapshot: mkSnapshot(14) },
  { id: "v2", savedAt: "2026-06-12T11:05:00.000Z", label: "Publicación", snapshot: mkSnapshot(11) },
  { id: "v1", savedAt: "2026-06-10T09:30:00.000Z", label: "Borrador inicial", snapshot: mkSnapshot(6) },
];

// Historial con varias versiones — la más reciente queda marcada "Actual".
export const ConVersiones = () => (
  <div style={{ position: "relative", width: 620, height: 460 }}>
    <VersionHistoryDialog versions={VERSIONS} onRestore={noop} onClose={noop} />
  </div>
);

// Estado vacío — artículo que todavía no se publicó.
export const Vacio = () => (
  <div style={{ position: "relative", width: 620, height: 460 }}>
    <VersionHistoryDialog versions={[]} onRestore={noop} onClose={noop} />
  </div>
);
