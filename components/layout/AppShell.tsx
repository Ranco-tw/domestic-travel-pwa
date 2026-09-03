"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Compass, Heart, MapPinned, Moon, Settings, Sun, UserRound } from "lucide-react";
import clsx from "clsx";
import { AppTab, ThemeMode } from "@/lib/types";

interface AppShellProps {
  childrenByTab: Record<AppTab, React.ReactNode>;
  onLogout: () => void;
}

const tabs: Array<{ id: AppTab; label: string; icon: React.ElementType }> = [
  { id: "explore", label: "探索", icon: Compass },
  { id: "favorites", label: "收藏", icon: Heart },
  { id: "itinerary", label: "行程", icon: CalendarDays },
  { id: "mine", label: "我的", icon: UserRound },
];

export function AppShell({ childrenByTab, onLogout }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<AppTab>("explore");
  const [theme, setTheme] = useState<ThemeMode>("system");

  useEffect(() => {
    const saved = (localStorage.getItem("travel-pwa-theme") as ThemeMode | null) ?? "system";
    setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("travel-pwa-theme", theme);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
  }, [theme]);

  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto flex min-h-screen max-w-md flex-col border-x border-border bg-background">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <MapPinned size={22} className="text-primary" />
            <span className="font-black">旅途收藏</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="grid h-9 w-9 place-items-center rounded-lg text-muted"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="切換色彩"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-lg text-muted" onClick={onLogout} aria-label="登出">
              <Settings size={18} />
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto px-4 pb-24 pt-4">{childrenByTab[activeTab]}</section>

        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-border bg-card/95 px-3 pt-2 backdrop-blur">
          <div className="grid grid-cols-4 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex min-h-14 flex-col items-center justify-center rounded-lg text-xs font-semibold",
                    activeTab === tab.id ? "text-primary" : "text-muted",
                  )}
                >
                  <Icon size={21} fill={activeTab === tab.id ? "currentColor" : "none"} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </main>
  );
}
