import { AiAssistantPanel } from "@figma/my-make-file";

const noop = () => {};

export const Panel = () => (
  <div style={{ height: 560, display: "flex", justifyContent: "flex-start" }}>
    <AiAssistantPanel onClose={noop} onSubmit={noop} />
  </div>
);
