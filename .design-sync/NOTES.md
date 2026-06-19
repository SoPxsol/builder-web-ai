# design-sync NOTES — @figma/my-make-file (PXSOL Web Builder)

Repo-specific gotchas for future syncs. One bullet per quirk.

## Setup / build
- This repo is a **Figma Make export app**, NOT a published component library: `private: true`, no `module`/`main`/`exports`, build is `vite build` (app bundle, no `.d.ts` lib entry). The converter runs in **synth-entry mode** from `src/app`.
- Package manager: lockfile is `package-lock.json` → **`npm ci`** (NOT pnpm, despite a stray `pnpm-workspace.yaml`; there is no `pnpm-lock.yaml`).
- **Self-package stub is required.** The package never self-installs into `node_modules`, so `exportedNames(PKG_DIR)` crashes on a missing `package.json`. Before building, recreate the stub:
  `mkdir -p node_modules/@figma/my-make-file && cp package.json node_modules/@figma/my-make-file/package.json`
  Also copy the compiled CSS there (see below). NOTE: any `npm install` PRUNES this stub (extraneous package) — recreate it AFTER any npm run.
- **@types/react** must be in the repo `node_modules` for prop extraction (`[DTS_REACT]` otherwise). Install without touching the lockfile: `npm i --no-save @types/react` (then recreate the stub, since npm prunes it).
- `cfg.srcDir` is **absolute** and points at `src/app` (not `src`): this excludes `src/main.tsx` (which imports `index.css` → `tailwind.css`, and esbuild can't resolve the Tailwind v4 `@import 'tailwindcss'` → build fails) and `src/styles`. All real components live under `src/app`.
- **CSS / tokens:** `cfg.cssEntry = "tokens.css"` is **relative to PKG_DIR (the stub)** — the file must live INSIDE the stub dir. It is a copy of the compiled app stylesheet (`dist/assets/index-*.css`, ~25KB: theme.css tokens + tree-shaken Tailwind utilities). Regenerate each sync: `npm run build` then `cp dist/assets/index-*.css node_modules/@figma/my-make-file/tokens.css` (a stable copy also lives at `.design-sync/tokens.css`). The `cssEntry` bound is PKG_DIR, unlike `extraFonts` (bounded to workspace root), so they resolve differently — keep cssEntry inside the stub.
- `--node-modules ./node_modules` (repo's own; react 18.3.1 + lucide-react live there). Playwright pinned to **1.60.0** to match the cached chromium build 1223 (`~/.cache/ms-playwright/chromium-1223`); installed in `.ds-sync`.

## Source fix applied (committed change to repo)
- `src/app/types/article.ts` `slugify()`: the diacritics char-class `/[̀-ͯ]/g` used **literal combining-mark characters**. esbuild emits them as raw UTF-8 bytes; served without `charset=utf-8` the browser reads them as latin-1 → `SyntaxError: Range out of order` that **crashed the entire bundle** (all exports lost). Rewritten to ASCII escapes `/[̀-ͯ]/g` (semantically identical). This is a latent encoding bug in the app, not just a sync artifact.

## Fonts
- The CSS references **Inter** but the repo never shipped it. We ship the public OFL variable woff2 (`@fontsource-variable/inter`) via `cfg.extraFonts` → `.design-sync/fonts/inter.css` + `inter-latin-wght-normal.woff2` (absolute path; `extraFonts` is bounded to the workspace root, so absolute repo paths work).

## Scope decision (Sofía, 2026-06-18)
- User chose to sync **the whole repo (~92 components)** despite the recommendation to sync only the `ui/` primitives. ~49 app screens (Views, builder/, wizard/) ship the floor card — they need providers/data/hooks that don't exist statically. That is inherent to importing an app, not a bug. All 92 are fully importable regardless.
- Authored rich previews for **30** components (primitives + the panels/views that render real content). `App` is excluded via `componentSrcMap` (app root, not a DS component).

## Component API quick-ref (from source; for re-authoring previews)
- **Self-styling, no provider needed.** Import from `@figma/my-make-file` (resolves to `window.PxsolWebDS`); lucide-react icons work in previews.
- Button: `variant primary|secondary|ghost|destructive`, `size sm|md`, `leftIcon/rightIcon`, `fullWidth`. Badge: `tone success|info|warning|neutral|destructive`. TextField: controlled `label,id,value,onChange(v),error,required`. ViewHeader: `title,eyebrow,description,backTo+navigate,action`.
- ToggleRow: `label,sublabel,badge?{text,variant priority|recommended},checked,onChange`. ChecklistItem: `badge required|recommended`. SectionEyebrow: `group launch|grow` (no children). SeoCard: `pageName,title,description,onGenerateWithAI`. StepBar: `steps[],activeIndex`. WizardFooter: `onNext,onBack?,nextDisabled?` (no onBack → no Back button). StepTrail: only `currentStep 1..5` (labels hardcoded). StepTrailW2: `currentSection,completedSections:Set,onNavigate`. UploadZone: `state empty|placeholder|loaded,type logo|photo`. PreviewBar: `breakpoint,onChange,roiVisible`. PageCard: `icon(Lucide),label,badgeVariant,timing,checked,onChange`. WizardCard: `children,footer?` — needs a fixed-height wrapper to anchor footer. PolicyAccordion: controlled `isOpen` (renders open statically). ColorPicker: native `<input type=color>`, `label,value,onChange,hint`. CommercialCalendarCard: accepts `today?:Date` — inject a fixed date for deterministic events. SetupProgressCard: `draft.completedSections:Set` drives variants.
- **Wide/full-width components** (SeoCard, StepBar, ToggleRow, UploadZone, WizardCard, StepTrail, WizardFooter, StepTrailW2) need `cfg.overrides.<Name>.cardMode = "column"` or they crop in the product grid (`[GRID_OVERFLOW]`). Already set.

## Deferred (richer preview needs a SOURCE change)
- **AsesorPanel** and **AddModulePicker** use progressive disclosure with internal `open` state and NO prop to start open, so a static screenshot only shows the collapsed/resting state. Shipped as honest resting-state cards. To capture the expanded state, add `defaultOpen?: boolean` to each component's source (AddModulePicker `open`, AsesorPanel `open`) — a small, behavior-preserving enhancement for a future pass.

## Known render warns (triaged — not new on re-sync)
- `[GRID_OVERFLOW]` on the 8 wide components above is resolved by `cardMode: "column"` — should not reappear.
- ~49 components show the typographic floor card by design (unauthored app screens). Not failures.

## Re-sync risks (what can silently go stale)
- The **self-package stub** (`node_modules/@figma/my-make-file/{package.json,tokens.css}`) is gitignored and pruned by any `npm install`. A re-sync MUST recreate it (package.json copy + recompiled tokens.css) before running the converter, or build crashes / ships unstyled.
- `tokens.css` is a **content copy of the compiled app CSS** — if `src/styles/theme.css` or the app's Tailwind usage changes, re-run `npm run build` and re-copy, or tokens drift from the live app.
- The `article.ts` slugify fix must persist — if the repo is re-pulled/overwritten and reverts to literal combining marks, the bundle breaks again.
- Playwright/chromium version pinning (1.60.0 ↔ chromium-1223) is environment-specific; another machine may need a different pin (match the cached build).
