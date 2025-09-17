// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import {
  PlusCircle,
  History,
  Settings,
  Menu,
  X,
  ChevronDown,
  FileText,
  Lock,
  User,
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const { clearNotes, summaryHistory, fetchHistory, loadSummary } = useNotes();
  const {
    sidebarExpanded,
    toggleSidebar,
    historyExpanded,
    toggleHistory,
    isMobile,
  } = useUI();
  const { isGuest, openAuthModal } = useAuth();
  const location = useLocation();
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);

  const handleNewSummary = () => {
    clearNotes();
    if (isMobile) {
      setShowMobileOverlay(false);
    }
  };

  const handleHistoryItemClick = (summaryItem) => {
    loadSummary(summaryItem);
    if (isMobile) {
      setShowMobileOverlay(false);
    }
  };

  const handleSignInPrompt = () => {
    openAuthModal('login');
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
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && showMobileOverlay && (
        <div
          className="fixed bg-black bg-opacity-50 z-40"
          style={{ top: "64px", left: 0, right: 0, bottom: 0 }}
          onClick={() => setShowMobileOverlay(false)}
        />
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed z-40 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-300 ${
          isMobile
            ? "left-4 top-20"
            : sidebarExpanded
            ? "left-60 top-20"
            : "left-12 top-20"
        } ${!isMobile ? "hidden" : ""}`}
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
        className={`fixed left-0 bg-white border-r border-gray-200 z-30 transition-all duration-300 ease-in-out ${
          isMobile
            ? `${
                showMobileOverlay ? "translate-x-0" : "-translate-x-full"
              } w-64`
            : sidebarExpanded
            ? "w-64 translate-x-0"
            : "w-16 translate-x-0"
        }`}
        style={{ top: "64px", height: "calc(100vh - 64px)" }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* New Summary Button */}
            <Link
              to="/"
              onClick={handleNewSummary}
              className={`flex items-center gap-3 w-full px-4 py-3 text-white bg-[#4F88FF] rounded-lg hover:bg-[#3B7BFF] transition-all duration-200 transform hover:scale-105 shadow-md ${
                !sidebarExpanded && !isMobile ? "justify-center" : ""
              }`}
              title={!sidebarExpanded && !isMobile ? "New Summary" : ""}
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
                  !sidebarExpanded && !isMobile
                    ? "justify-center"
                    : "justify-between"
                }`}
                title={!sidebarExpanded && !isMobile ? "History" : ""}
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
                      historyExpanded ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {/* History Items */}
              {historyExpanded && (sidebarExpanded || isMobile) && (
                <div className="ml-4 space-y-1 max-h-64 overflow-y-auto">
                  {summaryHistory.length === 0 ? (
                    <div className="px-4 py-2">
                      {isGuest ? (
                        <div className="text-center">
                          <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500 mb-2">
                            Sign in to save your summaries permanently
                          </p>
                          <button
                            onClick={handleSignInPrompt}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Sign In
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No summaries yet</p>
                      )}
                    </div>
                  ) : (
                    <>
                      {isGuest && (
                        <div className="px-4 py-2 mb-2 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-1 mb-1">
                            <User className="h-3 w-3 text-yellow-600" />
                            <span className="text-xs font-medium text-yellow-800">Guest Mode</span>
                          </div>
                          <p className="text-xs text-yellow-700">
                            History cleared on refresh
                          </p>
                        </div>
                      )}
                      {summaryHistory.slice(0, 10).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleHistoryItemClick(item)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="truncate">
                                {typeof item.original === "string"
                                  ? item.original.substring(0, 30) + "..."
                                  : "Summary"}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>{formatDate(item.timestamp || item.createdAt)}</span>
                                {item.wordCount && (
                                  <span>• {item.wordCount} words</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Quick Stats for authenticated users */}
            {!isGuest && summaryHistory.length > 0 && (sidebarExpanded || isMobile) && (
              <div className="px-4 py-2 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-blue-800 mb-1">Your Stats</p>
                <div className="text-xs text-blue-600 space-y-1">
                  <div>{summaryHistory.length} summaries</div>
                  <div>
                    {summaryHistory.reduce((acc, item) => acc + (item.wordCount || 0), 0)} words processed
                  </div>
                </div>
              </div>
            )}

            {/* Settings Link */}
            <SidebarLink
              to="/settings"
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              expanded={sidebarExpanded || isMobile}
              isActive={location.pathname === "/settings"}
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
        ? "text-[#4F88FF] bg-blue-50"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    } ${!expanded ? "justify-center" : ""}`}
    title={!expanded ? label : ""}
  >
    {icon}
    {expanded && <span className="font-medium">{label}</span>}
  </Link>
);

export default Sidebar;
