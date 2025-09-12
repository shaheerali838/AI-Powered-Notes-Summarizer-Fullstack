import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useNotes } from '../context/NotesContext';

const UploadNotes = () => {
  const { setOriginalNotes } = useNotes();
  const [uploadMethod, setUploadMethod] = useState('paste');
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      setOriginalNotes(text);
    };
    
    reader.readAsText(file);
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center justify-center">
      <div className="mb-6">
        <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
          <Upload className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-900 mb-1">Upload Notes</h2>
      </div>
      
      <div className="w-full max-w-sm space-y-4">
        <div className="flex items-center space-x-2">
          <input
            id="paste-option"
            type="radio"
            checked={uploadMethod === 'paste'}
            onChange={() => setUploadMethod('paste')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <label htmlFor="paste-option" className="text-gray-700">Paste text</label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            id="file-option"
            type="radio"
            checked={uploadMethod === 'file'}
            onChange={() => setUploadMethod('file')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <label htmlFor="file-option" className="text-gray-700">Upload .txt or .pdf</label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        
        {uploadMethod === 'paste' ? (
          <textarea
            placeholder="Paste your notes here..."
            onChange={(e) => setOriginalNotes(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        ) : (
          <button
            onClick={handleUploadClick}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Select file
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadNotes;