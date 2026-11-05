import React from "react";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = "",
}) => {
  return (
    <div
      className={`grid grid-cols-1 sm:inline-flex p-1 bg-ink-950 border border-ink-700 rounded-lg gap-1 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`min-h-[42px] sm:min-h-[36px] px-3.5 py-2 text-[13px] rounded-md transition-colors duration-150 flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-bone-100 ${
              isActive
                ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                : "text-bone-400 hover:text-bone-100 hover:bg-ink-900 font-medium"
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${
                  isActive ? "bg-ink-950/15 text-ink-950" : "bg-ink-850 text-bone-400"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
