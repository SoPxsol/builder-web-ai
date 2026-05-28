import type { W2Seo, W2State } from "../../../types/wizard2";
import { AI_SEO } from "../../../types/wizard2";
import { SectionEyebrow } from "../shared/SectionEyebrow";
import { SeoCard } from "../shared/SeoCard";
import { ToggleRow } from "../shared/ToggleRow";

interface Props {
  state: W2State;
  update: (patch: Partial<W2State>) => void;
}

type PageKey = keyof W2Seo["pages"];

const PAGE_LABELS: Record<PageKey, string> = {
  inicio: "Inicio",
  habitaciones: "Habitaciones",
  contacto: "Contacto",
};

function DividerLabel({ children }: { children: string }) {
  return (
    <p
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: "var(--text-tertiary)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        borderBottom: "1px solid var(--border-ui)",
        paddingBottom: 4,
        marginBottom: 8,
        marginTop: 0,
      }}
    >
      {children}
    </p>
  );
}

export function S5Seo({ state, update }: Props) {
  const { seo } = state;

  function setPageField(page: PageKey, field: "title" | "description", value: string) {
    update({
      seo: {
        ...seo,
        pages: {
          ...seo.pages,
          [page]: { ...seo.pages[page], [field]: value },
        },
      },
    });
  }

  function generateAI(page: PageKey) {
    update({
      seo: {
        ...seo,
        pages: {
          ...seo.pages,
          [page]: { ...AI_SEO[page] },
        },
      },
    });
  }

  function setSchemaOrg(value: boolean) {
    update({ seo: { ...seo, schemaOrgEnabled: value } });
  }

  function setGeo(value: boolean) {
    update({ seo: { ...seo, geoEnabled: value } });
  }

  return (
    <div className="flex flex-col" style={{ padding: "20px 24px" }}>
      <SectionEyebrow group="launch" id="s5-eyebrow" />

      <div style={{ marginBottom: 14 }} aria-describedby="s5-eyebrow">
        <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
          SEO y Schema.org
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 4 }}>
          Cómo te ve Google y los motores de IA. Activá Schema.org para aparecer en respuestas de ChatGPT y Perplexity.
        </p>
      </div>

      {/* Meta title y description por página */}
      <DividerLabel>Meta title y description</DividerLabel>
      {(Object.keys(PAGE_LABELS) as PageKey[]).map((page) => (
        <SeoCard
          key={page}
          pageName={PAGE_LABELS[page]}
          title={seo.pages[page].title}
          description={seo.pages[page].description}
          onTitleChange={(v) => setPageField(page, "title", v)}
          onDescriptionChange={(v) => setPageField(page, "description", v)}
          onGenerateWithAI={() => generateAI(page)}
        />
      ))}

      {/* Datos estructurados */}
      <div style={{ marginTop: 10 }}>
        <DividerLabel>Datos estructurados</DividerLabel>
        <ToggleRow
          label="Schema.org Hotel"
          sublabel="ChatGPT, Perplexity y Google AI citan hoteles con Schema.org activo."
          badge={{ text: "Alta prioridad", variant: "priority" }}
          checked={seo.schemaOrgEnabled}
          onChange={setSchemaOrg}
        />
        <ToggleRow
          label="GEO · AI Discovery"
          sublabel="Genera llms.txt y FAQs para optimizar la citación por IA."
          badge={{ text: "Recomendado", variant: "recommended" }}
          checked={seo.geoEnabled}
          onChange={setGeo}
        />
      </div>
    </div>
  );
}
