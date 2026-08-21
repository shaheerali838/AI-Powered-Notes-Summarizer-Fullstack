import { useState, useEffect } from "react";
import { FileText, Sparkles } from "lucide-react";
import UploadNotes from "../components/UploadNotes";
import SummaryDisplay from "../components/SummaryDisplay";
import { useNotes } from "../context/NotesContext";

const HomePage = () => {
  const { summaryOutput } = useNotes();
  const [mobileTab, setMobileTab] = useState("input"); // 'input' | 'output'

  useEffect(() => {
    document.title = "AI Notes Summarizer - Workspace";
  }, []);

  // When a summary is generated, switch to output tab on mobile
  useEffect(() => {
    if (summaryOutput) {
      setMobileTab("output");
    }
  }, [summaryOutput]);

  return (
    <div className="h-full w-full max-w-7xl mx-auto flex flex-col min-h-0">
      {/* Mobile Tab Switcher (< lg screens) */}
      <div className="lg:hidden flex items-center justify-center mb-2.5 flex-shrink-0">
        <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 w-full max-w-xs shadow-inner">
          <button
            onClick={() => setMobileTab("input")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "input"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Source Notes</span>
          </button>
          <button
            onClick={() => setMobileTab("output")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "output"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Summary</span>
            {summaryOutput && (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* 2-Column Split Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 min-h-0 overflow-hidden">
        {/* Left Column: Input, Upload, Stats & Action Bar */}
        <section
          className={`h-full min-h-0 flex flex-col ${
            mobileTab === "input" ? "flex" : "hidden lg:flex"
          }`}
        >
          <UploadNotes />
        </section>

        {/* Right Column: AI Summary Output, Skeleton Loader, or Empty State */}
        <section
          className={`h-full min-h-0 flex flex-col ${
            mobileTab === "output" ? "flex" : "hidden lg:flex"
          }`}
        >
          <SummaryDisplay />
        </section>
      </div>
    </div>
  );
};

export default HomePage;
