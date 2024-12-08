import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const response = await fetch("http://localhost:6767/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      // Store the username in sessionStorage
      sessionStorage.setItem("username", data.username);

      // Update your user state accordingly
      setUser({ username: data.username });

      alert(`Welcome ${data.username}`);
      navigate("/chatroom");
    } else {
      alert("Login failed. Check your credentials.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <p>
        Don't have an account?{" "}
        <button onClick={() => navigate("/signup")}>Sign Up</button>
      </p>
    </div>
  );
}

export default Login;
