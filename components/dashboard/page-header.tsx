import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</span>
        )}
        <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-balance break-words text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
