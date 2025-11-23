import React, { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";

// API base can be overridden with VITE_API_BASE; otherwise default to localhost:3000
export const API_BASE = import.meta.env.VITE_API_BASE || "https://safecyl-server-1.onrender.com";

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem("safecyl_authed") === "1");

  const handleLogin = () => {
    localStorage.setItem("safecyl_authed", "1");
    setAuthed(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("safecyl_authed");
    setAuthed(false);
  };

  return authed ? (
    <Dashboard apiBase={API_BASE} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}
