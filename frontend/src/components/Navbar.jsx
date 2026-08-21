// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Brain,
  User,
  Menu,
  Sparkles,
  LogOut,
  Settings,
  History,
  FileText,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  LogIn,
  Info,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const { user, isGuest, logout, openAuthModal, isAuthenticated, loading } =
    useAuth();
  const { toggleSidebar } = useUI();
  const location = useLocation();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setProfileOpen(false);
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const handleOpenAuth = (mode = "login") => {
    setProfileOpen(false);
    openAuthModal(mode);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-5 md:px-6 flex items-center justify-between h-16 transition-all">
        {/* Left: Mobile Hamburger & Responsive Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer lg:hidden flex-shrink-0"
            aria-label="Toggle navigation menu"
            title="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo Branding */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition flex-shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight leading-none">
                <span className="inline sm:hidden">AI Notes</span>
                <span className="hidden sm:inline">AI Notes Summarizer</span>
              </span>
              <span className="text-3xs text-slate-400 font-medium hidden md:inline leading-none mt-1">
                Intelligent Study Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-slate-100/80 p-1 rounded-xl">
          <NavLink to="/" isActive={location.pathname === "/"}>
            Workspace
          </NavLink>
          <NavLink to="/history" isActive={location.pathname === "/history"}>
            History
          </NavLink>
          <NavLink to="/about" isActive={location.pathname === "/about"}>
            About
          </NavLink>
        </div>

        {/* Right: Auth / Clickable User Profile Modal Trigger */}
        <div className="relative flex items-center gap-2" ref={profileMenuRef}>
          {loading ? (
            <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
          ) : isAuthenticated ? (
            <>
              {/* Clickable Profile Trigger Button */}
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className={`flex items-center gap-2 p-1 sm:pr-2.5 rounded-full border transition-all cursor-pointer select-none ${
                  profileOpen
                    ? "bg-blue-50 border-blue-300 ring-2 ring-blue-500/20"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 shadow-2xs"
                }`}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                title="Open user profile menu"
              >
                {/* Avatar Icon */}
                <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs overflow-hidden shadow-2xs flex-shrink-0">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </div>

                {/* Name */}
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline max-w-[110px] truncate">
                  {isGuest
                    ? "Guest"
                    : user?.displayName || user?.email?.split("@")[0] || "User"}
                </span>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:inline ${
                    profileOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {/* ========================================================================= */}
              {/* PROFILE DROPDOWN MODAL / POPOVER                                          */}
              {/* ========================================================================= */}
              {profileOpen && (
                <div className="absolute right-0 top-11 w-64 sm:w-72 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col divide-y divide-slate-100">
                  {/* 1. Profile Identity Header */}
                  <div className="px-4 py-3 bg-slate-50/70">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0 overflow-hidden">
                        {user?.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                          {isGuest
                            ? "Guest User"
                            : user?.displayName || "Account User"}
                        </p>
                        <p className="text-2xs text-slate-400 truncate mt-0.5">
                          {isGuest
                            ? "Temporary Session"
                            : user?.email || "Signed In"}
                        </p>
                      </div>
                    </div>

                    {/* Account Type Badge */}
                    <div className="mt-2.5">
                      {isGuest ? (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 text-2xs">
                          <span>Guest Mode (Not synced)</span>
                          <button
                            onClick={() => handleOpenAuth("login")}
                            className="font-bold text-blue-700 hover:underline cursor-pointer ml-1"
                          >
                            Sign In
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-3xs font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Synced to Cloud</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Menu Links */}
                  <div className="py-1.5 px-1.5 space-y-0.5">
                    <ProfileMenuItem
                      to="/"
                      icon={<Brain className="w-4 h-4 text-blue-600" />}
                      label="Workspace Editor"
                      description="Create new notes & summaries"
                    />
                    <ProfileMenuItem
                      to="/history"
                      icon={<History className="w-4 h-4 text-slate-500" />}
                      label="Summary History"
                      description="View saved & past summaries"
                    />
                    <ProfileMenuItem
                      to="/settings"
                      icon={<Settings className="w-4 h-4 text-slate-500" />}
                      label="Settings"
                      description="Manage account & preferences"
                    />
                    <ProfileMenuItem
                      to="/about"
                      icon={<Info className="w-4 h-4 text-slate-500" />}
                      label="About App"
                      description="Version & documentation"
                    />
                  </div>

                  {/* 3. Sign Out Action */}
                  <div className="p-1.5 bg-slate-50/40">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      <span>Log Out of Account</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl transition cursor-pointer shadow-xs shadow-blue-500/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </nav>
      <AuthModal />
    </>
  );
};

const NavLink = ({ to, isActive, children }) => (
  <Link
    to={to}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
      isActive
        ? "bg-white text-blue-600 shadow-xs"
        : "text-slate-600 hover:text-slate-900"
    }`}
  >
    {children}
  </Link>
);

const ProfileMenuItem = ({ to, icon, label, description }) => (
  <Link
    to={to}
    className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100/80 transition group"
  >
    <div className="mt-0.5 flex-shrink-0">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-none">
        {label}
      </p>
      {description && (
        <p className="text-3xs text-slate-400 mt-1 leading-tight">{description}</p>
      )}
    </div>
  </Link>
);

export default Navbar;
