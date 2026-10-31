import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface DisclosureProps {
  title: React.ReactNode;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Disclosure: React.FC<DisclosureProps> = ({
  title,
  subtitle,
  defaultOpen = false,
  children,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-ink-700 rounded-lg overflow-hidden bg-ink-900 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-3.5 text-left hover:bg-ink-800 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-bone-100"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-[15px] font-medium text-bone-100">{title}</span>
          {subtitle && <span className="text-[13px] text-bone-400">{subtitle}</span>}
        </div>
        <ChevronDown
          size={18}
          className={`text-bone-400 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="p-3.5 pt-1 border-t border-ink-700/60 text-[14px] text-bone-400">
          {children}
        </div>
      )}
    </div>
  );
};
