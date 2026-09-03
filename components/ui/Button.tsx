"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-primary text-white shadow-sm",
        variant === "secondary" && "border border-border bg-card text-text",
        variant === "ghost" && "text-muted hover:bg-border/30",
        variant === "danger" && "border border-red-200 bg-red-50 text-red-700",
        className,
      )}
      {...props}
    />
  );
}
