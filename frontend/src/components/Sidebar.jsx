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
  Brain,
  ChevronsLeft,
  ChevronsRight,
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
  const [mobileOverlayOpen, setMobileOverlayOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    setMobileOverlayOpen(isMobile && sidebarExpanded);
  }, [sidebarExpanded, isMobile]);

  const handleNewSummary = () => {
    clearNotes();
    if (isMobile) setMobileOverlayOpen(false);
  };

  const handleHistoryItemClick = (item) => {
    loadSummary(item); // load the summary into main page
    if (isMobile) setMobileOverlayOpen(false);
  };

  const handleSignInPrompt = () => openAuthModal("login");

  const formatDate = (date) => {
    try {
      const d = date?.toDate ? date.toDate() : new Date(date);
      if (isNaN(d)) return "Invalid date";
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(d);
    } catch {
      return "Invalid date";
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileOverlayOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileOverlayOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${
          isMobile
            ? `${
                mobileOverlayOpen ? "translate-x-0" : "-translate-x-full"
              } w-64`
            : sidebarExpanded
            ? "w-64 translate-x-0"
            : "w-16 translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header: Logo + Hamburger/Expand */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <Link
              to="/"
              onClick={handleNewSummary}
              className="flex items-center gap-2 text-lg font-semibold text-gray-900"
            >
              <Brain className="h-6 w-6 text-[#4F88FF]" />
              {(sidebarExpanded || isMobile) && <span>AI Notes</span>}
            </Link>

            <div className="flex items-center gap-2">
              {/* Mobile Hamburger */}
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  {sidebarExpanded ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              )}

              {/* Desktop Expand/Collapse */}
              {!isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  title={sidebarExpanded ? "Collapse" : "Expand"}
                >
                  {sidebarExpanded ? (
                    <ChevronsLeft className="h-5 w-5" />
                  ) : (
                    <ChevronsRight className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar content */}
          <div className="p-4 flex-1 space-y-4 overflow-y-auto">
            {/* New Summary */}
            <Link
              to="/"
              onClick={handleNewSummary}
              className={`flex items-center gap-3 w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md ${
                !sidebarExpanded && !isMobile ? "justify-center" : ""
              }`}
            >
              <PlusCircle className="h-5 w-5 flex-shrink-0" />
              {(sidebarExpanded || isMobile) && <span>New Summary</span>}
            </Link>

            {/* History */}
            <div className="space-y-2">
              <button
                onClick={toggleHistory}
                className={`flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${
                  !sidebarExpanded && !isMobile
                    ? "justify-center"
                    : "justify-between"
                }`}
              >
                <div className="flex items-center gap-3">
                  <History className="h-5 w-5 flex-shrink-0" />
                  {(sidebarExpanded || isMobile) && <span>History</span>}
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
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {isGuest ? (
                        <div className="text-center">
                          <Lock className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                          Sign in to save summaries
                          <button
                            onClick={handleSignInPrompt}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium block mt-1"
                          >
                            Sign In
                          </button>
                        </div>
                      ) : (
                        <p>No summaries yet</p>
                      )}
                    </div>
                  ) : (
                    <>
                      {isGuest && (
                        <div className="px-4 py-2 mb-2 bg-yellow-50 rounded-lg border border-yellow-200 text-xs text-yellow-700">
                          Guest Mode - history cleared on refresh
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
                                {item.originalContent || item.original
                                  ? (
                                      item.originalContent || item.original
                                    ).substring(0, 30) + "..."
                                  : "Summary"}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <span>
                                  {formatDate(item.createdAt || item.timestamp)}
                                </span>
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

            {/* Settings */}
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
        ? "text-blue-600 bg-blue-50"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    } ${!expanded ? "justify-center" : ""}`}
  >
    {icon}
    {expanded && <span>{label}</span>}
  </Link>
);

export default Sidebar;
