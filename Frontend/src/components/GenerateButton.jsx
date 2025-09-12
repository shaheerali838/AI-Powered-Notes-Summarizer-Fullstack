import { useNotes } from "../context/NotesContext";

const GenerateButton = () => {
  const { originalNotes, isGenerating, generateSummary, error } = useNotes();

  const handleGenerate = async () => {
    if (!originalNotes || isGenerating) return;

    // Use the generateSummary function from context which now calls the backend
    await generateSummary();
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={!originalNotes || isGenerating}
      className={`px-8 py-3 rounded-lg text-white font-medium transition-all transform hover:translate-y-[-2px] 
        ${
          !originalNotes || isGenerating
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
        }`}
    >
      {isGenerating ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          Generating...
        </span>
      ) : (
        "Generate Summary"
      )}
    </button>
  );
};

export default GenerateButton;
