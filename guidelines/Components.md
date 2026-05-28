---
title: PXSOL Web — Design System / Component Guidelines
version: 1.0.0
date: 2026-05-27
scope: src/app/components/ui/
stack: React + Vite + Tailwind v4 + CSS tokens (theme.css)
---

# PXSOL Web — Component Guidelines

Documento AI-readable del Design System de PXSOL Web.
Single source of truth para agentes de código (Cursor, Claude Code) y para el equipo.

---

## 1. Contrato de colores semánticos

Leer antes de tocar cualquier color. Definido en `src/styles/theme.css`.

| Token | Color | Cuándo usarlo | Nunca usarlo para |
|---|---|---|---|
| `--brand` | coral #e84a2c | CTAs primarios (UN solo botón por pantalla), logo, identidad | texto decorativo, hints, progreso, cualquier cosa que no sea el CTA principal |
| `--accent-info` = `--badge-blue-text` | azul #1a4dcc | hints, links secundarios, focus rings de inputs, selección activa en listas | confirmaciones destructivas, errores |
| `--accent-info-bg` = `--badge-blue-bg` | azul claro | fondo de badges info, highlight de selección | |
| `--status-active` | verde #22c55e | estados completados/positivos, switches on, badge "Activo" | acciones ni CTAs |
| `--badge-orange-text` | naranja #f29e11 | warning / pendiente sin urgencia destructiva ("Borrador", "Próximamente") | errores reales |
| `--destructive` | rojo #d4183d | errores de validación, botones eliminar, mensajes de error | cualquier cosa que no sea error o acción irreversible |

Regla del 10%: `--brand` no debe ocupar más del ~10% de la superficie visible.
Si dudás entre coral y otro color, casi siempre la respuesta correcta es el otro.

---

## 2. Escala tipográfica

Fuente base 12px (html font-size: 16px; --font-size definido en :root como 16px, pero la escala en tokens es en px absolutos).

| Token | Valor | Uso |
|---|---|---|
| `--font-size-xs` | 10px | badges, labels uppercase de sección, error messages |
| `--font-size-sm` | 11px | metadatos secundarios, labels de campos, botones sm |
| `--font-size-base` | 12px | body shell, nav items |
| `--font-size-md` | 13px | labels de botón md, input text, títulos card M |
| `--font-size-lg` | 16px | títulos de sección, nombres de entidad en filas |
| `--font-size-xl` | 20px | view headers principales |
| `--font-size-2xl` | 24px | dashboard welcome h1, métricas grandes |

---

## 3. Radio y espaciado

| Token | Valor | Uso |
|---|---|---|
| `--radius-card` | 8px | cards, paneles, dropdowns |
| `--radius-item` | 7px | items de lista |
| `--radius-nav` | 6px | botones, inputs, searchbars |
| `--radius-icon` | 7px | contenedores de icono cuadrados |
| `--radius-badge` | 13px | badges pill (no se usa en PXSOL, preferimos radius-dot) |
| `--radius-dot` | 4px | badges, chips pequeños, dots de estado |
| `--space-1..5` | 4..20px | padding y gap estándar |

---

## 4. Inventario de componentes UI

### 4.1 Button `src/app/components/ui/button.tsx` — NUEVO

**Propósito:** botón interactivo reutilizable. Reemplaza los `<button style={{...}}>` inline dispersos por todo el codebase.

**API:**

```tsx
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";  // default: "primary"
  size?: "sm" | "md";                                           // default: "md"
  fullWidth?: boolean;                                          // default: false
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  // + todos los atributos nativos de <button> (onClick, disabled, type, aria-*, etc.)
}
```

**Variantes:**

| Variante | Fondo | Texto | Borde | Focus ring | Casos de uso |
|---|---|---|---|---|---|
| `primary` | `--brand` | blanco | ninguno | `--brand` | "Crear sitio", "Guardar cambios", "Continuar →", "Nueva página" |
| `secondary` | `#efefef` | `--text-secondary` | `--border-ui` | `--ring` | "← Atrás", "Cancelar" en dialogs, acciones neutras |
| `ghost` | transparent | `--accent-info` | ninguno | `--accent-info` | "Cancelar" en footers de wizard, "Completar después", "Ver todos →" |
| `destructive` | `--destructive` | `--destructive-foreground` | ninguno | `--destructive` | "Eliminar", "Restaurar versión", "Salir sin guardar" |

