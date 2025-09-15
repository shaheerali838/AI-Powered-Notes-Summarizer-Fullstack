import { Sparkles, Copy } from "lucide-react";
import { useState } from "react";
import { useNotes } from "../context/NotesContext";

const SummaryDisplay = () => {
  const { summaryOutput, isGenerating } = useNotes();
  const [copied, setCopied] = useState(false);

  const summaryText = summaryOutput?.summary || "";
  let keyPoints = summaryOutput?.keyPoints || [];

  // Remove unwanted heading lines if present
  if (keyPoints.length && keyPoints[0].includes("Re-Summarized")) {
    keyPoints = keyPoints.slice(1);
  }

  // Copy summary + key points
  const handleCopy = () => {
    if (!summaryText) return;
    let textToCopy = summaryText;
    if (keyPoints.length > 0) {
      textToCopy += "\n\nKey Points:\n" + keyPoints.join("\n");
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert numbered flat list into nested tree
  const buildTree = (points) => {
    const root = [];
    const stack = [{ level: 0, children: root }];

    points.forEach((point) => {
      const match = point.match(/^(\d+(\.\d+)*)\s/);
      const level = match ? match[1].split(".").length : 1;
      const node = { text: point, children: [] };

      while (stack.length > level) stack.pop();
      stack[stack.length - 1].children.push(node);
      stack.push({ level, children: node.children });
    });

    return root;
  };

  // Recursively render tree
  const renderTree = (nodes) => (
    <ol className="list-decimal ml-6 space-y-1">
      {nodes.map((node, i) => (
        <li key={i}>
          {node.text}
          {node.children.length > 0 && renderTree(node.children)}
        </li>
      ))}
    </ol>
  );

  const tree = buildTree(keyPoints);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Summarized Output
        </h2>
      </div>

      {/* Content */}
      <div className="mt-4 h-[calc(100%-3rem)] overflow-auto space-y-4">
        {isGenerating ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : summaryText ? (
          <div className="text-gray-700 whitespace-pre-line">
            <h3 className="text-md font-semibold mb-2">Summary</h3>
            <p className="mb-4">{summaryText}</p>

            {tree.length > 0 && (
              <div>
                <h3 className="text-md font-semibold mb-2">Key Points</h3>
                {renderTree(tree)}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
            <div className="h-4 bg-gray-100 rounded w-4/6"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
          </div>
        )}
      </div>

      {/* Copy Button */}
      {summaryText && (
        <button
          onClick={handleCopy}
          className="absolute bottom-6 right-6 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      )}
    </div>
  );
};

export default SummaryDisplay;
