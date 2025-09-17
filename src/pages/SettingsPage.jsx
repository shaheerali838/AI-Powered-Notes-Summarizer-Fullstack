import { useEffect } from 'react';
import { Settings } from 'lucide-react';

const SettingsPage = () => {
  useEffect(() => {
    document.title = 'AI Notes Summarizer - Settings';
  }, []);
  
  return (
    <div className="container mx-auto max-w-4xl h-full overflow-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-primary-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>
      
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-gray-700 mb-6">
          Customize your AI Notes Summarizer experience.
        </p>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Preferences</h3>
            <p className="text-gray-600">Settings will be available in future updates.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;