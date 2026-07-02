import { DigitalHammerLogo } from "./digital-hammer-logo";

export function DevWatermark() {
  return (
    <a
      href="https://digitalhammerr.com/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Digital Hammerr — visit digitalhammerr.com"
      className="fixed bottom-2.5 right-2.5 z-[60] flex cursor-pointer select-none items-center gap-0 rounded-full border border-black/10 bg-white/85 p-1 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition-opacity duration-300 hover:opacity-100 sm:bottom-3 sm:right-3 sm:gap-2 sm:py-1 sm:pl-1 sm:pr-3 sm:opacity-85"
    >
      <DigitalHammerLogo className="h-7 w-7 shrink-0 rounded-full sm:h-8 sm:w-8" />
      <div className="hidden leading-tight sm:block">
        <p className="text-[11px] font-bold tracking-tight text-slate-800">Digital Hammerr</p>
      </div>
    </a>
  );
}
