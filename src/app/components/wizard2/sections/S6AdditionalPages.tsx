import {
  Calendar,
  Newspaper,
  Sparkles,
  Tag,
  TreePalm,
  type LucideIcon,
} from "lucide-react";
import type { W2AdditionalPages, W2State } from "../../../types/wizard2";
import { SectionEyebrow } from "../shared/SectionEyebrow";
import { PageCard } from "../shared/PageCard";

interface Props {
  state: W2State;
  update: (patch: Partial<W2State>) => void;
}

interface PageConfig {
  key: keyof W2AdditionalPages;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  variant: "recommended" | "optional";
  timing: string;
}

const PAGES: PageConfig[] = [
  {
    key: "experiencias",
    label: "Experiencias",
    sublabel: "Tours, actividades y servicios únicos del hotel. Mayor tiempo de permanencia.",
    icon: Sparkles,
    variant: "recommended",
    timing: "Mes 1",
  },
  {
    key: "blog",
    label: "Blog",
    sublabel: "Notas sobre la zona, recomendaciones y SEO orgánico de largo plazo.",
    icon: Newspaper,
    variant: "recommended",
    timing: "Mes 2-3",
  },
  {
    key: "promociones",
    label: "Promociones",
    sublabel: "Ofertas, paquetes y descuentos por temporada.",
    icon: Tag,
    variant: "recommended",
    timing: "Temporada alta",
  },
  {
    key: "spa",
    label: "Spa & Wellness",
    sublabel: "Si tu hotel tiene spa, masajes o piscina temperada.",
    icon: TreePalm,
    variant: "optional",
    timing: "Si aplica",
  },
  {
    key: "eventos",
    label: "Eventos",
    sublabel: "Salones, bodas, corporativo, capacidad y catering.",
    icon: Calendar,
    variant: "optional",
    timing: "Si aplica",
  },
];

export function S6AdditionalPages({ state, update }: Props) {
  const { additionalPages } = state;

  function toggle(key: keyof W2AdditionalPages, value: boolean) {
    update({ additionalPages: { ...additionalPages, [key]: value } });
  }

  return (
    <div className="flex flex-col" style={{ padding: "20px 24px" }}>
      <SectionEyebrow group="grow" id="s6-eyebrow" />

      <div style={{ marginBottom: 14 }} aria-describedby="s6-eyebrow">
        <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
          Páginas adicionales
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 4 }}>
          Activá las páginas que necesite tu hotel. Cada una mejora tu posición en buscadores.
        </p>
      </div>

      <div className="flex flex-col">
        {PAGES.map((page) => (
          <PageCard
            key={page.key}
            icon={page.icon}
            label={page.label}
            sublabel={page.sublabel}
            badgeVariant={page.variant}
            timing={page.timing}
            checked={additionalPages[page.key]}
            onChange={(v) => toggle(page.key, v)}
          />
        ))}
      </div>
    </div>
  );
}
