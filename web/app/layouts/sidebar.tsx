import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";

import {
  Home,
  Info,
  Laptop,
  List,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "~/lib/utils";

import { useTheme } from "~/components/theme-provider";

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Only auto-open on desktop if not already set
      if (!mobile) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const { t } = useTranslation(["sidebar", "navigation", "user"]);
  const { setTheme, theme } = useTheme();
  const { pathname } = useLocation();

  const navItems = [
    {
      to: "/home",
      icon: Home,
      label: t("home", { ns: "navigation" }),
    },
    {
      to: "/posts",
      icon: List,
      label: t("posts", { ns: "navigation" }),
    },
  ];

  const footerItems = [
    {
      to: "/account",
      icon: User,
      label: t("account", { ns: "user" }),
    },
    {
      to: "/about",
      icon: Info,
      label: t("about", { ns: "navigation" }),
    },
  ];

  const cycleTheme = () => {
    const themes = ["system", "light", "dark"] as const;
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Laptop;

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r bg-background transition-all duration-300 z-50",
          isMobile
            ? cn(
                "fixed inset-y-0 left-0 w-64",
                isOpen ? "translate-x-0" : "-translate-x-full",
              )
            : cn(isOpen ? "w-64" : "w-16"),
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex h-14 items-center border-b px-4",
            isOpen ? "justify-between" : "justify-center",
          )}
        >
          {isOpen && <span className="font-semibold">Menu</span>}
          {!isMobile && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-md p-2 hover:bg-accent transition-colors"
              aria-label={isOpen ? "Minimize menu" : "Expand menu"}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-2">
          <button
            onClick={cycleTheme}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            <ThemeIcon className="h-5 w-5 shrink-0" />
            {isOpen && <span>{t("theme")}</span>}
          </button>
          {footerItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />

        {/* Mobile Menu Button - Fixed at bottom right */}
        {isMobile && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="fixed bottom-6 right-6 z-50 rounded-full bg-primary text-primary-foreground p-4 shadow-lg hover:bg-primary/90 transition-all active:scale-95"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        )}
      </main>
    </div>
  );
}
