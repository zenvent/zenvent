# Toolbox mark

An isometric toolbox rendered in CSS 3D — no canvas, no WebGL, no animation
library, no dependencies. Drop this folder into any app.

```
ToolboxLoader.css     the whole thing: geometry, theme tokens, animation states
ToolboxLoader.tsx     React component (the 3D box)
ToolboxMark.tsx       React component (flat SVG glyph, for tiny sizes)
toolbox.html          standalone reference — plain-HTML markup + a playground
icons/                favicon set, plus the page they are rendered from
```

`toolbox.html` is the fastest way in: open it in a browser, click the buttons,
and copy the markup. It has no external references, so it also serves as the
canonical DOM for a non-React app.

## React

```tsx
import { ToolboxLoader } from "./toolbox/ToolboxLoader";

<ToolboxLoader scale={0.165} />                              // topbar, ~32px
<ToolboxLoader scale={0.7} state="loading" label="Loading" /> // full page
<ToolboxLoader scale={0.55} open />                           // empty state
```

| Prop | |
|---|---|
| `scale` | `1` renders a box of roughly 190 × 190 px. Default `1`. |
| `state` | `idle` \| `loading` \| `success` \| `error`. Default `idle`. |
| `open` | Force the lid open (shows the contents). |
| `tap` | One-off click squash. Toggle true; it clears itself. |
| `label` | Accessible name. Say what the app is doing, not "toolbox". |

## Plain HTML

Copy one `.tbx-root` block out of `toolbox.html`, include `ToolboxLoader.css`,
and drive it by setting `data-state` on the root:

```js
el.dataset.state = "loading";   // idle | loading | success | error
el.classList.add("tbx-tap");    // one-off click acknowledgement
```

To fire the same state twice in a row, reset it and force a reflow first —
otherwise the animation never restarts:

```js
el.dataset.state = "idle";
void el.offsetWidth;
el.dataset.state = "success";
```

## Animation states

| State | What happens | Duration |
|---|---|---|
| `idle` | Closed. | — |
| `loading` | Lid opens, three tools rain in from off-screen and land in the tray, lid shuts, repeat. | 2.8s loop |
| `success` | Lid slams and rebounds, box hops, latches flash green, halo pulses. | 0.8s |
| `error` | Box shudders, lid flaps ajar twice, latches flash red. | 0.85s |
| `tap` | Squash-and-stretch, lid winks open and clacks shut. | 0.3s |

The one-shot states carry no `animation-fill-mode`, so they settle back to the
base transform by themselves — clear `state` whenever you like and hover keeps
working meanwhile.

Every state is disabled under `prefers-reduced-motion: reduce`, but the meaning
survives: `loading` still holds the lid open, `idle` still holds it shut.

Hovering is not wired by default. Add it yourself, scoped to `idle` so it cannot
fight a running state:

```css
.brand:hover .tbx-root[data-state="idle"] .tbx-hinge{
  transform:translate3d(0,-40px,-50px) rotateX(112deg);
}
```

## Theming

One token block at the top of `ToolboxLoader.css`, under `.tbx-root` (dark) and
`:root[data-theme="light"] .tbx-root` (light). Retarget that second selector to
whatever your app uses to signal light mode. Swapping the five `--lid-*` values
recolours the whole object; an amber variant is:

```css
--lid-top:#ffbe4d; --lid-recess:#f79e1b; --lid-front:#fb9d1b;
--lid-side:#e08213; --lid-inner:#c26f0d;
```

`ToolboxMark` has its own three tokens with literal fallbacks baked in, so it
renders correctly inside an `<img>`, an email, or anywhere the token block is
absent:

```css
:root { --mark-body:#3a3c41; --mark-lid:#2f76ce; --mark-metal:#fcfcfb; }
.dark { --mark-body:#8e919b; --mark-lid:#3987e5; --mark-metal:#1a1a19; }
```

