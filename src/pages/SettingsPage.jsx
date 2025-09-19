import { useAuth } from "../context/AuthContext";
import { LogOut, User, Sun, Moon } from "lucide-react";
import { useState } from "react";

const SettingsPage = () => {
  const { user, isGuest, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile</h2>
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-gray-500" />
            <div>
              {user ? (
                <>
                  <p className="text-gray-900 font-medium">
                    {user.displayName || "Unnamed User"}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </>
              ) : isGuest ? (
                <p className="text-gray-700">Guest User</p>
              ) : (
                <p className="text-gray-500">Not signed in</p>
              )}
            </div>
          </div>
        </div>

        {/* Theme Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Appearance
          </h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {darkMode ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
          </button>
        </div>

        {/* Logout Section */}
        {(user || isGuest) && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Account
            </h2>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
