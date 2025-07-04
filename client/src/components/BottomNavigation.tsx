import { Link, useLocation } from "wouter";
import { Search, Star, Bookmark, User, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BottomNavigation() {
  const [location] = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: "/", icon: Search, label: t("search") },
    { path: "/matches", icon: Star, label: t("matches") },
    { path: "/saved", icon: Bookmark, label: t("saved") },
    { path: "/profile", icon: User, label: t("profile") },
    { path: "/settings", icon: Settings, label: t("settings") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-bottom z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={`flex flex-col items-center p-2 touch-target transition-colors ${
                  isActive
                    ? "text-sa-green dark:text-sa-gold"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
