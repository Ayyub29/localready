import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button">;

export function Button({ className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`min-h-11 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
