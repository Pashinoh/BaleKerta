import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive";
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = "default",
  children,
  className = "",
  ...props
}) => {
  const base = "bg-ink-900 border border-ink-700 rounded-lg";
  const variants = {
    default: "",
    elevated: "bg-ink-800 border-ink-600",
    interactive: "hover:border-ink-600 hover:bg-ink-800 transition-colors duration-150 cursor-pointer",
  };

  return (
    <div className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
