import { TextField } from "@figma/my-make-file";

export const Default = () => (
  <div style={{ width: 320 }}>
    <TextField id="nombre" label="Nombre del hotel" value="Hotel Diplomatic" onChange={() => {}} />
  </div>
);

export const Required = () => (
  <div style={{ width: 320 }}>
    <TextField id="email" label="Email de contacto" required value="reservas@diplomatic.com" onChange={() => {}} />
  </div>
);

export const WithPlaceholder = () => (
  <div style={{ width: 320 }}>
    <TextField id="tel" label="Teléfono" value="" placeholder="+54 11 5555 5555" onChange={() => {}} />
  </div>
);

export const WithError = () => (
  <div style={{ width: 320 }}>
    <TextField
      id="dominio"
      label="Dominio"
      required
      value="hotel diplomatic"
      onChange={() => {}}
      error="El dominio no puede contener espacios."
    />
  </div>
);
