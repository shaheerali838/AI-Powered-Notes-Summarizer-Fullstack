import { createContext, useState, useContext, useEffect } from 'react';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};

export const UIProvider = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    // Load sidebar preference from localStorage
    const savedState = localStorage.getItem('sidebarExpanded');
    if (savedState !== null) {
      setSidebarExpanded(JSON.parse(savedState));
    }

    // Set up responsive breakpoint detection
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 480);
      setIsTablet(width <= 768 && width > 480);
      
      // Auto-collapse on tablet/mobile
      if (width <= 768) {
        setSidebarExpanded(false);
      }
    };

    checkBreakpoints();
    window.addEventListener('resize', checkBreakpoints);
    
    return () => window.removeEventListener('resize', checkBreakpoints);
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarExpanded;
    setSidebarExpanded(newState);
    localStorage.setItem('sidebarExpanded', JSON.stringify(newState));
  };

  const toggleHistory = () => {
    setHistoryExpanded(!historyExpanded);
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
        isTablet,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};