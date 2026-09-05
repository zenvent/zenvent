import "./ToolboxLoader.css";

/**
 * ToolboxLoader — the Fleet Control mark rendered in CSS 3D.
 *
 * Where to use it:
 *   - the topbar, at scale 0.165, mirroring what the app is doing
 *   - full-page / first-paint loading
 *   - empty states ("no services yet", "no deploys in this range")
 *   - the login screen and the 404 page
 *
 * Where NOT to use it: anywhere under ~24px. Use <ToolboxMark /> there —
 * below about scale 0.13 the handle stops reading.
 *
 * States (see ToolboxLoader.css):
 *   idle      closed; opens on hover if the host styles that
 *   loading   lid open, tools rain in from off-screen, lid shuts, repeat
 *   success   lid slams, box hops, latches flash green, halo pulses
 *   error     box shudders, lid flaps ajar, latches flash red
 *
 * `tap` is a one-off click acknowledgement, not a resting state, so it is a
 * transient class rather than a value of `state`.
 *
 * The one-shot states carry no animation-fill-mode: they settle back to the
 * base transform on their own, so the caller only has to clear `state` when
 * it feels like it, and hover keeps working in the meantime.
 */
export type ToolboxState = "idle" | "loading" | "success" | "error";

export interface ToolboxLoaderProps {
  /** Scale factor. 1 renders at roughly 190 x 190 px of box. Default 1. */
  scale?: number;
  /** What the app is doing. Default "idle". */
  state?: ToolboxState;
  /** Force the lid open — for empty states that want to show the contents. */
  open?: boolean;
  /** Play a one-off squash. Toggle it true on click; it clears itself. */
  tap?: boolean;
  /** Accessible label. Say what the app is doing ("Loading services"), not "toolbox". */
  label?: string;
  className?: string;
}

const FACES = ["fr", "bk", "lf", "rt", "tp", "bm"] as const;

/** Six faces of a box. The parent element carries the dimensions. */
function Faces() {
  return (
    <>
      {FACES.map((f) => (
        <i key={f} className={`tbx-${f}`} />
      ))}
    </>
  );
}

/** A tool in a slot. The slot only translates vertically, which is what the
 *  falling animation drives — the tool keeps its own placement transform. */
function Tool({ kind }: { kind: "ruler" | "screwdriver" | "wrench" }) {
  return (
    <div className="tbx-slot">
      <div className={`tbx-tool tbx-${kind}`} />
    </div>
  );
}

export function ToolboxLoader({
  scale = 1,
  state = "idle",
  open,
  tap = false,
  label,
  className,
}: ToolboxLoaderProps) {
  return (
    <div
      className={`tbx-root ${tap ? "tbx-tap" : ""} ${className ?? ""}`}
      data-state={state}
      style={{ ["--u" as string]: scale }}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-live={state === "loading" ? "polite" : undefined}
    >
      <div className="tbx-halo" />
      <div className="tbx-scene">
        <div className="tbx-pivot">
          <div className="tbx-ground" />

          <div className={`tbx-toolbox ${open ? "tbx-open" : ""}`}>
            {/* shell, with the cavity and contents inside its 3D context so
                they z-sort against the walls rather than as a separate group */}
            <div className="tbx-cuboid tbx-body">
              <Faces />
              <div className="tbx-plane tbx-cav-back" />
              <div className="tbx-plane tbx-cav-floor" />
              <div className="tbx-plane tbx-shelf" />
              <div className="tbx-tray">
                {/* order matters: the fall stagger keys off :nth-of-type */}
                <Tool kind="ruler" />
                <Tool kind="screwdriver" />
                <Tool kind="wrench" />
              </div>
              <div className="tbx-plane tbx-rim" />
            </div>

            <div className="tbx-hinge">
              <div className="tbx-lid">
                <div className="tbx-cuboid tbx-lid-shell"><Faces /></div>
                <div className="tbx-cuboid tbx-h-leg" style={{ ["--tx" as string]: "-32px", ["--ty" as string]: "-25px" }}><Faces /></div>
                <div className="tbx-cuboid tbx-h-leg" style={{ ["--tx" as string]: "32px", ["--ty" as string]: "-25px" }}><Faces /></div>
                <div className="tbx-cuboid tbx-h-bar" style={{ ["--ty" as string]: "-41px" }}><Faces /></div>
                {/* Latches ride WITH the lid, the way a moulded plastic clip does:
                    the tab hangs off the lid and hooks a catch on the base.
                    --ty is lid-local, and the lid origin sits at world y -55,
                    so 21 here is the same world position as -34 was. */}
                <div className="tbx-cuboid tbx-latch" style={{ ["--tx" as string]: "-42px", ["--ty" as string]: "21px", ["--tz" as string]: "52px" }}><Faces /></div>
                <div className="tbx-cuboid tbx-latch" style={{ ["--tx" as string]: "42px", ["--ty" as string]: "21px", ["--tz" as string]: "52px" }}><Faces /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ToolboxLoader;
