import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";
import AboutPage from "./pages/AboutPage";
import { NotesProvider } from "./context/NotesContext";
import { UIProvider } from "./context/UIContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <NotesProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="about" element={<AboutPage />} />
              </Route>
            </Routes>
          </Router>
        </NotesProvider>
      </UIProvider>
    </AuthProvider>
  );
}

export default App;
