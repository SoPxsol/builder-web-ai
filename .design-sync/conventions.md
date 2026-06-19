# PXSOL Web DS — cómo construir con este sistema

Componentes del CMS hotelero de PXSOL (LATAM, multimarca). React 18. Todo se importa
del bundle: `window.PxsolWebDS.<Componente>` (cada `<Name>.jsx` reexporta desde ahí).

## Setup / wrapping
- **No requiere provider ni theme wrapper.** Los componentes se renderizan directos;
  no hay `ThemeProvider` ni contexto que montar. Solo asegurate de que `styles.css`
  esté cargado (trae los tokens, la fuente Inter y los estilos compilados).
- La fuente de marca es **Inter** (se shippea en `fonts/`); el resto cae a system-ui.

## Idioma de estilado — por PROPS y TOKENS, no por clases propias
Los componentes ya traen su estilo interno (inline styles + custom properties). NO les
pongas clases CSS para reestilarlos: variá su apariencia con sus **props**:
- `Button` → `variant`: `"primary" | "secondary" | "ghost" | "destructive"`, `size`: `"sm" | "md"`,
  más `fullWidth`, `leftIcon`, `rightIcon`. **Solo UNA acción `primary` por pantalla** (es el coral de marca).
- `Badge` → `tone`: `"success" | "info" | "warning" | "neutral" | "destructive"`.
- `TextField` → `label`, `id`, `value`, `onChange(value)`, y `error`, `required`, `placeholder`, `type`.
- `ViewHeader` → `title`, `description`, `eyebrow`, `action` (un nodo: típicamente un `Button` o `Badge`), `backTo`+`navigate`.
- `Toggle` → `checked`, `onChange`, `disabled`. `ConfirmDestructiveDialog` → `open`, `title`, `description`, `onCancel`, `onConfirm`.

Para TU layout/glue alrededor de los componentes, usá los **tokens** del sistema con
`var(--token)` (nunca hex/oklch crudos). Vocabulario real:
- Color de marca / acción primaria: `--brand` (coral).
- Texto: `--text-primary`, `--text-secondary`, `--text-tertiary`.
- Superficie y bordes: `--surface-page`, `--border-ui`.
- Semánticos: `--destructive` (eliminar/irreversible), `--accent-info` (azul: hints, focus de inputs),
  badges `--badge-green-bg` / `--badge-blue-bg` / `--badge-orange-bg` (+ `*-text`).
- Forma y tipografía: `--radius-nav` (6px), `--font-sans`, `--font-size-sm`, `--font-size-md`, `--font-size-xs`.

## Dónde está la verdad
- API exacta de cada componente: su `<Name>.d.ts`. Uso y ejemplos: su `<Name>.prompt.md`.
- Definición de todos los tokens: `styles.css` y su closure (incluye `_ds_bundle.css`). Leelos antes de estilar.

## Ejemplo idiomático
```tsx
const { ViewHeader, Button, Badge, TextField } = window.PxsolWebDS;

function EditarPromocion() {
  return (
    <div style={{ padding: 24, background: "var(--surface-page)" }}>
      <ViewHeader
        eyebrow="Hotel Diplomatic"
        title="Editar promoción"
        description="Configurá la vigencia y las condiciones."
        navigate={() => {}}
        action={<Button variant="primary">Guardar cambios</Button>}
      />
      <div style={{ display: "grid", gap: 16, maxWidth: 420, marginTop: 16 }}>
        <TextField id="nombre" label="Nombre" value="2x1 de invierno" onChange={() => {}} required />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge tone="warning">Borrador</Badge>
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>Sin publicar</span>
        </div>
      </div>
    </div>
  );
}
```
