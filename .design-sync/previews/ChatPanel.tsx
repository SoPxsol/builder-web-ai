import { ChatPanel } from "@figma/my-make-file";

export const Panel = () => (
  <div
    style={{
      width: 320,
      height: 520,
      padding: 14,
      background: "#fff",
      border: "0.5px solid var(--border-ui)",
      borderRadius: "var(--radius-card)",
      display: "flex",
    }}
  >
    <ChatPanel articleTitle="Guía de spa y bienestar en Hotel Diplomatic" />
  </div>
);
