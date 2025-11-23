import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    setError(null);
    if (user === "Vishwa" && pass === "1234") {
      onLogin();
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="logo">SafeCyl</div>
        <h2>Sign in to dashboard</h2>
        <form onSubmit={submit} className="login-form">
          <label>
            Username
            <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Vishwa" />
          </label>
          <label>
            Password
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="1234" />
          </label>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn-primary">Login</button>
        </form>
      </div>
    </div>
  );
}
