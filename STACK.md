# Fleet Control — recommended stack (Aug 2026)

## The short version

```
React 19 + TypeScript + Vite
  UI kit ........ shadcn/ui  (Radix primitives + Tailwind v4)
  Tables ........ TanStack Table  (+ TanStack Virtual for logs)
  Charts ........ Recharts for dashboards, uPlot for hot streams
  Server state .. TanStack Query
  Router ........ TanStack Router (file-based, typed)
  API client .... generated from Spring's OpenAPI spec via orval
  Forms ......... react-hook-form + zod
Backend ......... Spring Boot 3.5 (springdoc-openapi, SSE, WebSocket)
Build ........... Vite -> src/main/resources/static -> one fat JAR
```

## Why shadcn/ui and not the others

You said: *beautiful, no CSS tweaking, Claude adds features fast without breaking
things.* Those three pull in different directions. shadcn/ui is the best
compromise in 2026 for one specific reason: **it is the thing Claude has seen the
most of.** Every model shipped in the last two years was trained on an enormous
volume of shadcn code. When you say "add a command palette with a service
picker," Claude writes it right the first time instead of hallucinating props.

The second reason is architectural. shadcn is not an npm dependency — the
components are *copied into your repo* under `src/components/ui/`. That means:

- No black box. When something looks wrong you can read the 40 lines that made it.
- No version upgrades that silently restyle your app.
- Claude can read a component before modifying it, which is exactly the failure
  mode you're hitting now.

Runners-up and when they'd win:

| Option | Win condition |
|---|---|
| **Mantine v8** | You want *zero* Tailwind classes in markup — styling via props (`<Group gap="md">`). Ships modals manager, notifications, spotlight, charts. Pick this if utility classes bother you. |
| **PrimeReact / Ant Design** | You need enterprise data grids (frozen columns, tree tables, 100k-row virtual scroll) on day one. Harder to make look modern. |
| **HTMX + Thymeleaf** | Only if you want zero Node. Live charts + log tail + API tester get painful. Not recommended for this app. |

## The actual fix for "the AI keeps breaking things"

The framework is the smaller half of your problem. One `app.js` means every
change has the whole file as its blast radius. Four structural changes matter
more than the UI kit:

**1. Feature-sliced folders.** One folder per tab, and features never import from
each other — only from `shared/`.

```
src/
  app/                 router, providers, theme
  features/
    services/          ServicesPage.tsx, ServiceRow.tsx, useServices.ts
    api-tester/
    metrics/
    logs/
    deploys/
  shared/
    api/               generated client (do not hand-edit)
    ui/                shadcn components
    lib/               formatters, hooks
```

Now "add a column to the services table" touches ~2 files and cannot break the
log tailer. That is the single highest-leverage change you can make.

**2. Generate the API client from OpenAPI.** Add `springdoc-openapi` to Spring
Boot, then run `orval` against `/v3/api-docs`. You get typed hooks:

```ts
const { data, isLoading } = useListServices({ cluster: "prod" });
```

If you rename a field in a Java DTO, `tsc` fails at build time instead of the UI
silently rendering `undefined`. This is the thing that stops AI-written regressions
from reaching the browser.

**3. TanStack Query owns all server state.** No `useState` holding server data,
no manual refetch logic, no stale caches. Polling, SSE invalidation, optimistic
toggles (your on/off switches) are all one-liners.

**4. A CLAUDE.md at the repo root.** Tell the model the rules once:

```md
- Components live in features/<feature>/. Never import across features.
- Never hand-edit shared/api/generated/ — regenerate with `npm run api:gen`.
- All server state goes through TanStack Query. No fetch() in components.
- Use shadcn components from shared/ui. Add new ones with `npx shadcn add <name>`.
- Every new tab gets a route in app/routes/ and nothing else global.
- Run `npm run typecheck && npm run test` before claiming done.
```

Pair that with a Playwright smoke test per tab. Claude can then verify its own
work instead of you finding the breakage.

## Wiring it into the JAR

`pom.xml` — run Vite during `prepare-package`:

```xml
<plugin>
  <groupId>com.github.eirslett</groupId>
  <artifactId>frontend-maven-plugin</artifactId>
  <version>1.15.1</version>
  <configuration>
    <workingDirectory>src/main/frontend</workingDirectory>
    <nodeVersion>v22.11.0</nodeVersion>
  </configuration>
  <executions>
    <execution><id>node</id><goals><goal>install-node-and-npm</goal></goals></execution>
    <execution><id>install</id><goals><goal>npm</goal></goals>
      <configuration><arguments>ci</arguments></configuration></execution>
    <execution><id>build</id><phase>prepare-package</phase><goals><goal>npm</goal></goals>
      <configuration><arguments>run build</arguments></configuration></execution>
  </executions>
</plugin>
```

`vite.config.ts`:

```ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { outDir: "../resources/static", emptyOutDir: true },
  server: { proxy: { "/api": "http://localhost:8080" } },   // hot reload in dev
});
```

Then a catch-all so client-side routes survive a hard refresh:

```java
@Controller
class SpaController {
  @GetMapping({"/", "/{path:^(?!api|actuator).*$}/**"})
  String forward() { return "forward:/index.html"; }
}
```

`./mvnw package` → one JAR, one port, one deploy. Dev is `npm run dev` on :5173
proxying to Spring on :8080, so you keep hot module reload.

## Live data plumbing

| Need | Transport | Spring side |
|---|---|---|
| Metrics, stats, task counts | **SSE** | `SseEmitter` or `Flux<ServerSentEvent>` |
| Log tail | **WebSocket** | `@ServerEndpoint` / STOMP, feeding from CloudWatch Logs `StartLiveTail` |
| Everything else | plain REST + TanStack Query | `@RestController` |

Prefer SSE over WebSocket where you can — it survives proxies better, auto-reconnects,
and it's one class on the Spring side.

For the log tab specifically: render with **TanStack Virtual**. A naive log tail
at a few hundred lines/sec will lock the main thread inside a minute; virtualized,
it stays smooth at 5k buffered lines.

## Charts

- **Recharts** for dashboard panels — declarative, composes with shadcn's theming.
- **uPlot** for anything updating faster than ~1 Hz with thousands of points. It's
  tiny (~45 KB) and an order of magnitude faster than SVG charting.
- Skip D3 unless you need a bespoke visualization. It's a drawing library, not a
  chart library, and it's where AI-written code goes to rot.

## Getting started

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm i tailwindcss @tailwindcss/vite
npx shadcn@latest init
npx shadcn@latest add button card table tabs switch badge input select \
                       dialog dropdown-menu tooltip sonner scroll-area separator
npm i @tanstack/react-query @tanstack/react-table @tanstack/react-virtual \
      @tanstack/react-router recharts uplot react-hook-form zod
npm i -D orval
```

That command list is roughly the whole setup. Everything after it is features.
