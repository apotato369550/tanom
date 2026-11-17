/** Established TANOM sun, field and rain mark, shared across public and tool surfaces. */
export function TanomMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      className="tanom-mark"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 18a14 14 0 0 1 28 0"
        stroke="#B44F13"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M6 25h52M12 34h40M19 43h26"
        stroke="#936B17"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 25v19c0 8-9 9-9 15"
        stroke="#176080"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