**Tamaños:**

| Size | Height | Padding H | Font |
|---|---|---|---|
| `sm` | 28px | 12px | `--font-size-sm` (11px) |
| `md` | 32px | 14px | `--font-size-md` (13px) |

**Comportamiento:**
- `disabled`: opacity 50%, cursor not-allowed (via clase Tailwind)
- hover: opacity 85% (via clase Tailwind)
- focus-visible: outline 2px offset 2px en el color correspondiente a la variante
- Los iconos en `leftIcon`/`rightIcon` deben tener `aria-hidden="true"` — el label del botón provee la descripción

**Do's:**
- Una sola variante `primary` visible por pantalla
- Usar `leftIcon` para iconos de acción (Plus, Pencil) que refuerzan el label
- Pasar `type="submit"` explícitamente cuando el botón está dentro de un `<form>`

**Don'ts:**
- No usar `primary` para acciones secundarias o de cancelación
- No usar `destructive` para "Cancelar" — usar `ghost` o `secondary`
- No hardcodear colores — todos los tokens están disponibles a través de las variantes

**Ejemplo de uso:**
```tsx
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

// Antes (inline, repetido en ~15 archivos):
<button
  className="flex items-center gap-1.5 px-4 h-8 transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
  style={{ background: "var(--brand)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: 500, color: "#fff", border: "none", cursor: "pointer", outlineColor: "var(--brand)" }}
>
  <Plus size={12} /> Nueva página
</button>

// Después:
<Button variant="primary" leftIcon={<Plus size={12} />}>
  Nueva página
</Button>
```

---

### 4.2 Badge `src/app/components/ui/badge.tsx` — NUEVO

**Propósito:** chip de estado inline. Reemplaza los `<span style={{...}}>` de estado dispersos.

**API:**

```tsx
interface BadgeProps {
  tone?: "success" | "info" | "warning" | "neutral" | "destructive";  // default: "neutral"
  children: ReactNode;
  style?: React.CSSProperties;  // para overrides puntuales (height, border)
}
```

**Tones:**

| Tone | Fondo | Texto | Ejemplos de uso |
|---|---|---|---|
| `success` | `--badge-green-bg` | `--badge-green-text` | "Activo", "Publicado", "Actual", "Sitemap activo" |
| `info` | `--badge-blue-bg` | `--badge-blue-text` | "Principal" (página home), selección activa |
| `warning` | `--badge-orange-bg` | `--badge-orange-text` | "Borrador", "Próximamente", "pendiente", "Premium" |
| `neutral` | `--badge-neutral-bg` | `--text-secondary` | "Inactivo", "Preview", estados sin valencia |
| `destructive` | `--badge-red-bg` | `--destructive` | errores en badge (uso raro — preferir alerta en línea) |

**Medidas fijas:**
- height: 18px | padding: 0 8px | font-size: `--font-size-xs` (10px) | font-weight: 500 | border-radius: `--radius-dot` (4px)

