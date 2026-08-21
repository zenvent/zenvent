# Prompt: build the `/next` frontend

> **How to use this**
> Open Claude Code at the root of your Spring Boot repo and paste everything
> below the line. Attach two files alongside it:
> - `index.html` — the Fleet Control design demo (the visual + interaction target)
> - `STACK.md` — the stack writeup
>
> If your repo already has a `CLAUDE.md`, leave it; this prompt tells the agent
> to write a scoped one under the new frontend directory instead.

---

You are adding a **second, parallel frontend** to this Spring Boot application.
It will eventually replace the existing one, but not today. Read this entire
brief before writing any code.

## 1. The hard constraint, stated first

**The existing frontend must keep working, byte for byte, at every commit you
make.** Someone is using it in production right now.

That means:

- Do **not** edit, move, rename, reformat, or delete any existing frontend file
  — `app.js`, the current templates, the current CSS, anything under the current
  static resources directory. Not even to "clean up" or "extract a shared util."
- Do **not** change any existing `@Controller` / `@RestController` method
  signature, route, response shape, or serialization config.
- Do **not** change existing Spring Security rules, session handling, CSRF
  config, or CORS config in a way that alters behavior for the current UI.
- If you believe an existing backend endpoint is wrong or missing something the
  new UI needs, **add a new endpoint** under a new path rather than modifying the
  old one. Note it in your final report.

The new UI is served at **`/next`**. The old UI stays at **`/`**. Both ship in
the same JAR, on the same port, sharing the same session and auth. When the new
UI is feature-complete we flip the default route and delete the old one — that is
a later, separate task.

## 2. Phase 0 — discovery (do this before touching anything)

I have not told you what this app does, because you can find out more reliably
than I can describe it. Before writing any code, produce a written inventory and
show it to me.

Explore the repo and answer, in a file at `docs/next-ui/FEATURE-INVENTORY.md`:

**Backend surface**
- Every HTTP endpoint the current frontend calls: method, path, request shape,
  response shape, auth requirement. Grep the existing JS for `fetch(`,
  `XMLHttpRequest`, `axios`, `$.ajax`, `EventSource`, `new WebSocket`, and form
  actions — do not rely on reading controllers alone, since some may be unused.
- Any streaming endpoints (SSE / WebSocket / STOMP) and what they emit.
- Whether `springdoc-openapi` is already a dependency. If yes, note the spec URL.
- Auth mechanism: session cookie, JWT, basic, SSO? What does the frontend do on
  401?

**Frontend surface**
- Every distinct screen, view, tab, modal, panel, and drawer in the current UI.
- For each one: what it displays, what actions a user can take from it, what
  endpoints it hits, what state it holds, and what refresh/polling behavior it
  has.
- Every piece of global state (anything that outlives a single view).
- Any behavior that would be easy to miss in a rewrite: keyboard shortcuts,
  confirmation dialogs, optimistic updates, retry logic, debouncing, "are you
  sure" guards, permission-gated buttons, empty/error states.

**Build**
- Maven or Gradle? Note the exact wrapper (`./mvnw` vs `./gradlew`), the Java
  version, the Spring Boot version, and where static resources are currently
  served from.

Then, at the end of that file, write a **port plan**: a proposed grouping of the
inventoried features into top-level tabs for the new UI, ordered by how much they
would benefit from the rebuild. Recommend which tab to port first and say why.

**Stop after Phase 0 and show me the inventory and port plan. Do not start
Phase 1 until I approve it.**

## 3. The target design

`index.html` (attached) is a working demo of the design and interaction patterns
I want. Open it, read its source, and treat it as the **specification for look,
density, and behavior** — not as code to copy. It is deliberately written as
vanilla JS in one file; your job is to rebuild those patterns properly as React
components.

What to take from it:

- **Information density.** Dense tables, compact controls, small type, tight
  vertical rhythm. This is an operator tool, not a marketing page. Nothing should
  need scrolling that could fit.
- **The chrome.** Fixed topbar with product mark + environment context + a live
  clock/status indicator on the right. A horizontal tab strip below it with a 2px
  underline on the active tab. Content in a padded scroll region.
- **Card as the unit of layout.** A `card` has a header row (title, muted
  description, right-aligned actions) and a body. Almost everything lives in one.
- **Stat tiles.** A responsive row of tiles at the top of a tab: uppercase muted
  label, large value with a small unit suffix, and either a delta line or a
  sparkline underneath.
- **Tables.** Uppercase muted column headers, hairline row separators, hover
  highlight, tabular-nums monospace for all numeric cells, right-aligned action
  buttons in the last column.
