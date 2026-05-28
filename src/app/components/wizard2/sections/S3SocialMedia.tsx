import { Facebook, Instagram, Linkedin, MessageCircle, Star } from "lucide-react";
import type { W2Social, W2State } from "../../../types/wizard2";
import { SectionEyebrow } from "../shared/SectionEyebrow";

interface Props {
  state: W2State;
  update: (patch: Partial<W2State>) => void;
}

interface SocialField {
  key: keyof W2Social;
  label: string;
  placeholder: string;
  icon: React.ElementType;
  color: string;
  priority?: string;
}

const FIELDS: SocialField[] = [
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "@hotelplaza",
    icon: Instagram,
    color: "#E4405F",
    priority: "Alta prioridad",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    placeholder: "+54 9 11 0000-0000",
    icon: MessageCircle,
    color: "#25D366",
    priority: "Alta prioridad",
  },
  {
    key: "tripadvisor",
    label: "TripAdvisor",
    placeholder: "URL de tu listing",
    icon: Star,
    color: "#34E0A1",
    priority: "Mejora SEO local",
  },
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "facebook.com/hotelplaza",
    icon: Facebook,
    color: "#1877F2",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "linkedin.com/company/hotelplaza",
    icon: Linkedin,
    color: "#0A66C2",
  },
];

export function S3SocialMedia({ state, update }: Props) {
  const { social } = state;

  function setField(key: keyof W2Social, value: string) {
    update({ social: { ...social, [key]: value } });
  }

  return (
    <div className="flex flex-col" style={{ padding: "20px 24px" }}>
      <SectionEyebrow group="launch" id="s3-eyebrow" />

      <div style={{ marginBottom: 14 }} aria-describedby="s3-eyebrow">
        <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
          Redes sociales
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 4 }}>
          Instagram y WhatsApp son los canales con mayor conversión para hoteles boutique en LATAM.
        </p>
      </div>

      <div className="flex flex-col" style={{ gap: 10 }}>
        {FIELDS.map(({ key, label, placeholder, icon: Icon, color, priority }) => (
          <div key={key} className="flex flex-col" style={{ gap: 4 }}>
            <div className="flex items-center" style={{ gap: 6 }}>
              <Icon size={13} aria-hidden="true" style={{ color, flexShrink: 0 }} />
              <label htmlFor={`s3-${key}`} style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}>
                {label}
              </label>
              {priority && (
                <span
                  style={{
                    fontSize: 9,
                    padding: "1px 6px",
                    borderRadius: 3,
                    background: "var(--wizard-purple-light)",
                    border: "1px solid var(--wizard-purple-border)",
                    color: "var(--wizard-purple-text)",
                  }}
                >
                  {priority}
                </span>
              )}
            </div>
            <input
              id={`s3-${key}`}
              type="text"
              value={social[key]}
              onChange={(e) => setField(key, e.target.value)}
              placeholder={placeholder}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                height: 28,
                padding: "0 8px",
                background: "var(--surface-page)",
                border: "1px solid var(--border-ui)",
                borderRadius: 5,
                fontSize: "var(--font-size-sm)",
                color: "var(--text-primary)",
                outline: "none",
                outlineColor: "var(--accent-info)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
