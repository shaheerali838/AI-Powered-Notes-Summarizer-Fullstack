import { Link, useLocation } from "react-router-dom";
import {
  Plus,
  History,
  Settings,
  X,
  FileText,
  Brain,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Trash2,
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const {
    clearNotes,
    summaryHistory,
    fetchHistory,
    loadSummary,
    deleteSummary,
    currentNote,
    originalNotes,
  } = useNotes();

  const { sidebarExpanded, toggleSidebar, isMobile } = useUI();
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
    loadSummary(item);
    if (isMobile) setMobileOverlayOpen(false);
  };

  const formatDate = (date) => {
    try {
      const d = date?.toDate ? date.toDate() : new Date(date);
      if (isNaN(d)) return "Just now";
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(d);
    } catch {
      return "Recent";
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && mobileOverlayOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 transition-opacity"
          onClick={() => setMobileOverlayOpen(false)}
        />
      )}

      {/* Main Sidebar (Fixed, 100% Height, Tailwind Styling with Dark Mode) */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${
          isMobile
            ? `${mobileOverlayOpen ? "translate-x-0" : "-translate-x-full"} w-64`
            : sidebarExpanded
            ? "w-64 translate-x-0"
            : "w-16 translate-x-0"
        }`}
      >
        {/* ========================================================================= */}
        {/* 1. TOP SECTION: Branding, New Summary CTA, and Collapse Toggle            */}
        {/* ========================================================================= */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-2.5 flex-shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center justify-between">
            {sidebarExpanded || isMobile ? (
              <div className="flex items-center gap-2 px-1">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <Brain className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
                  AI Notes
                </span>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <Brain className="w-4 h-4" />
                </div>
              </div>
            )}

            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title={sidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                {sidebarExpanded ? (
                  <ChevronsLeft className="w-4 h-4" />
                ) : (
                  <ChevronsRight className="w-4 h-4" />
                )}
              </button>
            )}

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* "New Summary" Primary Action Button */}
          <Link
            to="/"
            onClick={handleNewSummary}
            className={`group inline-flex items-center gap-2 w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-semibold text-xs transition-all shadow-sm shadow-blue-500/20 cursor-pointer ${
              !sidebarExpanded && !isMobile ? "justify-center px-0" : ""
            }`}
            title="Start New Summary"
          >
            <Plus className="w-4 h-4 flex-shrink-0 group-hover:rotate-90 transition-transform duration-200" />
            {(sidebarExpanded || isMobile) && <span>New Summary</span>}
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 2. MIDDLE SECTION: Scrollable History List with Scrollbars                 */}
        {/* ========================================================================= */}
        <div className="flex-1 min-h-0 flex flex-col p-2.5 overflow-hidden">
          {(sidebarExpanded || isMobile) && (
            <div className="flex items-center justify-between px-2 py-1.5 mb-1 text-slate-400 dark:text-slate-500 flex-shrink-0">
              <span className="text-3xs font-bold uppercase tracking-wider">
                Recent Summaries
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-3xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {summaryHistory.length}
              </span>
            </div>
          )}

          {/* Scrollable Container */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.200)_transparent] dark:[scrollbar-color:theme(colors.slate.700)_transparent]">
            {summaryHistory.length === 0 ? (
              (sidebarExpanded || isMobile) && (
                <div className="px-3 py-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
                  <Clock className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">No summaries yet</p>
                  <p className="text-3xs text-slate-400 dark:text-slate-500">
                    Your generated summaries will appear here for instant review.
                  </p>
                  {isGuest && (
                    <button
                      onClick={() => openAuthModal("login")}
                      className="mt-2 text-2xs text-blue-600 dark:text-blue-400 font-semibold hover:underline block mx-auto"
                    >
                      Sign in to sync
                    </button>
                  )}
                </div>
              )
            ) : (
              summaryHistory.map((item) => {
                const title =
                  item.filename ||
                  item.originalContent ||
                  item.original ||
                  "Untitled Note";
                const isSelected =
                  currentNote?.id === item.id ||
                  (originalNotes &&
                    originalNotes === (item.originalContent || item.original));

                return (
                  <div
                    key={item.id}
                    onClick={() => handleHistoryItemClick(item)}
                    className={`group relative flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/90 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 border-l-3 border-blue-600 font-semibold shadow-2xs"
                        : "hover:bg-slate-100/70 dark:hover:bg-slate-800/70 border-l-3 border-transparent text-slate-700 dark:text-slate-300"
                    } ${!sidebarExpanded && !isMobile ? "justify-center px-0" : ""}`}
                    title={title}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <FileText
                        className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                          isSelected
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        }`}
                      />
                      {(sidebarExpanded || isMobile) && (
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {title.length > 26 ? title.substring(0, 26) + "..." : title}
                          </p>
                          <p className="text-3xs text-slate-400 dark:text-slate-500 font-normal">
                            {formatDate(item.createdAt || item.timestamp)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quick Delete on Hover */}
                    {(sidebarExpanded || isMobile) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSummary(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition-opacity cursor-pointer rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM SECTION: Theme Toggle & Settings Flush to Bottom                 */}
        {/* ========================================================================= */}
        <div className="mt-auto p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col gap-1 flex-shrink-0">
          {/* Bottom Theme Switcher */}
          <ThemeToggle
            showLabel={sidebarExpanded || isMobile}
            className={`w-full ${
              sidebarExpanded || isMobile
                ? "justify-start"
                : "justify-center"
            }`}
          />

          <Link
            to="/history"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              location.pathname === "/history"
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            } ${!sidebarExpanded && !isMobile ? "justify-center px-0" : ""}`}
            title="View Full History"
          >
            <History className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {(sidebarExpanded || isMobile) && <span>All History</span>}
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              location.pathname === "/settings"
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            } ${!sidebarExpanded && !isMobile ? "justify-center px-0" : ""}`}
            title="Application Settings"
          >
            <Settings className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {(sidebarExpanded || isMobile) && <span>Settings</span>}
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
