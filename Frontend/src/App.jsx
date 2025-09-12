import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import { NotesProvider } from "./context/NotesContext";

function App() {
  return (
    <NotesProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </NotesProvider>
  );
}

export default App;
