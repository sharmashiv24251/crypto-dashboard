import * as React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "lg";
  round?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  round = false,
  className,
  ...props
}) => {
  const baseStyles =
    "font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none cursor-pointer";

  const variants: Record<string, string> = {
    primary: "bg-accent text-text-black hover:bg-accent/90 focus:ring-accent",
    secondary:
      "bg-surface text-text-default hover:bg-surface-contrast focus:ring-surface-contrast",
    outline:
      "border border-accent text-accent bg-transparent hover:bg-accent/10 focus:ring-accent",
  };

  const sizes: Record<string, string> = {
    sm: "py-1.5 px-[10px] text-[13px]",
    lg: "py-2 px-3 text-sm",
  };

  const radius = round ? "rounded-full" : "rounded-lg";

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        radius,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
