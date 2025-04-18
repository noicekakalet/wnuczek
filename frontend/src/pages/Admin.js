const backendUrl = `http://${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;
import React, { useState, useEffect } from "react";
import axios from "axios";

const Admin = () => {
  const [auth, setAuth] = useState(false);
  const [logs, setLogs] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState({});
  const [usersFront, setUsersFront] = useState({});
  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");
  const [editPass, setEditPass] = useState({});

  const backendBase = process.env.REACT_APP_BACKEND_URL;

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${backendBase}/users`);
      setUsers(res.data);
      const resFront = await axios.get(`${backendBase}/users-front`);
      setUsersFront(resFront.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (auth) {
      fetchUsers();
      axios.get(`${backendBase}/logs`).then((res) => {
        setLogs(res.data);
      });
    }
  }, [auth]);

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${backendBase}/admin-login`, {
        username,
        password,
      });
      if (res.data.success) {
        setAuth(true);
      } else {
        alert("Błędny login lub hasło");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleAddUser = async () => {
    try {
      await axios.post(`${backendBase}/users`, {
        username: newUser,
        password: newPass,
      });
      setNewUser("");
      setNewPass("");
      fetchUsers();
    } catch (err) {
      console.error("Add user error:", err);
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      await axios.delete(`${backendBase}/users/${user}`);
      fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  const handleUpdatePassword = async (user) => {
    try {
      await axios.put(`${backendBase}/users/${user}`, {
        password: editPass[user],
      });
      setEditPass((prev) => ({ ...prev, [user]: "" }));
      fetchUsers();
    } catch (err) {
      console.error("Update password error:", err);
    }
  };

  if (!auth) {
    return (
      <div style={{ padding: 20, color: "white" }}>
        <h2>Admin Login</h2>
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>Admin Panel</h2>

      <h3>Dodaj użytkownika</h3>
      <input
        placeholder="Nazwa użytkownika"
        value={newUser}
        onChange={(e) => setNewUser(e.target.value)}
      />
      <input
        placeholder="Hasło"
        value={newPass}
        onChange={(e) => setNewPass(e.target.value)}
      />
      <button onClick={handleAddUser}>Dodaj</button>

      <h3>Użytkownicy</h3>
      {Object.keys(users).map((user) => (
        <div key={user}>
          <b>{user}</b>
          <input
            placeholder="Nowe hasło"
            value={editPass[user] || ""}
            onChange={(e) =>
              setEditPass((prev) => ({ ...prev, [user]: e.target.value }))
            }
          />
          <button onClick={() => handleUpdatePassword(user)}>Zmień hasło</button>
          <button onClick={() => handleDeleteUser(user)}>Usuń</button>
        </div>
      ))}

      <h3>Użytkownicy frontowi</h3>
      {Object.keys(usersFront).map((user) => (
        <div key={user}>
          <span>{user}</span>
        </div>
      ))}

      <h3>Logi</h3>
      <pre style={{ background: "#111", padding: 10, whiteSpace: "pre-wrap" }}>
        {logs}
      </pre>
    </div>
  );
};

export default Admin;
