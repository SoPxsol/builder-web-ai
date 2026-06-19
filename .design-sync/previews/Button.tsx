import { Button } from "@figma/my-make-file";
import { CalendarCheck, Plus, Trash2 } from "lucide-react";

export const Variants = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
    <Button variant="primary">Reservar ahora</Button>
    <Button variant="secondary">Cancelar</Button>
    <Button variant="ghost">Omitir paso</Button>
    <Button variant="destructive">Eliminar sitio</Button>
  </div>
);

export const Sizes = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
    <Button size="sm">Guardar borrador</Button>
    <Button size="md">Publicar cambios</Button>
  </div>
);

export const WithIcons = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
    <Button variant="primary" leftIcon={<CalendarCheck size={15} />}>Reservar</Button>
    <Button variant="secondary" leftIcon={<Plus size={15} />}>Nueva página</Button>
    <Button variant="destructive" leftIcon={<Trash2 size={15} />}>Eliminar</Button>
  </div>
);

export const States = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
    <Button variant="primary">Activo</Button>
    <Button variant="primary" disabled>Deshabilitado</Button>
  </div>
);

export const FullWidth = () => (
  <div style={{ width: 280 }}>
    <Button variant="primary" fullWidth>Confirmar reserva</Button>
  </div>
);
