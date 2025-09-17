import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useUI } from "../context/UIContext";

const Layout = () => {
  const { sidebarExpanded, isMobile } = useUI();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Navbar at top */}
      <Navbar />
      
      {/* Content area below navbar */}
      <div className="flex overflow-hidden relative" style={{ height: 'calc(100vh - 64px)', marginTop: '64px' }}>
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content area */}
        <main 
          className={`flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out ${
            isMobile 
              ? 'ml-0' 
              : sidebarExpanded 
                ? 'ml-64'
                : 'ml-16'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;