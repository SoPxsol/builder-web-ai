# Re-sync del Design System a Claude Design

Cómo actualizar el proyecto **"PXSOL Builder Web"** en Claude Design después de
desarrollar/cambiar componentes. **No es automático**: hay dos mitades.

| Mitad | Quién la corre | Automatizable |
|---|---|---|
| **Build** del bundle (`ds-bundle/`) | GitHub Action en cada push a `main` (`.github/workflows/ds-build.yml`) | ✅ Sí (ya está) |
| **Subida** a Claude Design | Una sesión de Claude Code con tu login de claude.ai | ❌ No (necesita auth interactiva; no hay API con token) |

El CI ya valida y publica el bundle como artefacto en cada push. Lo que sigue es
la mitad manual: subir ese bundle a Claude Design.

---

## Datos fijos

- **projectId:** `a474608c-586f-457d-8f81-83a0848e21d0` ("PXSOL Builder Web", owner Sofia).
  **NO** confundir con "Desing System PXSOL HOTELES WEB" (de Tonga).
- **Bundle (localDir):** `ds-bundle/`
- **Toolchain:** `.ds-sync/` · **Durable set:** `.design-sync/` (config, previews, fuente, convenciones).

## Paso 1 — Generar el bundle

Opción rápida: descargar el artefacto `ds-bundle` de la última corrida del Action y
descomprimirlo en `ds-bundle/`.

O buildear localmente (entorno; el `npm ci` prunea el stub, por eso se recrea):

```bash
npm ci
npm install --no-save @types/react@19.2.17
mkdir -p node_modules/@figma/my-make-file
cp package.json node_modules/@figma/my-make-file/package.json
cp .design-sync/stub/tokens.css node_modules/@figma/my-make-file/tokens.css
( cd .ds-sync && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci )

# build (sin captura):
node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --out ./ds-bundle
```

Para autorar/validar previews nuevos hace falta además la captura (necesita playwright
+ chromium): `cd .ds-sync && npm ci` (sin el skip) y luego
`node .ds-sync/package-capture.mjs --out ./ds-bundle --components <Nombres>`
→ revisar `ds-bundle/_screenshots/review/<group>__<Name>.png`.

## Paso 2 — Subir a Claude Design (en una sesión de Claude Code)

Pedile al agente: **"resync del DS del Builder a Claude Design"**. El flujo con la
herramienta `DesignSync` es:

1. `get_project` al projectId → confirmar name "PXSOL Builder Web" / owner Sofia (no Tonga).
2. `finalize_plan` con `localDir: ds-bundle` y `writes`:
   ```
   ["README.md","_ds_bundle.js","_ds_bundle.css","styles.css","_ds_sync.json",
    "components/**","_preview/**","_vendor/**","fonts/**"]
   ```
   y `deletes: []`. (Sofía aprueba el permiso.)
3. `write_files` con cada archivo `{path, localPath}` (mismos paths; máx 256/llamada
   → partir en tandas). Subir todo lo de `ds-bundle/` **menos** `_screenshots/` y
   `_ds_needs_recompile`. Son ~469 archivos (368 de componentes + 92 previews +
   vendor + fuente + bundle/css/README/sync).
4. `list_files` para verificar (deben estar los 92 `_preview/*.js`).

Solo escritura, sin borrados: los componentes y paths son los mismos; las previews
nuevas se agregan. Si más adelante se ELIMINA un componente, ahí sí incluir su path
en `deletes`.

## Notas

- `config.json` usa paths **relativos** (`../../../src/app`, `../../../.design-sync/fonts/inter.css`)
  para que el build corra igual en local y en el runner Linux del CI. No volver a poner paths absolutos.
- `overrides.cardMode: "column"` para los componentes anchos (barras/wizards): SeoCard,
  StepBar, ToggleRow, UploadZone, WizardCard, StepTrail, WizardFooter, StepTrailW2,
  BuilderToolbar, Canvas.
- `componentSrcMap: { "App": null }` excluye `App.tsx` (sin eso da 93, no 92).
- Stub versionado en `.design-sync/stub/tokens.css` (CSS compilado de tailwind, 25 KB).
- Fix necesario para el bundle: `src/app/types/article.ts` usa escapes `[̀-ͯ]`
  en el slugify (no los combinantes literales, que rompen el encoding del bundle).
