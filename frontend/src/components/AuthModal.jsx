// src/components/AuthModal.jsx
import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AuthModal = () => {
  const {
    authModalOpen,
    authMode,
    setAuthMode,
    closeAuthModal,
    signInWithGoogle,
    signInWithFacebook,
    signInWithEmail,
    signUpWithEmail,
    continueAsGuest,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setError("");
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    closeAuthModal();
  };

  const formatAuthError = (err) => {
    const code = err?.code || "";
    const msg = err?.message || "";

    if (code === "auth/email-already-in-use" || msg.includes("email-already-in-use")) {
      return "An account with this email already exists. Please sign in instead.";
    }
    if (
      code === "auth/invalid-credential" ||
      code === "auth/wrong-password" ||
      code === "auth/user-not-found" ||
      msg.includes("invalid-credential")
    ) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (code === "auth/weak-password" || msg.includes("weak-password")) {
      return "Password must be at least 6 characters long.";
    }
    if (code === "auth/invalid-email" || msg.includes("invalid-email")) {
      return "Please enter a valid email address.";
    }
    if (code === "auth/popup-closed-by-user" || msg.includes("popup-closed-by-user")) {
      return "Sign-in cancelled (popup was closed).";
    }
    if (code === "auth/too-many-requests" || msg.includes("too-many-requests")) {
      return "Too many failed attempts. Please wait a few moments and try again.";
    }
    if (code === "auth/network-request-failed" || msg.includes("network-request-failed")) {
      return "Network error. Please check your internet connection.";
    }
    return (
      msg.replace(/^Firebase:\s*/i, "").replace(/\s*\(auth\/[^)]+\)\.?$/i, "") ||
      "Authentication failed. Please try again."
    );
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (authMode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
      handleClose();
    } catch (error) {
      setError(formatAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (authFunction) => {
    setLoading(true);
    setError("");

    try {
      await authFunction();
      handleClose();
    } catch (error) {
      setError(formatAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setLoading(true);
    setError("");

    try {
      await continueAsGuest();
      handleClose();
    } catch (error) {
      setError(formatAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setError("");
    setAuthMode(authMode === "login" ? "signup" : "login");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {authMode === "login" ? "Sign In" : "Create Account"}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {authMode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="e.g. Alex Smith"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                placeholder="name@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {loading
                ? "Please wait..."
                : authMode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <div className="my-5 flex items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="mx-3 text-slate-400 text-2xs font-bold uppercase tracking-wider">OR</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => handleSocialAuth(signInWithGoogle)}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-slate-50 dark:hover:bg-slate-750 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => handleSocialAuth(signInWithFacebook)}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-slate-50 dark:hover:bg-slate-750 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continue with Facebook</span>
            </button>

            <button
              onClick={handleGuestAuth}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-750 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Continue as Guest
            </button>
          </div>

          <div className="mt-5 text-center text-xs text-slate-600 dark:text-slate-400">
            {authMode === "login" ? (
              <p>
                Don't have an account?{" "}
                <button
                  onClick={switchMode}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                  disabled={loading}
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={switchMode}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                  disabled={loading}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
