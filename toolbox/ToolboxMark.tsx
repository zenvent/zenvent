/**
 * ToolboxMark — the Fleet Control brand glyph.
 *
 * Pure SVG, no dependencies. Use this everywhere the mark appears at UI scale:
 * topbar, favicon, tab icons, empty-state headers, the login screen.
 * For the large animated version see <ToolboxLoader />.
 *
 * Colours come from CSS custom properties so the mark follows the theme,
 * with literals as fallbacks so it still renders correctly in an <img>,
 * an email, or anywhere the token block is not present.
 *
 *   :root        { --mark-body:#3a3c41; --mark-lid:#2f76ce; --mark-metal:#fcfcfb }
 *   .dark        { --mark-body:#8e919b; --mark-lid:#3987e5; --mark-metal:#1a1a19 }
 */
export interface ToolboxMarkProps extends React.SVGProps<SVGSVGElement> {
  /** Rendered size in px, width and height. Default 24. */
  size?: number;
  /** Accessible name. Omit for a decorative mark sitting next to a wordmark. */
  title?: string;
}

export function ToolboxMark({ size = 24, title, ...rest }: ToolboxMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {/* handle */}
      <path
        d="M11 9.5V7.4A2.4 2.4 0 0 1 13.4 5h5.2A2.4 2.4 0 0 1 21 7.4v2.1"
        fill="none"
        stroke="var(--mark-body, #3a3c41)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* body */}
      <path
        d="M3 17h26v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        fill="var(--mark-body, #3a3c41)"
      />
      {/* lid */}
      <rect x="3" y="9.5" width="26" height="7.5" rx="1.6" fill="var(--mark-lid, #2f76ce)" />
      {/* clasp */}
      <rect x="12.6" y="15" width="6.8" height="4" rx="1.4" fill="var(--mark-metal, #fcfcfb)" />
    </svg>
  );
}

export default ToolboxMark;
