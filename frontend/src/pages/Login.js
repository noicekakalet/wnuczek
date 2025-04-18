const backendUrl = `http://${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await axios.post(`${backendUrl}/login-front`, { username, password });
      Cookies.set("auth", "true", { expires: 7 }); // zapamiętaj na 7 dni
      navigate("/");
    } catch {
      alert("Nieprawidłowe dane logowania");
    }
  };

  return (
    <div style={{
      background: "#111", color: "#fff", minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
    }}>
      <h2>Zaloguj się</h2>
      <input placeholder="Login" onChange={e => setUsername(e.target.value)} style={{ margin: 5, padding: 8 }} />
      <input placeholder="Hasło" type="password" onChange={e => setPassword(e.target.value)} style={{ margin: 5, padding: 8 }} />
      <button onClick={handleLogin} style={{ padding: 10 }}>Zaloguj</button>
    </div>
  );
}