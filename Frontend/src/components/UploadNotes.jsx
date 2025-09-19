import { useRef, useState } from 'react';
import { Upload, FileText, Image, AlertCircle, X } from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import { validateFile, SUPPORTED_FILE_TYPES } from '../utils/fileProcessor';

const UploadNotes = () => {
  const { setOriginalNotes, uploadFile, isUploading, uploadProgress } = useNotes();
  const [uploadMethod, setUploadMethod] = useState('paste');
  const [textValue, setTextValue] = useState('');
  const [errors, setErrors] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setErrors([]);
    setSelectedFiles(files);
    
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
      setSelectedFiles([]);
      return;
    }
  };
  
  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      setErrors([]);
      
      if (selectedFiles.length === 1) {
        const result = await uploadFile(selectedFiles[0]);
        if (result.success) {
          setTextValue(result.data.extractedText);
          setOriginalNotes(result.data.extractedText);
          setSelectedFiles([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          setErrors([result.error]);
        }
      } else {
        // Handle multiple files
        const results = await Promise.all(
          selectedFiles.map(file => uploadFile(file))
        );
        
        const successfulResults = results.filter(r => r.success);
        const failedResults = results.filter(r => !r.success);
        
        if (failedResults.length > 0) {
          setErrors(failedResults.map(r => r.error));
        }
        
        if (successfulResults.length > 0) {
          const combinedText = successfulResults
            .map(r => `=== ${r.data.filename} ===\n${r.data.extractedText}`)
            .join('\n\n');
          setTextValue(combinedText);
          setOriginalNotes(combinedText);
          setSelectedFiles([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      }
    } catch (error) {
      setErrors([`Upload failed: ${error.message}`]);
    }
  };
  
  const removeSelectedFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = '';
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
            className="w-full flex-1 min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F88FF] focus:border-[#4F88FF] resize-none transition-colors"
          />
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Selected Files Display */}
            {selectedFiles.length > 0 && (
              <div className="mb-4 space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Selected Files:</h3>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeSelectedFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleUploadFiles}
                  disabled={isUploading}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
                </button>
              </div>
            )}
            
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-[#4F88FF] transition-colors relative">
              {isUploading && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center rounded-lg">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-sm text-gray-600 mb-2">Uploading and processing...</p>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{uploadProgress}%</p>
                </div>
              )}
              
            <button
              onClick={handleUploadClick}
                disabled={isUploading}
                className="flex flex-col items-center gap-3 p-8 text-gray-600 hover:text-[#4F88FF] transition-colors disabled:opacity-50"
            >
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-8 w-8" />
                  <FileText className="h-6 w-6" />
                  <Image className="h-6 w-6" />
                </div>
                <span className="font-medium">{selectedFiles.length > 0 ? 'Select more files' : 'Select files'}</span>
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