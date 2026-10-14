import type { ComponentProps } from "react";

type Variant = "primary" | "secondary";

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-teal-700",
  secondary:
    "border border-border bg-card text-foreground hover:bg-slate-50",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
