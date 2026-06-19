import { SectionEyebrow } from "@figma/my-make-file";

const wrap = (children: React.ReactNode) => (
  <div style={{ display: "flex", flexDirection: "column", width: 320, padding: 16, background: "var(--surface-page)" }}>
    {children}
  </div>
);

export const Lanzar = () => wrap(<SectionEyebrow group="launch" />);

export const Crecer = () => wrap(<SectionEyebrow group="grow" />);

export const EnContexto = () =>
  wrap(
    <>
      <SectionEyebrow group="launch" />
      <span style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)" }}>
        SEO y Schema.org
      </span>
      <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
        Configurá cómo aparece tu hotel en Google y en buscadores de IA.
      </span>
    </>,
  );