- **Inline controls in table rows.** Toggle switches, `− n +` steppers, mini
  progress bars that change color by threshold. Actions happen in the row, not
  behind a detail page.
- **Status is never color alone.** Every status badge has a dot, a color, *and* a
  word. Same for deltas: arrow glyph plus the number.
- **Optimistic + pending states.** When you flip a switch, the switch immediately
  goes to a distinct "pending" appearance, a toast fires, and the row settles when
  the server confirms. Never a frozen UI waiting on a request.
- **Toasts, bottom-right**, for every mutation — start and finish.
- **Charts** with hover crosshair and a multi-series tooltip, a clickable legend
  that hides/shows series, and value labels at the right end of each line.
- **The log viewer**: monospace, fixed-height scroll region, columns of
  timestamp / source / level / message, level-colored, filter chips for levels, a
  regex filter box, a follow/pause toggle, and a footer with counts and rate.

What to ignore from it: all of its data is fake and its JS architecture is
throwaway. Do not port its chart code, its state handling, or its DOM patching.

## 4. Stack (non-negotiable — this is the point of the exercise)

```
React 19 + TypeScript (strict) + Vite 6
UI ............. shadcn/ui (Radix + Tailwind v4)
Routing ........ TanStack Router, file-based, typed
Server state ... TanStack Query — ALL of it
Tables ......... TanStack Table
Virtualization . TanStack Virtual (mandatory for logs / any list > 200 rows)
Charts ......... Recharts for dashboards; uPlot for any stream faster than 1 Hz
Forms .......... react-hook-form + zod
API client ..... GENERATED from the OpenAPI spec via orval — never hand-written
Icons .......... lucide-react
Toasts ......... sonner
```

Hard rules:

- **No `fetch()` in a component.** Ever. All server access goes through generated
  hooks wrapped in TanStack Query.
- **No hand-written types for API payloads.** If a type describes something that
  crosses the wire, it is generated. If the backend has no OpenAPI spec yet, add
  `springdoc-openapi-starter-webmvc-ui` and generate from `/v3/api-docs` — that is
  an additive backend change and is allowed.
- **No `useState` holding server data.** Client state only: open/closed, selected
  tab, filter text, draft form values.
- **No custom CSS files** beyond the single tokens block. Everything else is
  Tailwind utilities and shadcn variants. If you find yourself writing a
  stylesheet, you have taken a wrong turn.
- **TypeScript strict, no `any`, no `@ts-ignore`.** If a type is fighting you,
  the model is wrong — fix the model.

## 5. Directory layout

Everything new lives under one directory. Nothing outside it changes except the
build file and one new controller.

```
src/main/frontend-next/          ← the entire new app, self-contained
  index.html
  vite.config.ts
  tsconfig.json
  package.json
  CLAUDE.md                      ← rules for future agent runs (you write this)
  src/
    main.tsx
    app/
      router.tsx                 ← TanStack Router, basepath "/next"
      providers.tsx              ← QueryClient, theme, Toaster
      layout/
        AppShell.tsx             ← topbar + tab strip + content region
        TopBar.tsx
        TabNav.tsx
      routes/                    ← one file per tab
    features/
      <feature>/                 ← one folder per tab. See rule below.
        <Feature>Page.tsx
        components/
        hooks/
        types.ts                 ← CLIENT-side types only
    shared/
      api/
        generated/               ← orval output. NEVER hand-edited.
        client.ts                ← the fetch wrapper orval calls (auth, errors)
      ui/                        ← shadcn components, unmodified where possible
      charts/                    ← TimeSeriesChart, StatTile, Sparkline
      lib/                       ← formatters, small hooks, cn()
      hooks/
```

**The import rule, which is the whole point:**

> A file in `features/a/` may import from `shared/` and from its own folder.
> It may **never** import from `features/b/`.

If two features need the same thing, it moves to `shared/`. Enforce this
mechanically with `eslint-plugin-boundaries` (or an equivalent `no-restricted-imports`
rule) and make `npm run lint` fail on violation. This is what stops one tab's
change from breaking another tab.

## 6. Build wiring

Detect Maven vs Gradle from the repo and wire the appropriate one.

**Vite config:**
```ts
export default defineConfig({
  base: "/next/",
  plugins: [react(), tailwindcss(), TanStackRouterVite()],
  build: { outDir: "../resources/static/next", emptyOutDir: true },
  server: { proxy: { "/api": "http://localhost:8080" } },
});
```

Note `outDir` writes into `static/next/` — a *new* subdirectory. It must not
touch anything the current UI serves. Set `emptyOutDir: true` only because that
directory is exclusively ours; verify that before enabling it.

