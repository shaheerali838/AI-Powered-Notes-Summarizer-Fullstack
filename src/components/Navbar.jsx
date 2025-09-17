import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import UserMenu from './UserMenu';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <nav className="navbar fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Brain className="h-6 w-6 text-primary-500" />
            <span>AI Notes Summarizer</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </nav>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};

export default Navbar;