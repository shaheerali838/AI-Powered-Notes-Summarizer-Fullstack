import { Sun, Moon } from "lucide-react";
import { useUI } from "../context/UIContext";

/**
 * Reusable, animated Theme Toggle Button
 * Supports light / dark mode with instant reactivity
 */
const ThemeToggle = ({ className = "", showLabel = false, size = "md" }) => {
  const { theme, toggleTheme, isDark } = useUI();

  const isCompact = size === "sm";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 cursor-pointer select-none border ${
        isDark
          ? "bg-slate-800 hover:bg-slate-700/90 text-amber-300 border-slate-700 shadow-xs"
          : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200 shadow-2xs"
      } ${
        isCompact
          ? "p-1.5 text-xs"
          : showLabel
          ? "px-3 py-2 text-xs font-medium"
          : "w-9 h-9 p-2"
      } ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 transform rotate-0 scale-100 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-slate-600 transition-transform duration-300 transform -rotate-12 scale-100 group-hover:rotate-0" />
        )}
      </div>

      {showLabel && (
        <span className="font-medium text-slate-700 dark:text-slate-200">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
