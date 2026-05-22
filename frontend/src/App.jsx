import { useState, useEffect, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GroupPage from "./pages/GroupPage";
import AnimatedThemeToggler from "./components/AnimatedThemeToggler";

function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true; // default dark
  });

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove("light");
    } else {
      document.body.classList.add("light");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const handleToggle = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  return (
    <div className="app">
      <AnimatedThemeToggler
        isDark={isDark}
        onToggle={handleToggle}
        variant="circle"
        duration={500}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/group/:code" element={<GroupPage isDarkMode={isDark} />} />
      </Routes>
    </div>
  );
}

export default App;
