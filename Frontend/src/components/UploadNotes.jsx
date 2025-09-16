import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useNotes } from '../context/NotesContext';

const UploadNotes = () => {
  const { setOriginalNotes } = useNotes();
  const [uploadMethod, setUploadMethod] = useState('paste');
  const [textValue, setTextValue] = useState('');
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      setTextValue(text);
      setOriginalNotes(text);
    };
    
    reader.readAsText(file);
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleTextChange = (e) => {
    const value = e.target.value;
    setTextValue(value);
    setOriginalNotes(value);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Upload className="h-5 w-5 text-[#4F88FF]" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Upload Notes</h2>
      </div>
      
      {/* Upload Options */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-3">
          <input
            id="paste-option"
            type="radio"
            checked={uploadMethod === 'paste'}
            onChange={() => setUploadMethod('paste')}
            className="h-4 w-4 text-[#4F88FF] focus:ring-[#4F88FF] border-gray-300"
          />
          <label htmlFor="paste-option" className="text-gray-700 font-medium">Paste text</label>
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            id="file-option"
            type="radio"
            checked={uploadMethod === 'file'}
            onChange={() => setUploadMethod('file')}
            className="h-4 w-4 text-[#4F88FF] focus:ring-[#4F88FF] border-gray-300"
          />
          <label htmlFor="file-option" className="text-gray-700 font-medium">Upload .txt or .pdf</label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-1 flex flex-col">
        {uploadMethod === 'paste' ? (
          <textarea
            placeholder="Paste your notes here..."
            value={textValue}
            onChange={handleTextChange}
            className="w-full flex-1 min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F88FF] focus:border-[#4F88FF] resize-none transition-colors"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-[#4F88FF] transition-colors">
            <button
              onClick={handleUploadClick}
              className="flex flex-col items-center gap-3 p-8 text-gray-600 hover:text-[#4F88FF] transition-colors"
            >
              <Upload className="h-8 w-8" />
              <span className="font-medium">Select file</span>
              <span className="text-sm text-gray-500">Supports .txt and .pdf files</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadNotes;