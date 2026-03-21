"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { IconMenu } from "@/components/icons";
import { useA11y } from "@/contexts/AccessibilityContext";
import { AccessibilityButton } from "@/components/ui/AccessibilityButton";

type Props = {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
};

export function AppShell({ children, title, actions }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useA11y();

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content — offset by sidebar on desktop */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-4 px-4 sm:px-6 h-14 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label={t("nav", "dashboard")}
          >
            <IconMenu size={18} aria-hidden="true" />
          </button>
          {title && (
            <h1 className="text-sm font-semibold text-slate-100 truncate">{title}</h1>
          )}
          <div className="ml-auto flex items-center gap-2">
            <AccessibilityButton />
            {actions}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 py-6" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
