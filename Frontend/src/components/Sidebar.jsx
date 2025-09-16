import { Link, useLocation } from "react-router-dom";
import { 
  PlusCircle, 
  History, 
  Settings, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight,
  Clock,
  FileText
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { useUI } from "../context/UIContext";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const { clearNotes, summaryHistory, fetchHistory } = useNotes();
  const { 
    sidebarExpanded, 
    toggleSidebar, 
    historyExpanded, 
    toggleHistory,
    isMobile,
    isTablet 
  } = useUI();
  const location = useLocation();
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);

  const handleNewSummary = () => {
    clearNotes();
    if (isMobile) {
      setShowMobileOverlay(false);
    }
  };

  const handleHistoryItemClick = () => {
    if (isMobile) {
      setShowMobileOverlay(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (isMobile && sidebarExpanded) {
      setShowMobileOverlay(true);
    } else {
      setShowMobileOverlay(false);
    }
  }, [sidebarExpanded, isMobile]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && showMobileOverlay && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileOverlay(false)}
        />
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-300 ${
          isMobile 
            ? 'left-4' 
            : sidebarExpanded 
              ? 'left-60' 
              : 'left-12'
        }`}
        aria-label="Toggle sidebar"
      >
        {sidebarExpanded ? (
          <X className="h-5 w-5 text-gray-600" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300 ease-in-out ${
          isMobile
            ? `${showMobileOverlay ? 'translate-x-0' : '-translate-x-full'} w-64`
            : sidebarExpanded 
              ? 'w-64 translate-x-0' 
              : 'w-16 translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full pt-16">
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* New Summary Button */}
            <Link
              to="/"
              onClick={handleNewSummary}
              className={`flex items-center gap-3 w-full px-4 py-3 text-white bg-[#4F88FF] rounded-lg hover:bg-[#3B7BFF] transition-all duration-200 transform hover:scale-105 shadow-md ${
                !sidebarExpanded && !isMobile ? 'justify-center' : ''
              }`}
              title={!sidebarExpanded && !isMobile ? 'New Summary' : ''}
            >
              <PlusCircle className="h-5 w-5 flex-shrink-0" />
              {(sidebarExpanded || isMobile) && (
                <span className="font-medium">New Summary</span>
              )}
            </Link>

            {/* History Section */}
            <div className="space-y-2">
              <button
                onClick={toggleHistory}
                className={`flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${
                  !sidebarExpanded && !isMobile ? 'justify-center' : 'justify-between'
                }`}
                title={!sidebarExpanded && !isMobile ? 'History' : ''}
              >
                <div className="flex items-center gap-3">
                  <History className="h-5 w-5 flex-shrink-0" />
                  {(sidebarExpanded || isMobile) && (
                    <span className="font-medium">History</span>
                  )}
                </div>
                {(sidebarExpanded || isMobile) && (
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-200 ${
                      historyExpanded ? 'rotate-180' : ''
                    }`} 
                  />
                )}
              </button>

              {/* History Items */}
              {historyExpanded && (sidebarExpanded || isMobile) && (
                <div className="ml-4 space-y-1 max-h-64 overflow-y-auto">
                  {summaryHistory.length === 0 ? (
                    <p className="text-sm text-gray-500 px-4 py-2">No history yet</p>
                  ) : (
                    summaryHistory.slice(0, 10).map((item) => (
                      <Link
                        key={item.id}
                        to="/"
                        onClick={handleHistoryItemClick}
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate">
                              {typeof item.original === 'string' 
                                ? item.original.substring(0, 30) + '...'
                                : 'Summary'
                              }
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(item.date)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Settings Link */}
            <SidebarLink
              to="/settings"
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              expanded={sidebarExpanded || isMobile}
              isActive={location.pathname === '/settings'}
            />
          </div>
        </div>
      </aside>
    </>
  );
};

const SidebarLink = ({ to, icon, label, expanded, isActive }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
      isActive 
        ? 'text-[#4F88FF] bg-blue-50' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    } ${!expanded ? 'justify-center' : ''}`}
    title={!expanded ? label : ''}
  >
    {icon}
    {expanded && <span className="font-medium">{label}</span>}
  </Link>
);

export default Sidebar;
