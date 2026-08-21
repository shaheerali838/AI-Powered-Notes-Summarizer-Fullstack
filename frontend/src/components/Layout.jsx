import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useUI } from "../context/UIContext";

const Layout = () => {
  const { sidebarExpanded, isMobile } = useUI();

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
      {/* 1. Fixed Top Navbar */}
      <Navbar />

      {/* 2. Content Viewport Container below Navbar (64px) */}
      <div className="flex-1 flex overflow-hidden relative mt-16">
        {/* Fixed Left Sidebar */}
        <Sidebar />

        {/* 3. Main Workspace Area (locked to viewport, independent internal scrolling) */}
        <main
          className={`flex-1 h-[calc(100vh-4rem)] overflow-hidden transition-all duration-300 ease-in-out p-3 sm:p-4 md:p-6 ${
            isMobile ? "ml-0" : sidebarExpanded ? "ml-64" : "ml-16"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
