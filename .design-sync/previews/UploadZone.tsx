import { UploadZone } from "@figma/my-make-file";

const noop = () => {};

// Estado vacío: invita a arrastrar/subir la foto de portada.
export const FotoVacia = () => (
  <div style={{ width: 360, padding: 16, background: "#fff" }}>
    <UploadZone state="empty" type="photo" onUpload={noop} />
  </div>
);

// Logo aún sin cargar.
export const LogoVacio = () => (
  <div style={{ width: 360, padding: 16, background: "#fff" }}>
    <UploadZone state="empty" type="logo" onUpload={noop} />
  </div>
);

// Foto de ejemplo activa (placeholder ámbar).
export const FotoPlaceholder = () => (
  <div style={{ width: 360, padding: 16, background: "#fff" }}>
    <UploadZone state="placeholder" type="photo" onUpload={noop} />
  </div>
);

// Confirmación: logo cargado correctamente.
export const LogoCargado = () => (
  <div style={{ width: 360, padding: 16, background: "#fff" }}>
    <UploadZone state="loaded" type="logo" onUpload={noop} />
  </div>
);
