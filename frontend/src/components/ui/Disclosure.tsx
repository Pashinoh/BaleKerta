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
    <div className={`border border-ink-700 rounded-xl overflow-hidden bg-ink-900 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full min-h-[44px] flex items-center justify-between p-3.5 sm:px-4 text-left hover:bg-ink-850 active:bg-ink-800 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-bone-100"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col gap-0.5 pr-3">
          <span className="text-[14px] font-semibold text-bone-100">{title}</span>
          {subtitle && <span className="text-[12px] text-bone-400 font-mono">{subtitle}</span>}
        </div>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`text-bone-400 shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="p-3.5 sm:p-4 pt-2 border-t border-ink-700 text-[13px] text-bone-300">
          {children}
        </div>
      )}
    </div>
  );
};
