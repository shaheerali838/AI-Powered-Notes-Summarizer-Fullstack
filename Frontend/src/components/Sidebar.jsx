import { Link } from 'react-router-dom';
import { PlusCircle, History, Settings } from 'lucide-react';
import { useNotes } from '../context/NotesContext';

const Sidebar = () => {
  const { clearNotes } = useNotes();
  
  const handleNewSummary = () => {
    clearNotes();
  };
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
      <div className="p-4 space-y-4">
        <Link 
          to="/" 
          onClick={handleNewSummary}
          className="flex items-center gap-2 w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5" />
          <span className="font-medium">New Summary</span>
        </Link>
        
        <nav className="space-y-1">
          <SidebarLink to="/history" icon={<History className="h-5 w-5" />} label="History" />
          <SidebarLink to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
        </nav>
      </div>
    </aside>
  );
};

const SidebarLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

export default Sidebar;