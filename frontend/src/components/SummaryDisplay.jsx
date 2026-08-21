import { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  BookOpen,
  ListOrdered,
  TrendingDown,
} from "lucide-react";
import { useNotes } from "../context/NotesContext";

const SummaryDisplay = () => {
  const { summaryOutput, isGenerating, originalNotes, currentNote } = useNotes();
  const [copied, setCopied] = useState(false);

  const summaryText = currentNote?.summary || summaryOutput?.summary || "";
  let keyPoints = currentNote?.keyPoints || summaryOutput?.keyPoints || [];

  if (keyPoints.length && keyPoints[0].includes("Re-Summarized")) {
    keyPoints = keyPoints.slice(1);
  }

  // Calculate reduction metrics
  const originalWords = (originalNotes || currentNote?.extractedText || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const summaryWords = summaryText.trim().split(/\s+/).filter(Boolean).length;
  const reductionPercent =
    originalWords > 0 && summaryWords > 0
      ? Math.max(0, Math.round(((originalWords - summaryWords) / originalWords) * 100))
      : 0;

  const showMetrics = localStorage.getItem("pref_show_metrics") !== "false";

  const handleCopy = () => {
    if (!summaryText) return;
    let fullText = summaryText;
    if (keyPoints.length > 0) {
      fullText += "\n\nKey Points:\n" + keyPoints.join("\n");
    }
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to parse numbering and render point values in bold
  const renderPointItem = (point, index) => {
    const trimmed = point.trim();
    // Matches numbering patterns like "1.", "5.1", "5.1.2", "10.2", etc.
    const numberMatch = trimmed.match(/^(\d+(?:\.\d+)*\.?)\s*(.*)$/);

    if (numberMatch) {
      const [, numberPart, textPart] = numberMatch;
      const dotCount = (numberPart.match(/\./g) || []).length;
      const isSubPoint = dotCount >= 1 && !numberPart.endsWith(".");
      const isDeepNested = dotCount >= 2;

      let indentClass = "";
      let borderClass = "border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-2xs";
      let numColor = "text-slate-900 dark:text-slate-100 font-bold";

      if (isDeepNested) {
        indentClass = "ml-8 bg-slate-50/90 dark:bg-slate-800/50 border-l-2 border-indigo-400 dark:border-indigo-500 pl-3.5";
        numColor = "text-indigo-600 dark:text-indigo-400 font-bold";
      } else if (isSubPoint) {
        indentClass = "ml-4 bg-slate-50/80 dark:bg-slate-800/60 border-l-2 border-blue-500 dark:border-blue-400 pl-3.5";
        numColor = "text-blue-600 dark:text-blue-400 font-bold";
      }

      return (
        <div
          key={index}
          className={`p-3 rounded-xl text-sm leading-snug transition-all ${indentClass || borderClass}`}
        >
          <div className="flex items-start gap-2">
            <span className={`flex-shrink-0 tracking-tight ${numColor}`}>
              {numberPart}
            </span>
            <span className="flex-1 text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
              {textPart}
            </span>
          </div>
        </div>
      );
    }

    // Fallback for non-numbered bullet lines
    const isIndented = point.startsWith("  ") || point.startsWith("\t");
    return (
      <div
        key={index}
        className={`p-3 rounded-xl text-sm leading-snug transition-all ${
          isIndented
            ? "ml-4 bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-l-2 border-blue-400 dark:border-blue-500 pl-3.5"
            : "bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium shadow-2xs"
        }`}
      >
        {trimmed}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden min-h-0 transition-colors">
      {/* 1. Header with Status & Copy Action */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            AI Summarized Output
          </h2>
        </div>

        {summaryText && !isGenerating && (
          <div className="flex items-center gap-2">
            {showMetrics && reductionPercent > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <TrendingDown className="w-3 h-3" />
                <span>{reductionPercent}% shorter</span>
              </span>
            )}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 2. Scrollable Output Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.300)_transparent] dark:[scrollbar-color:theme(colors.slate.700)_transparent]">
        {isGenerating ? (
          /* Shimmer Skeleton Loader */
          <div className="space-y-6 animate-pulse">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3 mb-2" />
              <div className="h-3.5 bg-slate-200/70 dark:bg-slate-700/60 rounded-md w-full" />
              <div className="h-3.5 bg-slate-200/70 dark:bg-slate-700/60 rounded-md w-11/12" />
              <div className="h-3.5 bg-slate-200/70 dark:bg-slate-700/60 rounded-md w-4/5" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4" />
              <div className="h-3.5 bg-slate-200/70 dark:bg-slate-700/60 rounded-md w-10/12" />
              <div className="h-3.5 bg-slate-200/70 dark:bg-slate-700/60 rounded-md w-9/12 ml-4" />
              <div className="h-3.5 bg-slate-200/70 dark:bg-slate-700/60 rounded-md w-11/12" />
              <div className="h-3.5 bg-slate-200/70 dark:bg-slate-700/60 rounded-md w-8/12 ml-4" />
            </div>
          </div>
        ) : summaryText ? (
          /* Populated State */
          <>
            {/* Executive Summary Card */}
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-800/80 dark:to-indigo-950/30 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400">
                <BookOpen className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Summary Overview
                </h3>
              </div>
              <p className="text-slate-800 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-line">
                {summaryText}
              </p>
            </div>

            {/* Hierarchical Key Points */}
            {keyPoints.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <ListOrdered className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Key Study Points
                  </h3>
                </div>

                <div className="space-y-2">
                  {keyPoints.map((point, index) => renderPointItem(point, index))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Sparkles className="w-7 h-7 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Ready to Summarize
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
              Enter your notes on the left panel or upload a file, then click{" "}
              <strong className="text-slate-600 dark:text-slate-300 font-semibold">
                Generate Summary
              </strong>{" "}
              to view AI-extracted study notes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryDisplay;
