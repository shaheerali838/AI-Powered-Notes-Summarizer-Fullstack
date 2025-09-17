import { useNotes } from "../context/NotesContext";

const GenerateButton = () => {
  const { originalNotes, isGenerating, generateSummary, error } = useNotes();

  const handleGenerate = async () => {
    if (!originalNotes || isGenerating) return;
    await generateSummary();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleGenerate}
        disabled={!originalNotes || isGenerating}
        className={`px-8 py-4 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl 
          ${
            !originalNotes || isGenerating
              ? "bg-gray-400 cursor-not-allowed shadow-none transform-none"
              : "bg-primary-500 hover:bg-primary-600"
          }`}
      >
        {isGenerating ? (
          <span className="flex items-center gap-3">
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            Generating Summary...
          </span>
        ) : (
          "Generate Summary"
        )}
      </button>
      
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default GenerateButton;