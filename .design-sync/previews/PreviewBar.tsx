import { PreviewBar } from "@figma/my-make-file";

const noop = () => {};

// Vista desktop seleccionada, con el hint de ROI visible.
export const Desktop = () => (
  <div style={{ width: 640, background: "var(--surface-page)" }}>
    <PreviewBar breakpoint="desktop" onChange={noop} roiVisible={true} />
  </div>
);

// Vista tablet seleccionada.
export const Tablet = () => (
  <div style={{ width: 640, background: "var(--surface-page)" }}>
    <PreviewBar breakpoint="tablet" onChange={noop} roiVisible={false} />
  </div>
);

// Vista mobile seleccionada, sin hint de ROI.
export const Mobile = () => (
  <div style={{ width: 640, background: "var(--surface-page)" }}>
    <PreviewBar breakpoint="mobile" onChange={noop} roiVisible={false} />
  </div>
);
