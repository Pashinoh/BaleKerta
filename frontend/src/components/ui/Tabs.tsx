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
      className={`inline-flex p-1 bg-ink-950 border border-ink-700 rounded-md gap-1 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 text-[13px] font-medium rounded transition-colors duration-150 flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-bone-100 ${
              isActive
                ? "bg-ink-800 text-bone-100 border border-ink-700 font-semibold"
                : "text-bone-400 hover:text-bone-100 hover:bg-ink-900"
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-ink-700 text-bone-100" : "bg-ink-850 text-bone-400"
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
