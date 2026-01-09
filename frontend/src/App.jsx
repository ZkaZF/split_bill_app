import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GroupPage from "./pages/GroupPage";

function App() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div className="app">
      {/* Dark Mode Toggle */}
      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} title={darkMode ? "Light Mode" : "Dark Mode"}>
        {darkMode ? "☀️" : "🌙"}
      </button>

      <Routes>
        {/* Halaman utama - buat grup baru */}
        <Route path="/" element={<HomePage />} />

        {/* Halaman grup - lihat detail & tambah expense */}
        <Route path="/group/:code" element={<GroupPage />} />
      </Routes>
    </div>
  );
}

export default App;
