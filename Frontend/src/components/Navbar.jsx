// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { Brain, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const { user, isGuest, logout, openAuthModal, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between h-16">
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

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <span className="text-sm text-gray-700 hidden md:inline">
                  {isGuest ? "Guest" : user.displayName || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </nav>
      <AuthModal />
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
