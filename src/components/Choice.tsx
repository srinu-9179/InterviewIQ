import { type ReactNode } from "react";

interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function Chip({ active, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full border border-primary bg-primary text-primary-foreground px-4 py-1.5 text-xs font-medium transition-all"
          : "rounded-full border border-border bg-secondary text-foreground/80 px-4 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:text-foreground"
      }
    >
      {children}
    </button>
  );
}

interface ChoiceProps {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function ChoiceButton({ active, onClick, children }: ChoiceProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-lg border border-primary bg-primary/5 px-4 py-3 text-sm font-medium text-primary ring-1 ring-primary transition-all"
          : "rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
      }
    >
      {children}
    </button>
  );
}
