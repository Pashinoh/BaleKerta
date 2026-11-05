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
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-2 focus-visible:outline-bone-100 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  // Minimum 44px height on mobile for ergonomic thumb tap targets (R-03)
  const sizeStyles = {
    sm: "text-[13px] px-3 py-1.5 gap-1.5 min-h-[40px] sm:min-h-[36px]",
    md: "text-[13.5px] px-4 py-2 gap-2 min-h-[44px] sm:min-h-[40px]",
    lg: "text-[14.5px] px-5 py-2.5 gap-2.5 min-h-[46px] sm:min-h-[44px]",
  };

  const variantStyles = {
    primary:
      "bg-bone-100 text-ink-950 border border-bone-100 hover:bg-bone-200 active:translate-y-[0.5px] font-semibold shadow-sm",
    secondary:
      "bg-ink-900 text-bone-100 border border-ink-600 hover:bg-ink-800 hover:border-bone-400 active:bg-ink-850",
    ghost:
      "bg-transparent text-bone-300 border border-transparent hover:text-bone-100 hover:bg-ink-850 active:bg-ink-800",
    danger:
      "bg-clay/10 text-clay border border-clay hover:bg-clay/20 active:bg-clay/25 font-semibold",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
