import { DiscoveryView } from "@figma/my-make-file";

const noop = () => {};

export const Canonical = () => (
  <div style={{ height: 640, display: "flex", background: "var(--surface-page)" }}>
    <DiscoveryView siteName="Hotel Diplomatic" navigate={noop} />
  </div>
);
