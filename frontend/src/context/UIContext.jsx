import { createContext, useState, useContext, useEffect } from "react";

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within UIProvider");
  return context;
};

export const UIProvider = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem("app_theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Synchronize theme with DOM documentElement and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("app_theme", theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (newTheme === "dark" || newTheme === "light") {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      const mobileView = width < 1024;
      setIsMobile(mobileView);

      if (mobileView) {
        setSidebarExpanded(false);
      } else {
        const savedState = localStorage.getItem("sidebarExpanded");
        if (savedState !== null) {
          setSidebarExpanded(JSON.parse(savedState));
        } else {
          setSidebarExpanded(true);
        }
      }
    };

    checkBreakpoints();
    window.addEventListener("resize", checkBreakpoints);
    return () => window.removeEventListener("resize", checkBreakpoints);
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded((prev) => {
      const newState = !prev;
      if (!isMobile) {
        localStorage.setItem("sidebarExpanded", JSON.stringify(newState));
      }
      return newState;
    });
  };

  const toggleHistory = () => {
    setHistoryExpanded((prev) => !prev);
  };

  return (
    <UIContext.Provider
      value={{
        sidebarExpanded,
        setSidebarExpanded,
        toggleSidebar,
        historyExpanded,
        setHistoryExpanded,
        toggleHistory,
        isMobile,
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === "dark",
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
