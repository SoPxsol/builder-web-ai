import { AiView } from "@figma/my-make-file";

const noop = () => {};

export const Pantalla = () => (
  <div style={{ width: 900, height: 620, display: "flex" }}>
    <AiView siteName="Hotel Diplomatic" navigate={noop} />
  </div>
);