**Do's:**
- Usar `tone` para estados del sistema que el usuario lee, no acciona
- Para el badge especial de MisSitiosView ("activo" con fondo #1a1a1a blanco), usar el override `style={{ background: "#1a1a1a", color: "#ffffff" }}` — es un caso de diseño de SiteCard, no un tone genérico

**Don'ts:**
- No usar Badge para acciones — usar Button
- No agregar `onClick` a Badge — no es interactivo

**Ejemplo de uso:**
```tsx
import { Badge } from "./ui/badge";

// Antes:
<span className="px-2 h-[18px] flex items-center" style={{ background: "var(--badge-green-bg)", borderRadius: "var(--radius-dot)", fontSize: "var(--font-size-xs)", fontWeight: 500, color: "var(--badge-green-text)" }}>
  Activo
</span>

// Después:
<Badge tone="success">Activo</Badge>
```

---

### 4.3 TextField `src/app/components/ui/text-field.tsx` — NUEVO

**Propósito:** campo de texto con label, validación inline y accesibilidad. Reemplaza el patrón `Field` interno de `PropiedadesView` y los inputs de los wizards de creación.

**API:**

```tsx
interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;   // recibe el string directamente
  error?: string;                       // activa estado invalid si está presente
  required?: boolean;
  type?: string;                        // default: "text"
  placeholder?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  onBlur?: () => void;
  // + todos los atributos nativos de <input> (autoComplete, maxLength, etc.)
}
```

**Comportamiento de validación:**
- `error` presente → border `--destructive` (1px solid), outline `--destructive`, aria-invalid="true", aria-describedby al mensaje de error, role="alert" en el mensaje
- sin `error` → border `--border-ui` (0.5px solid), outline `--accent-info` (azul) en focus
- `required` → asterisco visual en el label (aria-hidden), atributo required nativo en el input

**Medidas del input:**
- height: 34px | padding: 0 10px | border-radius: `--radius-nav` (6px) | font-size: `--font-size-md` | background: `--surface-page`

**Scope y limitaciones:**
TextField no cubre:
- Input con prefijo (slug con "pxsol.com/") → composición ad-hoc con `<div>` wrapper
- Search embed dentro de header → composición ad-hoc
- `<select>` y `<textarea>` → pendiente como primitivos separados
- Input multilinea → pendiente `TextArea` primitivo

**Do's:**
- Siempre pasar un `id` único por página
- Usar `onBlur` para validación touch (el error aparece al salir del campo)
- El mensaje `error` debe ser conciso y accionable: "El email es obligatorio." no "Error"

**Don'ts:**
- No usar para selects o textareas — esperar los primitivos correspondientes
- No hardcodear el outlineColor — el componente lo maneja por estado

**Ejemplo de uso:**
```tsx
import { TextField } from "./ui/text-field";

// Antes (patrón Field interno de PropiedadesView):
<div>
  <label htmlFor="prop-email" style={labelStyle}>Email</label>
  <input
    id="prop-email" type="email"
    value={form.email}
    onChange={(e) => update("email", e.target.value)}
    onBlur={() => blur("email")}
    aria-invalid={errors.email ? true : undefined}
    aria-describedby={errors.email ? "prop-email-err" : undefined}
    className="focus-visible:outline focus-visible:outline-2"
    style={fieldStyle(!!errors.email)}
  />
  {errors.email && (
    <p id="prop-email-err" className="flex items-center gap-1 mt-1" style={{ fontSize: "var(--font-size-xs)", color: "var(--destructive)" }}>
      <AlertCircle size={10} /> {errors.email}
    </p>
  )}
</div>

// Después:
<TextField
  id="prop-email"
  label="Email"
  type="email"
  inputMode="email"
  value={form.email}
  onChange={(val) => update("email", val)}
  onBlur={() => blur("email")}
  error={errors.email}
/>
```

---

### 4.4 BackButton `src/app/components/ui/back-button.tsx` — EXISTENTE

**API:**
```tsx
interface BackButtonProps {
  to: View;
  navigate: (view: View, siteId?: number) => void;
  label?: string;  // default: "Volver" — anunciado por screen readers
}
```

Botón cuadrado 28×28px con icono ArrowLeft. Usado internamente por `ViewHeader`.
No migrar los call-sites existentes de ViewHeader — ya usa BackButton por composición.

---

### 4.5 ViewHeader `src/app/components/ui/view-header.tsx` — EXISTENTE

**API:**
```tsx
interface ViewHeaderProps {
  backTo?: View;          // si se omite, no se renderiza el BackButton
  backLabel?: string;
  eyebrow?: string;       // texto pequeño sobre el título (nombre del sitio activo)
  title: string;
  description?: string;
  navigate: (view: View, siteId?: number) => void;
  action?: ReactNode;     // área derecha: botón primario, badge, o cualquier nodo
}
```

Header estándar de vista. Layout: `[BackButton] [eyebrow / title / description] | [action]`.
El `action` típicamente es un `<Button variant="primary">` — candidato a migración en sprint 2.

---

### 4.6 ConfirmDestructiveDialog `src/app/components/ui/confirm-destructive-dialog.tsx` — EXISTENTE

**API:**
```tsx
interface ConfirmDestructiveDialogProps {
  open: boolean;
  title: string;
  description?: string;
  resourceName?: string;
  cancelLabel?: string;   // default: "Cancelar"
  confirmLabel?: string;  // default: "Eliminar"
  onCancel: () => void;
  onConfirm: () => void;
}
```

Modal de confirmación destructiva accesible (role="alertdialog", focus trap, Escape, scroll lock).
Los botones internos son candidatos a migración con `<Button>` en sprint 2.

---

## 5. Plan de migración priorizado

Criterio de priorización: impacto por densidad de duplicación + visibilidad del usuario final.
Cada sprint es independiente y no toca lo que el anterior dejó intacto.

### Sprint 1 — Button primary en ViewHeader actions (impacto máximo)

Los call-sites del ViewHeader `action={}` repiten el mismo bloque de 6 líneas ~8 veces.
Es el botón más visible de cada vista y concentra el mayor error de inconsistencia (algunos
tienen outlineColor, otros no; algunos tienen cursor: "pointer", otros no).

**Archivos a migrar (orden de impacto):**

1. `src/app/components/PaginasView.tsx` — línea ~169
   Botón "Nueva página" — `variant="primary" size="md" leftIcon={<Plus size={12} />}`

2. `src/app/components/PopupsView.tsx` — línea ~66
   Botón "Crear pop-up" — `variant="primary" size="md" leftIcon={<Plus size={13} />}`

3. `src/app/components/DashboardView.tsx` — línea ~299, ~343, ~402
   - "Crear Nuevo Sitio" — `variant="primary" size="md"` (el h-9 se logra con `style={{ height: 36 }}` override)
   - "Crear primer sitio" — ídem
   - "Ver todos" (línea ~402) — `variant="secondary" size="sm"` — NO es primary, no usar brand

4. `src/app/components/PropiedadesView.tsx` — línea ~161
   Botón "Guardar cambios" — `variant="primary" size="md"` con lógica de estado saved (el caller maneja el color de fondo saved con `style={{ background: saveState === "saved" ? "var(--status-active)" : undefined }}`)

5. `src/app/components/TemplatesView.tsx` — línea ~234, ~283, ~331
   - "Usar template" (featured) — `variant="primary" size="md" fullWidth`
   - "Usar este template" (template del mes) — `variant="primary" size="md" fullWidth`
   - "Usar" / `$${tpl.price}` (grid cards) — `variant="primary" size="sm" fullWidth`
   - "Preview" (disabled) — `variant="secondary" size="sm" fullWidth disabled`

**Botones estimados en sprint 1: ~14 instancias**

---

### Sprint 2 — Button secondary/ghost en footers de wizard y dialogs

Los footers de WizardFooter y CreationShell tienen botones "Atrás" y "Cancelar" idénticos
entre sí. ExitConfirmDialog y ConfirmDestructiveDialog tienen el mismo par cancel/confirm.

**Archivos a migrar:**

6. `src/app/components/wizard/WizardFooter.tsx` — líneas ~25, ~49, ~68
   - "← Atrás" → `variant="secondary" size="sm"`
   - Skip label ("Completar después") → `variant="ghost" size="sm"` (mantener textDecoration underline — ya lo tiene ghost)
   - "Continuar →" → `variant="primary" size="sm"`

7. `src/app/components/creation/shared/CreationShell.tsx` — líneas ~301, ~329, ~345
   - "Atrás" (con ArrowLeft icon) → `variant="secondary" size="sm" leftIcon={<ArrowLeft size={11}/>}`
   - "Cancelar" → `variant="ghost" size="sm"` (el underline ya está en ghost)
   - CTA principal → `variant="primary" size="sm"`

8. `src/app/components/ui/confirm-destructive-dialog.tsx` — líneas ~104, ~123
   - "Cancelar" → `variant="secondary" size="sm"`
   - Confirm label → `variant="destructive" size="sm"`

9. `src/app/components/creation/shared/ExitConfirmDialog.tsx` — líneas ~63, ~81
   - "Seguir editando" → `variant="secondary" size="sm"`
   - "Salir sin guardar" → `variant="destructive" size="sm"`

**Botones estimados en sprint 2: ~10 instancias**

---

### Sprint 3 — Badge en vistas de listado

Los `<span>` de estado se repiten en PaginasView, PopupsView, SeoGeoView, VersionesView, MisSitiosView.

**Archivos a migrar:**

10. `src/app/components/PaginasView.tsx` — línea ~64, ~50
    - Badge "Publicada" → `<Badge tone="success">Publicada</Badge>`
    - Badge "Borrador" → `<Badge tone="neutral">Borrador</Badge>` (con border override: `style={{ border: "0.5px solid var(--border-ui)" }}`)
    - Badge "Principal" → `<Badge tone="info">Principal</Badge>`

11. `src/app/components/PopupsView.tsx` — línea ~125
    - Badge "Activo" → `<Badge tone="success">Activo</Badge>`
    - Badge "Inactivo" → `<Badge tone="neutral">Inactivo</Badge>`

12. `src/app/components/SeoGeoView.tsx` — líneas ~69, ~50
    - Badge "Activo" → `<Badge tone="success">Activo</Badge>`
    - Badge "Próx." → `<Badge tone="warning">Próx.</Badge>`
    - Badge "✓ Sitemap activo" (en action del ViewHeader) → `<Badge tone="success">✓ Sitemap activo</Badge>` con `style={{ height: 22, fontSize: "var(--font-size-sm)" }}`

13. `src/app/components/VersionesView.tsx` — línea ~75
    - Badge "Actual" → `<Badge tone="success">Actual</Badge>`

14. `src/app/components/MisSitiosView.tsx` — línea ~76
    - Badge "pendiente" → `<Badge tone="warning">pendiente</Badge>`
    - Badge "activo" (fondo oscuro, SiteCard overlay) → mantener inline — el badge oscuro (#1a1a1a) es exclusivo del SiteCard y no corresponde a ningún tone estándar

15. `src/app/components/TemplatesView.tsx` — función TierBadge (~línea 47)
    - TierBadge "Gratis" → `<Badge tone="success">{cfg.label}</Badge>`
    - TierBadge "Premium" → `<Badge tone="warning">{cfg.label}</Badge>`
    - TierBadge "Empresa" → mantener inline — fondo `--text-primary` con texto blanco es un caso de diseño único

**Badges estimados en sprint 3: ~16 instancias**

---

### Sprint 4 — TextField en PropiedadesView y wizards de creación

**Archivos a migrar:**

16. `src/app/components/PropiedadesView.tsx` — función interna `Field` (~línea 118)
    Reemplazar la función interna `Field` por importar `<TextField>`.
    Los 7 campos del formulario (siteName, siteSlug*, tagline, email, phone, address, checkIn, checkOut, currency*, timezone*) migran de a uno.
    *Los campos siteSlug (prefijo pxsol.com/), currency y timezone (select) quedan inline por ser casos especiales.

17. `src/app/components/creation/page/PageStep1Basic.tsx` — inspeccionar y migrar inputs simples
18. `src/app/components/creation/page/PageStep3Seo.tsx` — inspeccionar y migrar inputs de SEO
19. `src/app/components/creation/article/ArticleStep1Content.tsx` — inspeccionar
20. `src/app/components/creation/popup/PopupStep2Config.tsx` — inspeccionar
21. `src/app/components/wizard2/sections/S1Profile.tsx` — inspeccionar
22. `src/app/components/wizard2/sections/S5Seo.tsx` — inspeccionar

**Inputs estimados en sprint 4: ~20 instancias (estimado, requiere inspección de cada archivo)**

---

## 6. Reglas para agentes de código

Cuando un agente (Cursor, Claude Code) trabaja en este repositorio:

1. **Importar siempre desde `./ui/`** para Button, Badge y TextField — nunca reescribir el patrón inline.
   ```tsx
   import { Button } from "@/app/components/ui/button";
   import { Badge } from "@/app/components/ui/badge";
   import { TextField } from "@/app/components/ui/text-field";
   ```

2. **No agregar nuevas clases Tailwind de color** — todos los colores van via `style={{ color: "var(--token)" }}`. Las clases Tailwind solo se usan para estados interactivos (hover, focus-visible, disabled) y layout (flex, grid, gap-*).

3. **Un solo botón `variant="primary"` por sección visible** — si hay dos acciones posibles, una es primary y la otra es secondary o ghost.

4. **El focus ring es siempre outline, nunca box-shadow** — usa `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` más `outlineColor` en style. Box-shadow no respeta border-radius en Safari < 16.

5. **No crear tokens nuevos en componentes** — si un color no existe en theme.css, primero agregarlo ahí siguiendo la nomenclatura LAYER 1 → LAYER 2.

6. **No editar archivos de componentes existentes si no es parte de un sprint de migración aprobado** — el riesgo de regresión es alto sin un test runner activo.

---

## 7. Estructura de la carpeta ui/

```
src/app/components/ui/
├── back-button.tsx           — existente, estable
├── badge.tsx                 — NUEVO v1.0 (sprint 3 migra call-sites)
├── button.tsx                — NUEVO v1.0 (sprint 1 y 2 migran call-sites)
├── confirm-destructive-dialog.tsx  — existente, sprint 2 migra botones internos
├── text-field.tsx            — NUEVO v1.0 (sprint 4 migra call-sites)
└── view-header.tsx           — existente, estable
```

**Próximos primitivos candidatos (no iniciados):**
- `select.tsx` — wrapper de `<select>` con los tokens del proyecto (currency, timezone, idioma)
- `textarea.tsx` — para campos de descripción en wizards
- `icon-button.tsx` — botón cuadrado solo-icono (el patrón 26×26 / 28×28 de PopupsView, VersionesView)
- `search-input.tsx` — el patrón de search con icono embebido (MisSitiosView, TemplatesView)

---

## 8. Contrato de copy y microcopy (UX writing)

Reglas de redacción para todo texto visible del admin (lo que ve el hotelero).
Auditadas y aplicadas en la pasada de copy de 2026-05. Respetar en textos nuevos.

### 8.1 Decisiones canónicas

| Concepto | Canónico | Evitar |
|---|---|---|
| Registro verbal | **Voseo** rioplatense: "Creá", "Gestioná", "Activá", "Elegí", "Pegá", "Guardá" | Tuteo ("Crea", "Gestiona"), peninsular ("Cree", "Configure") |
| Capitalización de botones y títulos | **sentence case**: solo primera letra mayúscula + nombres propios ("Crear nuevo sitio", "Vista previa") | Title Case ("Crear Nuevo Sitio", "Vista Previa") |
| Plantillas de sitio | **"plantilla"** (femenino: "una plantilla", "plantilla activa") | "template" |
| Ventana emergente | **"pop-up" / "pop-ups"** (con guion) | "popup", "popups" |
| Comillas | **tipográficas** `" "` (U+201C / U+201D) | rectas `" "` |
| Acción destructiva | **"Eliminar"** | "Borrar" |
| Guardar | **"Guardar cambios"** (no "Guardar" suelto, salvo falta de espacio) | — |
| Números | formato LATAM **1.000,50** vía `toLocaleString("es-AR")` | `es-MX` / `es-US` (1,000.50) |
| Fechas | **dd/mm/aaaa** | mm/dd/aaaa |
| Énfasis en texto | **peso tipográfico** (fontWeight 600) sobre `--text-primary` | color (azul/coral) en texto no interactivo |

### 8.2 Familias de microcopy (estructura)

- **CTA**: verbo + objeto, máx 3 palabras. "Crear pop-up", "Guardar cambios". Evitar "Continuar"/"Enviar"/"OK" sin contexto.
- **Error de validación**: qué pasó + cómo resolver, en vivo (no en submit). "El email tiene que incluir un @". Nunca culpar al usuario.
- **Empty state**: qué es + por qué está vacío + CTA. "Aún no tenés sitios. Creá tu primer sitio…".
- **Loading**: <2s spinner solo; 2-10s contexto ("Importando desde Booking…").
- **Confirmación destructiva**: qué se elimina + que es irreversible + 2 acciones claras (ver `ConfirmDestructiveDialog`).

### 8.3 Color ≠ énfasis (regla clave)

El **color comunica interacción, no jerarquía**:
- `--accent-info` (azul) → SOLO elementos interactivos (links, hints clickeables: "Ver todos →", "Editar", "Activá Schema.org →").
- Texto que solo necesita destacarse pero NO es clickeable → **negro + `fontWeight: 600`**, nunca color.
- `--brand` (coral) → solo el CTA primario de la pantalla.
- `--destructive` (rojo) → solo errores y eliminar.
