import type { ComponentProps } from "react";

type Variant = "primary" | "secondary";

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-teal-600 to-teal-700 text-white shadow-md shadow-teal-700/20 hover:from-teal-500 hover:to-teal-600 active:shadow-sm",
  secondary:
    "border border-border bg-white/90 text-foreground shadow-sm hover:border-teal-200 hover:bg-teal-50/50",
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
