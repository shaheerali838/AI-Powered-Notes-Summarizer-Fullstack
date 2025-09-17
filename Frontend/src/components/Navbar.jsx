// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { Brain } from "lucide-react";
import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext"; // ✅ import auth context
import { useState } from "react";
import UserMenu from "./UserMenu"; // make sure you have this component
import LoginModal from "./LoginModal"; // make sure you have this component

const Navbar = () => {
  const { sidebarExpanded, isMobile } = useUI();
  const { isAuthenticated, isGuest } = useAuth(); // ✅ get from AuthContext
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <nav
        className={`bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between transition-all duration-300 ${
          isMobile ? "pl-4" : sidebarExpanded ? "pl-72" : "pl-24"
        }`}
      >
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-semibold text-gray-900"
          >
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
