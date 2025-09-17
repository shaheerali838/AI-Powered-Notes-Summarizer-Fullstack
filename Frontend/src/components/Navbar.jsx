import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import UserMenu from './UserMenu';

const Navbar = () => {
  const { isAuthenticated, isGuest } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between h-16">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Brain className="h-6 w-6 text-[#4F88FF]" />
          <span>AI Notes Summarizer</span>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center space-x-6">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/history">History</NavLink>
        <NavLink to="/about">About</NavLink>
      </div>
      
        <div className="flex items-center gap-3">
          {isAuthenticated || isGuest ? (
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

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-gray-600 hover:text-[#4F88FF] font-medium transition-colors"
  >
    {children}
  </Link>
);

export default Navbar;