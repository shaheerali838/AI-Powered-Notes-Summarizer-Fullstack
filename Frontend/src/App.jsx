import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import { NotesProvider } from "./context/NotesContext";
import { UIProvider } from "./context/UIContext";

function App() {
  return (
    <UIProvider>
      <NotesProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="about" element={<AboutPage />} />
            </Route>

            {/* Login page is outside Layout */}
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Router>
      </NotesProvider>
    </UIProvider>
  );
}

export default App;
