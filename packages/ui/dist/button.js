import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "./lib/utils";
const variantClasses = {
    default: "bg-polybloom-neon text-polybloom-dark hover:bg-polybloom-neon/90 font-semibold",
    outline: "border border-slate-700 bg-transparent hover:bg-slate-800 text-white",
    ghost: "hover:bg-slate-800 text-white",
    secondary: "bg-slate-700 text-white hover:bg-slate-600",
};
const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 rounded-md text-sm",
    lg: "h-11 px-8 rounded-md text-lg",
    icon: "h-10 w-10 rounded-md",
};
const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => (_jsx("button", { className: cn("inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-polybloom-neon disabled:opacity-50 disabled:cursor-not-allowed", variantClasses[variant], sizeClasses[size], className), ref: ref, ...props })));
Button.displayName = "Button";
export { Button };
//# sourceMappingURL=button.js.map