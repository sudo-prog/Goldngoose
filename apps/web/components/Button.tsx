"use client";
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "sm" | "lg" | "default" | "icon";
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = "default",
  size = "default",
  disabled,
  className,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold";
  const variants: Record<string, string> = {
    default: "bg-[#00ff9f] text-black hover:bg-[#00cc7a]",
    outline: "border border-slate-700 text-white hover:bg-slate-800",
    ghost: "text-white hover:bg-slate-800",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-slate-700 text-white hover:bg-slate-600",
  };
  const sizes: Record<string, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    lg: "h-11 px-8 text-lg",
    icon: "h-10 w-10",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
