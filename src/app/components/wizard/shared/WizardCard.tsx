import type { ReactNode } from "react";

interface WizardCardProps {
  children: ReactNode;
  footer?: ReactNode;
}

export function WizardCard({ children, footer }: WizardCardProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ background: "#fff" }}>
      <div className="flex-1 overflow-y-auto">{children}</div>
      {footer && (
        <div
          style={{
            borderTop: "1px solid var(--border-ui)",
            background: "#fff",
            flexShrink: 0,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