**Maven** — add `frontend-maven-plugin`, bound to `prepare-package`, with
`workingDirectory` = `src/main/frontend-next`. Put it behind a profile that is
active by default but can be skipped with `-DskipFrontend`, so backend-only
builds stay fast.

**Gradle** — same thing with `com.github.node-gradle.node`, a `npmBuild` task
wired into `processResources`.

**One new controller**, and only this:

```java
@Controller
class NextUiController {
  @GetMapping({"/next", "/next/{path:^(?!assets).*$}/**"})
  String forward() { return "forward:/next/index.html"; }
}
```

Add `/next/**` to whatever Spring Security config the existing UI uses, matching
its auth requirements exactly. Do not weaken anything.

**Dev loop:** `npm run dev` in `src/main/frontend-next` serves on :5173 with HMR,
proxying `/api` to Spring on :8080. Document this in the CLAUDE.md you write.

## 7. Design tokens — define once, never again

Create the token block in `src/index.css` using shadcn's `@theme` /
`:root` + `.dark` convention. **Both light and dark are required** — shadcn's
init generates both by default, so this costs nothing extra, and the chart
palette below already ships both. Dark is the default (`<html class="dark">`).

Use these values. They are a validated palette — the categorical series order is
colorblind-safe in both modes and the status colors are deliberately distinct
from the series colors. Do not substitute your own colors.

**Chart series** (assign in this fixed order, never cycle past 8):

| Slot | Light | Dark |
|---|---|---|
| 1 | `#2a78d6` | `#3987e5` |
| 2 | `#eb6834` | `#d95926` |
| 3 | `#1baf7a` | `#199e70` |
| 4 | `#eda100` | `#c98500` |
| 5 | `#e87ba4` | `#d55181` |
| 6 | `#008300` | `#008300` |
| 7 | `#4a3aa7` | `#9085e9` |
| 8 | `#e34948` | `#e66767` |

**Status** (fixed in both modes, reserved — never reuse as a series color):
`good #0ca30c` · `warning #fab219` · `serious #ec835a` · `critical #d03b3b`

**Chart chrome:**

| Role | Light | Dark |
|---|---|---|
| Chart surface | `#fcfcfb` | `#1a1a19` |
| Page plane | `#f9f9f7` | `#0d0d0d` |
| Primary ink | `#0b0b0b` | `#ffffff` |
| Secondary ink | `#52514e` | `#c3c2b7` |
| Muted / axis label | `#898781` | `#898781` |
| Gridline | `#e1e0d9` | `#2c2c2a` |
| Baseline | `#c3c2b7` | `#383835` |
| Border hairline | `rgba(11,11,11,.10)` | `rgba(255,255,255,.10)` |

Charting rules that are not negotiable:

- **Never a dual-axis chart.** Two measures at different scales become two charts.
- Sequential scales are one hue light→dark. Diverging is blue↔red with a gray
  midpoint. Never a rainbow.
- Color follows the entity, not its rank — filtering out a series must not
  repaint the survivors.
- ≥2 series always gets a legend. ≤4 series also gets end-of-line value labels.
- Charts get a hover crosshair and tooltip by default.

Everything else — fonts, radii, spacing, shadows — comes from shadcn defaults.
System sans throughout, `ui-monospace` for numerics and logs, `tabular-nums` on
anything that appears in a column.

## 8. Shared components to build first

Build these once, in `shared/`, before porting any feature. Every tab will use
them, and if they are right the tabs are mostly composition.

| Component | Notes |
|---|---|
| `AppShell` | Topbar + tab nav + scroll region. Tabs are routes, not local state — deep links and browser back must work. |
| `PageHeader` | Title, description, right-aligned action slot. |
| `StatTile` | label / value / unit / optional delta / optional sparkline. |
| `StatTileRow` | Responsive auto-fit grid, min 178px. |
| `DataTable` | TanStack Table wrapper: sorting, column visibility, a filter input, empty state, loading skeleton, and a `dense` variant. |
| `StatusBadge` | Takes a status enum → dot + color + label. Never color alone. |
| `ConfirmButton` | Destructive actions route through this. No bare `confirm()`. |
| `TimeSeriesChart` | Recharts wrapper implementing the crosshair/tooltip/legend/end-label rules above. Takes `series: {name, colorSlot, data}[]`. |
| `Sparkline` | Tiny inline SVG line, no axes. |
| `LogViewer` | Virtualized. Props: source, level filter, regex filter, follow toggle, buffer cap. Must stay smooth at 500 lines/sec. |
| `useSse` / `useLiveQuery` | Hook that opens an SSE connection, reconnects with backoff, and feeds the TanStack Query cache via `setQueryData`. Server state stays in the query cache even when it arrives over a stream. |

