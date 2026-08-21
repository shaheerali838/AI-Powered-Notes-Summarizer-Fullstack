import { useRef, useState } from "react";
import {
  FileText,
  Trash2,
  Sparkles,
  Loader2,
  FileUp,
  AlertCircle,
  X,
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { validateFile } from "../utils/fileProcessor";

const UploadNotes = () => {
  const {
    originalNotes,
    setOriginalNotes,
    generateSummary,
    isGenerating,
    uploadFile,
    isUploading,
    uploadProgress,
    clearNotes,
    error: apiError,
  } = useNotes();

  const [tab, setTab] = useState("paste"); // 'paste' | 'upload'
  const [localErrors, setLocalErrors] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const wordCount = originalNotes.trim()
    ? originalNotes.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = originalNotes.length;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setLocalErrors([]);
    const errs = [];
    files.forEach((f) => {
      const fileErrors = validateFile(f);
      if (fileErrors.length > 0) {
        errs.push(`${f.name}: ${fileErrors.join(", ")}`);
      }
    });

    if (errs.length > 0) {
      setLocalErrors(errs);
      setSelectedFiles([]);
      return;
    }

    setSelectedFiles(files);
  };

  const handleProcessUpload = async () => {
    if (selectedFiles.length === 0) return;
    setLocalErrors([]);

    try {
      if (selectedFiles.length === 1) {
        const res = await uploadFile(selectedFiles[0]);
        if (res.success) {
          setSelectedFiles([]);
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
          setLocalErrors([res.error || "Upload failed"]);
        }
      } else {
        const results = await Promise.all(selectedFiles.map((f) => uploadFile(f)));
        const failed = results.filter((r) => !r.success);
        if (failed.length > 0) {
          setLocalErrors(failed.map((f) => f.error));
        } else {
          setSelectedFiles([]);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      }
    } catch (err) {
      setLocalErrors([err.message || "Failed to upload"]);
    }
  };

  const removeSelectedFile = (idx) => {
    const updated = selectedFiles.filter((_, i) => i !== idx);
    setSelectedFiles(updated);
    if (updated.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden min-h-0 transition-colors">
      {/* 1. Header & Segmented Mode Switcher */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Source Notes</h2>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setTab("paste")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              tab === "paste"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Paste Text
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              tab === "upload"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Upload File
          </button>
        </div>
      </div>

      {/* Error Banners */}
      {(localErrors.length > 0 || apiError) && (
        <div className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-800/50 flex items-start gap-2 flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-rose-700 dark:text-rose-300 flex-1">
            {localErrors.length > 0 ? (
              localErrors.map((e, idx) => <p key={idx}>{e}</p>)
            ) : (
              <p>{apiError}</p>
            )}
          </div>
          <button
            onClick={() => setLocalErrors([])}
            className="text-rose-400 hover:text-rose-700 dark:hover:text-rose-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Scrollable Editor / Upload Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.300)_transparent] dark:[scrollbar-color:theme(colors.slate.700)_transparent]">
        {tab === "paste" ? (
          <textarea
            value={originalNotes}
            onChange={(e) => setOriginalNotes(e.target.value)}
            placeholder="Paste your lecture notes, article excerpts, transcript, or research text here..."
            className="w-full h-full min-h-[200px] p-4 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm leading-relaxed resize-none transition-all [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.300)_transparent] dark:[scrollbar-color:theme(colors.slate.700)_transparent]"
          />
        ) : (
          <div className="h-full flex flex-col justify-between gap-4">
            {/* Selected File list */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Selected Files ({selectedFiles.length})
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 [scrollbar-width:thin]">
                  {selectedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {file.name}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 text-2xs">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeSelectedFile(i)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-h-[180px] border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition group relative"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".txt,.md,.rtf,.csv,.tsv,.log,.json,.pdf,.docx,.doc,.jpg,.jpeg,.png,.webp,.bmp"
                className="hidden"
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Extracting & Summarizing...
                  </p>
                  <div className="w-36 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition">
                    <FileUp className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mt-3 font-semibold text-slate-800 dark:text-slate-100 text-sm">
                    {selectedFiles.length > 0
                      ? "Add more files"
                      : "Choose or drop files to summarize"}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                    PDF, Word (.docx), Plain Text (.txt, .md, .csv), or Images
                    (OCR)
                  </p>
                  <span className="mt-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Up to 15 MB per file
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Sticky Bottom Action Bar */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between gap-3 flex-shrink-0">
        {/* Stats / Clear */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} chars</span>
          {originalNotes && (
            <button
              onClick={clearNotes}
              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition flex items-center gap-1 ml-1 cursor-pointer"
              title="Clear all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {/* Primary CTA */}
        {tab === "paste" ? (
          <button
            onClick={generateSummary}
            disabled={!originalNotes.trim() || isGenerating || isUploading}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Summary</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleProcessUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  Upload & Summarize{" "}
                  {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
                </span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadNotes;
