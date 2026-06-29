export function DigitalHammerLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Digital Hammer">
      {/* light circle background */}
      <circle cx="50" cy="50" r="50" fill="#ececec" />
      {/* red "D" crescent on the right */}
      <path d="M54 23 A27 27 0 0 1 54 77 L54 62 A12.5 12.5 0 0 0 54 38 Z" fill="#a31d22" />
      {/* hammer */}
      <g fill="#141414">
        {/* claw lobe (left) */}
        <path d="M25 23.5 C14 23 8 27 8.5 31 C9 35 15 38 25 37.5 Z" />
        {/* head */}
        <rect x="22" y="23.5" width="33" height="14" rx="6" />
        {/* handle */}
        <rect x="34" y="33" width="12" height="46" rx="5" />
      </g>
      {/* top-centre notch */}
      <circle cx="44" cy="23.5" r="3.8" fill="#ececec" />
    </svg>
  );
}
