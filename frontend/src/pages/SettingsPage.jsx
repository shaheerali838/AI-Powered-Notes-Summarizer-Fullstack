import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotes } from "../context/NotesContext";
import { useUI } from "../context/UIContext";
import {
  User,
  Sparkles,
  Download,
  Trash2,
  Check,
  ShieldCheck,
  HardDrive,
  FileDown,
  SlidersHorizontal,
  AlertTriangle,
  Cpu,
  Sun,
  Moon,
  Palette,
} from "lucide-react";
import { updateProfile } from "firebase/auth";

const SettingsPage = () => {
  const { user, isGuest, openAuthModal } = useAuth();
  const { summaryHistory, deleteSummary, clearNotes } = useNotes();
  const { theme, setTheme } = useUI();

  // Profile Edit State
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Summarizer & AI Preferences (Persisted in localStorage)
  const [geminiModel, setGeminiModel] = useState(() => {
    return localStorage.getItem("pref_gemini_model") || "gemini-3.5-flash-lite";
  });
  const [summaryLength, setSummaryLength] = useState(() => {
    return localStorage.getItem("pref_summary_length") || "balanced";
  });
  const [summaryTone, setSummaryTone] = useState(() => {
    return localStorage.getItem("pref_summary_tone") || "academic";
  });
  const [autoCopy, setAutoCopy] = useState(() => {
    return localStorage.getItem("pref_auto_copy") === "true";
  });
  const [showMetrics, setShowMetrics] = useState(() => {
    return localStorage.getItem("pref_show_metrics") !== "false";
  });

  // Modal / Feedback state
  const [toastMessage, setToastMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    document.title = "Settings - AI Notes Summarizer";
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Save AI & Workspace Preferences
  const handleSavePref = (key, value, setter) => {
    setter(value);
    localStorage.setItem(key, value);
    showToast("Preferences updated");
  };

  // Update Profile Name in Firebase
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user || isGuest) return;
    setIsUpdatingProfile(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      setProfileSaved(true);
      showToast("Profile name updated successfully");
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Export All Notes & Summaries as JSON
  const handleExportData = () => {
    if (summaryHistory.length === 0) {
      alert("No summaries found to export.");
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: isGuest ? "Guest User" : user?.email || "User",
      totalSummaries: summaryHistory.length,
      summaries: summaryHistory,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-notes-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Export download started");
  };

  // Export All Notes as Markdown (.md)
  const handleExportMarkdown = () => {
    if (summaryHistory.length === 0) {
      alert("No summaries found to export.");
      return;
    }

    let mdContent = `# AI Notes Summarizer - Archive Export\nExport Date: ${new Date().toLocaleString()}\nTotal Documents: ${summaryHistory.length}\n\n---\n\n`;

    summaryHistory.forEach((item, index) => {
      mdContent += `## ${index + 1}. ${item.filename || "Study Note"}\n`;
      mdContent += `**Date:** ${new Date(item.createdAt || item.timestamp || Date.now()).toLocaleString()}\n\n`;
      mdContent += `### Summary\n${item.summarizedContent || item.summary || "N/A"}\n\n`;
      if (item.keyPoints && item.keyPoints.length > 0) {
        mdContent += `### Key Points\n`;
        item.keyPoints.forEach((pt) => {
          mdContent += `- ${pt}\n`;
        });
        mdContent += `\n`;
      }
      mdContent += `---\n\n`;
    });

    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-notes-study-guide-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Markdown archive exported");
  };

  // Delete All Summaries
  const handleDeleteAllHistory = async () => {
    setIsDeletingAll(true);
    try {
      for (const item of summaryHistory) {
        await deleteSummary(item.id);
      }
      clearNotes();
      setShowDeleteModal(false);
      showToast("All history records cleared");
    } catch (err) {
      alert("Error deleting summaries: " + err.message);
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="h-full flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.300)_transparent]">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Customize your AI model behaviors, editor preferences, and manage your data.
            </p>
          </div>

          {/* Quick Toast Alert */}
          {toastMessage && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-medium shadow-lg animate-in fade-in slide-in-from-top-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 1. PROFILE & ACCOUNT SETTINGS                                             */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-5 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                  Account & Profile
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Manage your personal details and cloud synchronization.
                </p>
              </div>
            </div>

            {isGuest ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                Guest Mode
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cloud Synced</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Display Name
              </label>
              {user && !isGuest ? (
                <form onSubmit={handleUpdateProfile} className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="flex-1 px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={isUpdatingProfile || !displayName.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition"
                  >
                    {profileSaved ? "Saved!" : "Save"}
                  </button>
                </form>
              ) : (
                <input
                  type="text"
                  disabled
                  value="Guest User"
                  className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl cursor-not-allowed"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                type="text"
                disabled
                value={isGuest ? "Not configured (Anonymous)" : user?.email || "N/A"}
                className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl cursor-not-allowed"
              />
            </div>
          </div>

          {isGuest && (
            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Sync summaries across all your devices
                </p>
                <p className="text-3xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Guest notes are stored locally in your browser. Sign in to save unlimited study notes permanently.
                </p>
              </div>
              <button
                onClick={() => openAuthModal("login")}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition flex-shrink-0"
              >
                Sign In / Register
              </button>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 2. AI MODEL & SUMMARIZER ENGINE PREFERENCES                               */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-5 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                  AI Summarizer Preferences
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Configure output depth, tone, and underlying Gemini model.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl text-2xs font-bold text-indigo-700 dark:text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{geminiModel}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* AI Model Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>AI Engine Model</span>
              </label>
              <select
                value={geminiModel}
                onChange={(e) =>
                  handleSavePref("pref_gemini_model", e.target.value, setGeminiModel)
                }
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition cursor-pointer"
              >
                <option value="gemini-3.5-flash-lite">
                  Gemini 3.5 Flash Lite (Recommended)
                </option>
                <option value="gemini-2.5-flash-lite">
                  Gemini 2.5 Flash Lite
                </option>
                <option value="gemini-2.5-flash">
                  Gemini 2.5 Flash (Standard)
                </option>
              </select>
              <p className="text-3xs text-slate-400 dark:text-slate-500 mt-1">
                Powered by Google AI Studio API key.
              </p>
            </div>

            {/* Tone of Voice */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Output Tone & Style
              </label>
              <select
                value={summaryTone}
                onChange={(e) =>
                  handleSavePref("pref_summary_tone", e.target.value, setSummaryTone)
                }
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition cursor-pointer"
              >
                <option value="academic">Academic & Study Notes</option>
                <option value="executive">Executive Brief (High Level)</option>
                <option value="simple">Simple & Plain English</option>
              </select>
              <p className="text-3xs text-slate-400 dark:text-slate-500 mt-1">
                Linguistic style and vocabulary.
              </p>
            </div>

            {/* Summary Length / Detail Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Detail & Depth
              </label>
              <select
                value={summaryLength}
                onChange={(e) =>
                  handleSavePref("pref_summary_length", e.target.value, setSummaryLength)
                }
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition cursor-pointer"
              >
                <option value="concise">Concise (3-5 core takeaways)</option>
                <option value="balanced">Balanced (Standard)</option>
                <option value="deep">Comprehensive (Deep Breakdown)</option>
              </select>
              <p className="text-3xs text-slate-400 dark:text-slate-500 mt-1">
                Density of sub-points and explanations.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. WORKSPACE & EDITOR BEHAVIORS                                           */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4 transition-colors">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                Workspace Behaviors
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Editor ergonomics and UI enhancements.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Auto Copy Toggle */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Auto-Copy to Clipboard
                </p>
                <p className="text-3xs sm:text-xs text-slate-400 dark:text-slate-500">
                  Automatically copy the generated summary when AI generation completes.
                </p>
              </div>
              <button
                onClick={() =>
                  handleSavePref("pref_auto_copy", String(!autoCopy), setAutoCopy)
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  autoCopy ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    autoCopy ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Show Reduction Metrics */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Show Compression & Reduction Stats
                </p>
                <p className="text-3xs sm:text-xs text-slate-400 dark:text-slate-500">
                  Display the "X% shorter" metric badge on the summary output header.
                </p>
              </div>
              <button
                onClick={() =>
                  handleSavePref("pref_show_metrics", String(!showMetrics), setShowMetrics)
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  showMetrics ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    showMetrics ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. APPEARANCE & THEME PREFERENCES                                         */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4 transition-colors">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                Appearance & Theme
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Select your preferred color theme for comfortable study sessions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Light Mode Selection Card */}
            <button
              type="button"
              onClick={() => {
                setTheme("light");
                showToast("Light theme selected");
              }}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                theme === "light"
                  ? "border-blue-600 bg-blue-50/60 text-blue-950 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Light Mode</p>
                  <p className="text-3xs text-slate-500 dark:text-slate-400">
                    Crisp, clean light appearance
                  </p>
                </div>
              </div>
              {theme === "light" && <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />}
            </button>

            {/* Dark Mode Selection Card */}
            <button
              type="button"
              onClick={() => {
                setTheme("dark");
                showToast("Dark theme selected");
              }}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                theme === "dark"
                  ? "border-blue-500 bg-blue-950/40 text-blue-200 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-300 flex items-center justify-center flex-shrink-0 border border-slate-700">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Dark Mode</p>
                  <p className="text-3xs text-slate-500 dark:text-slate-400">
                    Sleek, low-glare dark appearance
                  </p>
                </div>
              </div>
              {theme === "dark" && <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />}
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. DATA EXPORT & HISTORY MANAGEMENT                                       */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-5 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                  Data Backup & Export
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  You have{" "}
                  <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                    {summaryHistory.length} saved summaries
                  </strong>{" "}
                  in your history.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Export Markdown */}
            <button
              onClick={handleExportMarkdown}
              disabled={summaryHistory.length === 0}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-left transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 rounded-xl transition">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                  Export Markdown Study Guide (.md)
                </p>
                <p className="text-3xs text-slate-400 dark:text-slate-500">
                  Formatted study notes ready for Obsidian, Notion, or printing.
                </p>
              </div>
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportData}
              disabled={summaryHistory.length === 0}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-left transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 rounded-xl transition">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                  Export Raw Backup (.json)
                </p>
                <p className="text-3xs text-slate-400 dark:text-slate-500">
                  Complete structured archive of all original and summarized notes.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. DANGER ZONE                                                            */}
        {/* ========================================================================= */}
        <section className="bg-rose-50/40 dark:bg-rose-950/20 rounded-2xl border border-rose-200/70 dark:border-rose-900/50 p-5 sm:p-6 space-y-4 transition-colors">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-sm sm:text-base font-bold">Danger Zone</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-200/80 dark:border-rose-900/50">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Clear All Summary History
              </p>
              <p className="text-3xs sm:text-xs text-slate-400 dark:text-slate-500">
                Permanently delete all {summaryHistory.length} saved summaries. This action cannot be undone.
              </p>
            </div>

            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={summaryHistory.length === 0}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition flex-shrink-0"
            >
              Delete All History
            </button>
          </div>
        </section>
      </div>

      {/* Delete All Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete All Summaries?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete all {summaryHistory.length} saved summaries? This will permanently wipe them.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllHistory}
                disabled={isDeletingAll}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer"
              >
                {isDeletingAll ? "Deleting..." : "Yes, Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
