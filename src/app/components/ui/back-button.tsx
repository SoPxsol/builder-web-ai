import { ArrowLeft } from "lucide-react";
import type { View } from "../../types";

interface BackButtonProps {
  to: View;
  navigate: (view: View, siteId?: number) => void;
  label?: string;
}

export function BackButton({ to, navigate, label = "Volver" }: BackButtonProps) {
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-70"
      style={{
        width: 28,
        height: 28,
        background: "var(--surface-page)",
        borderRadius: "var(--radius-icon)",
        border: "0.5px solid var(--border-ui)",
        cursor: "pointer",
      }}
      aria-label={label}
    >
      <ArrowLeft size={13} style={{ color: "var(--text-secondary)" }} />
    </button>
  );
}