The body inverts between modes so the glyph keeps contrast on both surfaces;
the lid stays the accent colour.

## Sizing

Scale is most of the design work.

- **0.6 and up** — hero, empty states, login, 404.
- **0.165** — a topbar mark, about 32px. The smallest that still reads.
- **Below ~0.13** — the handle stops resolving. Use `ToolboxMark` instead.
- **Under 24px** — always `ToolboxMark`. A shaded 3D render at 16px is mush.

Size the scene for the **open** state, not the closed one. The lid swings up
well past the closed silhouette and gets guillotined by a tight container:

```css
.brand .tbx-scene{width:38px;height:48px;perspective:900px}
.brand .tbx-ground{display:none}   /* a contact shadow this small is a smudge */
```

## Icons

`icons/` holds a favicon set rendered from the closed 3D box, so the isometric
look carries into the browser tab.

```html
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">
<link rel="icon" type="image/png" sizes="64x64" href="/icons/favicon-64.png">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
```

At 16px a shaded render is a small blue-and-grey blob — identifiable in a tab
strip, but not crisp. If that bothers you, point the 32-and-under sizes at
`favicon.svg` (the flat glyph, which stays sharp) and keep the renders for 48px
and up.

To regenerate after a geometry or colour change, `icons/icon-render.html` is the
source. It pins the lid shut, hides the ground shadow, and brightens the shell a
few steps (`--body-front:#4b4e56` and friends) so the icon still reads against
dark browser chrome — the UI-surface charcoal disappears against a dark tab bar.
Render it headless at `deviceScaleFactor: 8` with `omitBackground: true`, crop to
the alpha bbox, pad to a square with ~8% margin, then downsample with Lanczos to
512 / 180 / 64 / 48 / 32 / 16. The Apple touch icon gets an opaque `#1a1a19`
rounded tile, because iOS does not accept transparency and will paint it black.

## If you edit the geometry

The object is 160 × 80 × 100 in its own space, `y` growing downward, spanning
`y = -40 … +40`. The hinge sits at `(0, -40, -50)` — the top-back edge. The lid
is 30 tall on top of that, and its origin is at world `y = -55`. Everything is
built from one `.tbx-cuboid` primitive you drive with `--w/--h/--d` and place
with `--tx/--ty/--tz`.

Five things that are load-bearing and look arbitrary:

**CSS 3D has no depth buffer.** It sorts *whole elements* by their transformed
centroid. A large floor plane and a small object resting on it sort by their
centres, not by what is physically on top. That is why the tools live in a
`.tbx-tray` wrapper — the group sorts as one unit against the floor, and the
tools only sort among themselves.

**Nested `preserve-3d` sorts as a group.** The cavity and the tools sit *inside*
the shell cuboid for that reason; as siblings they would sort against the whole
box at once and the front wall would paint over everything.

**The tools ride at `y = -26`, near the opening.** At a 30° camera you cannot see
the real floor of an 80-deep box through its opening. Real toolboxes solve this
with a lift-out tray; so does this one.

**The falling animation drives `.tbx-slot`, not the tool.** Each tool's own
transform is a five-function chain, and keyframing a fall would mean restating
all of it every frame. The slot is a 0×0 `preserve-3d` wrapper that only does
`translateY`. The loop's reset uses `steps(1,end)` so the tool jumps back to the
top rather than flying up, scheduled while the lid is closed.

**The latch flash uses `box-shadow`, not `background`.** The six faces of a
cuboid carry different tokens; animating `background` flattens them all to one
colour and the latch loses its shading. `filter` is worse — it flattens
`preserve-3d` and the cuboid collapses entirely.

Also: the stylesheet carries its own `box-sizing` reset (`.tbx-root, .tbx-root *`)
because the cavity rim uses a `border` as wall thickness. Without it the rim
overhangs the box by 6px on every side. Do not remove that line assuming a global
reset covers it.
