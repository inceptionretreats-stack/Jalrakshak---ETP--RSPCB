import Image from "next/image";

export function DigitalHammerLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/digital-hammer-logo.png"
      alt="Digital Hammerr"
      width={32}
      height={32}
      className={className}
    />
  );
}