## 9. This run's scope

Do exactly this much, then stop:

1. **Phase 0** — the feature inventory and port plan. **Stop and wait for my
   approval.**
2. **Phase 1** — scaffold: directory, build wiring, `/next` controller, security
   entry, tokens, providers, router, AppShell, and the `shared/` components in
   §8 with the real design applied. `/next` should render an empty shell with the
   real tab strip and correct chrome.
3. **Phase 2** — port **exactly one** tab, the one your port plan recommends,
   end to end and feature-complete: every action, every state, every edge case
   from the inventory. It should be genuinely better than the old version, not
   merely equivalent.
4. **Stop.** Write the report described in §11.

**Do not port a second tab in this run.** I want to review the patterns before
they get replicated seven times. Subsequent runs will each do one more tab.

## 10. The CLAUDE.md you must write

At `src/main/frontend-next/CLAUDE.md`, write the rules future runs will follow.
It must cover, at minimum:

```md
- The old UI at / must keep working. Never edit files outside src/main/frontend-next/
  except the build file and NextUiController.
- Features live in src/features/<name>/ and NEVER import from another feature.
  Shared code goes in src/shared/.
- src/shared/api/generated/ is machine-generated. Never hand-edit it.
  Regenerate with `npm run api:gen` after any backend DTO change.
- All server state goes through TanStack Query. No fetch() in components.
  No useState holding server data.
- Use shadcn components from src/shared/ui. Add new ones with `npx shadcn add <name>`.
  Do not write CSS files; use Tailwind utilities.
- Chart colors come from the token palette in src/index.css, assigned by slot
  order. Never invent a color. Never build a dual-axis chart.
- Every mutation is optimistic, fires a toast, and has a pending visual state.
- Every status indicator carries a dot, a color, AND a word.
- Adding a tab: add a route file, add a features/ folder, add it to TabNav. Nothing global.
- Before claiming done: `npm run typecheck && npm run lint && npm run test && npm run e2e`.
```

Adjust and extend it to match what you actually built.

## 11. Definition of done for this run

Do not tell me you are finished until all of these are true, and say explicitly
which ones you verified by running versus by reading:

- [ ] `./mvnw clean package` (or `./gradlew build`) succeeds from a clean tree.
- [ ] The resulting JAR serves the **old** UI at `/` with no visible or
      behavioral change. Verify this — load it and compare against `main`.
- [ ] The same JAR serves the new UI at `/next`, and a hard refresh on a deep
      link like `/next/<tab>` loads correctly rather than 404ing.
- [ ] `npm run typecheck` passes with zero errors, zero `any`, zero `@ts-ignore`.
- [ ] `npm run lint` passes, including the cross-feature import boundary rule.
      Prove the rule works by showing it fail on a deliberate violation, then
      revert that.
- [ ] A Playwright smoke test exists for the ported tab and passes: it loads the
      tab, asserts the primary data renders, exercises the primary mutation, and
      asserts the resulting state.
- [ ] Screenshots of the ported tab in **both light and dark**, attached to your
      report, at 1440px and at 768px wide.
- [ ] `git diff --stat` shows **zero** changes to pre-existing frontend files.
      Paste the output.

## 12. Final report

Give me, in the conversation:

1. The port plan summary and which tab you ported.
2. `git diff --stat`, with an explicit line confirming no existing frontend file
   was touched.
3. Any backend endpoint you added, and why the existing one couldn't serve.
4. Anything in the old UI you could not reproduce, and what you'd need to.
5. Anything in the inventory you were unsure about — guesses you made that I
   should check.
6. The recommended next tab, and roughly what it will take.

## 13. Working style

- **Ask before assuming.** If the inventory turns up something ambiguous — an
  endpoint with no obvious caller, a screen whose purpose isn't clear, an
  undocumented state machine — ask me. A wrong guess compounds across seven tabs.
- **Small commits with real messages.** One commit per meaningful unit, each
  leaving the tree green. Not one giant "port frontend" commit.
- **Read before you write.** Before modifying any file you did not create in this
  session, read it in full.
- **When a type fights you, fix the model, not the type.** `as unknown as Foo` is
  a bug report about the design.
- **Don't gold-plate.** No animation libraries, no state machine libraries, no
  micro-frontends, no abstraction with exactly one caller. The stack in §4 is the
  whole stack.
