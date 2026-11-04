import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-bone-100 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "text-[13px] px-3 py-1.5 gap-1.5 min-h-[32px]",
    md: "text-[15px] px-4 py-2 gap-2 min-h-[40px]",
    lg: "text-[15px] px-5 py-2.5 gap-2.5 min-h-[44px]",
  };

  const variantStyles = {
    primary: "bg-bone-100 text-ink-950 hover:bg-bone-300 active:bg-bone-400",
    secondary:
      "bg-ink-900 text-bone-100 border border-ink-700 hover:bg-ink-800 hover:border-ink-600 active:bg-ink-700",
    ghost: "bg-transparent text-bone-400 hover:text-bone-100 hover:bg-ink-900 active:bg-ink-800",
    danger:
      "bg-transparent text-clay border border-clay hover:bg-clay/10 active:bg-clay/20",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
