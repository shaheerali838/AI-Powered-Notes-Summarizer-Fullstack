import { useRef, useState } from 'react';
import { Upload, FileText, Image, AlertCircle } from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import { processFile, processMultipleFiles, validateFile, SUPPORTED_FILE_TYPES } from '../utils/fileProcessor';

const UploadNotes = () => {
  const { setOriginalNotes } = useNotes();
  const [uploadMethod, setUploadMethod] = useState('paste');
  const [textValue, setTextValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);
  
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setErrors([]);
    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      // Validate all files first
      const validationErrors = [];
      files.forEach(file => {
        const fileErrors = validateFile(file);
        if (fileErrors.length > 0) {
          validationErrors.push(`${file.name}: ${fileErrors.join(', ')}`);
        }
      });
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      // Process files
      if (files.length === 1) {
        const text = await processFile(files[0], setProcessingProgress);
        setTextValue(text);
        setOriginalNotes(text);
      } else {
        const results = await processMultipleFiles(files, setProcessingProgress);
        const successfulResults = results.filter(r => r.success);
        const failedResults = results.filter(r => !r.success);
        
        if (failedResults.length > 0) {
          setErrors(failedResults.map(r => `${r.fileName}: ${r.error}`));
        }
        
        if (successfulResults.length > 0) {
          const combinedText = successfulResults
            .map(r => `=== ${r.fileName} ===\n${r.text}`)
            .join('\n\n');
          setTextValue(combinedText);
          setOriginalNotes(combinedText);
        }
      }
    } catch (error) {
      setErrors([`Processing failed: ${error.message}`]);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleTextChange = (e) => {
    const value = e.target.value;
    setTextValue(value);
    setOriginalNotes(value);
    setErrors([]);
  };
  
  const getSupportedFormatsText = () => {
    const allFormats = [
      ...SUPPORTED_FILE_TYPES.text,
      ...SUPPORTED_FILE_TYPES.pdf,
      ...SUPPORTED_FILE_TYPES.image,
      ...SUPPORTED_FILE_TYPES.document
    ];
    return allFormats.join(', ');
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Upload className="h-5 w-5 text-primary-500" />
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
            className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300"
          />
          <label htmlFor="paste-option" className="text-gray-700 font-medium">Paste text</label>
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            id="file-option"
            type="radio"
            checked={uploadMethod === 'file'}
            onChange={() => setUploadMethod('file')}
            className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300"
          />
          <label htmlFor="file-option" className="text-gray-700 font-medium">Upload files</label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.rtf,.pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.docx"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
      
      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Upload Errors:</p>
              <ul className="mt-1 text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-1 flex flex-col">
        {uploadMethod === 'paste' ? (
          <textarea
            placeholder="Paste your notes here..."
            value={textValue}
            onChange={handleTextChange}
            className="w-full flex-1 min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-colors"
          />
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors relative">
              {isProcessing && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center rounded-lg">
                  <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-sm text-gray-600 mb-2">Processing files...</p>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-600 transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{processingProgress}%</p>
                </div>
              )}
              
              <button
                onClick={handleUploadClick}
                disabled={isProcessing}
                className="flex flex-col items-center gap-3 p-8 text-gray-600 hover:text-primary-500 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-8 w-8" />
                  <FileText className="h-6 w-6" />
                  <Image className="h-6 w-6" />
                </div>
                <span className="font-medium">Select files</span>
                <span className="text-sm text-gray-500 text-center max-w-xs">
                  Supports multiple files: {getSupportedFormatsText()}
                </span>
                <span className="text-xs text-gray-400">Max 10MB per file</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadNotes;