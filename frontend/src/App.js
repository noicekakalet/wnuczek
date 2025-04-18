const backendUrl = `http://${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;
import React, { useState, useRef } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function App() {
  const navigate = useNavigate();
  const logout = () => {
    Cookies.remove("auth");
    navigate("/login");
  };

  const [message, setMessage] = useState("");
  const [channelId, setChannelId] = useState("");
  const [interval, setInterval] = useState(2000);
  const [file, setFile] = useState(null);
  const [accounts, setAccounts] = useState([
    {
      token: "",
      useToken: true,
      userAgent: "",
      useUserAgent: false,
      fingerprint: "",
      useFingerprint: false,
      proxy: "",
      useProxy: false,
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);

  const showToast = (text) => {
    const box = document.createElement("div");
    box.textContent = text;
    Object.assign(box.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "#333",
      color: "white",
      padding: "10px 16px",
      borderRadius: "8px",
      zIndex: 9999,
      fontSize: "14px",
      fontFamily: "sans-serif",
    });
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3000);
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const handleStart = async () => {
    const activeAccounts = accounts.filter((acc) => acc.useToken && acc.token);
    if (!channelId || activeAccounts.length === 0 || !message) {
      showToast("⚠️ Uzupełnij wymagane pola i konta");
      return;
    }

    console.log("✅ START clicked");
    setIsRunning(true);
    isRunningRef.current = true;

    let index = 0;

    while (isRunningRef.current) {
      const account = activeAccounts[index % activeAccounts.length];
      const form = new FormData();
      form.append("message", message);
      form.append("channelId", channelId);
      form.append("token", account.token);
      if (file) form.append("file", file);

      try {
        await axios.post(`${backendUrl}/send`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log(`✅ SENT by token ${account.token.slice(0, 10)}...`);
        await delay(interval);
      } catch (err) {
        const status = err.response?.status;
        const data = err.response?.data || {};
        const retryAfter = data.retry_after || 3000;
        const code = data.code;

        if (status === 429) {
          console.warn(
            `⏳ Cooldown for ${account.token.slice(0, 10)}... Retry after ${retryAfter}ms`
          );
          showToast(`⏳ Cooldown – retry za ${retryAfter}ms`);
          await delay(retryAfter);
        } else if (code === 200000) {
          console.warn("🚫 Treść zablokowana przez Discord. Pomijam...");
          showToast("🚫 Zablokowana wiadomość – pominięto");
          await delay(interval);
        } else if (code === 20016) {
          console.warn("📛 Tryb powolny (20016) – kontynuuję spam");
          showToast("📛 Tryb powolny – spamuję dalej");
          await delay(interval);
        } else {
          console.error(
            `❌ Błąd konta ${account.token.slice(0, 10)}:`,
            data || err.message
          );
          showToast(`❌ Błąd konta: ${account.token.slice(0, 6)}`);
          await delay(interval);
        }
      }

      index++;
    }
  };

  const handleStop = () => {
    isRunningRef.current = false;
    setIsRunning(false);
    showToast("⏹️ Zatrzymano");
  };

  const updateAccount = (i, field, value) => {
    const updated = [...accounts];
    updated[i][field] = value;
    setAccounts(updated);
  };

  const addAccount = () => {
    setAccounts([
      ...accounts,
      {
        token: "",
        useToken: true,
        userAgent: "",
        useUserAgent: false,
        fingerprint: "",
        useFingerprint: false,
        proxy: "",
        useProxy: false,
      },
    ]);
  };

  const removeAccount = (i) => {
    setAccounts(accounts.filter((_, idx) => idx !== i));
  };

  const inputStyle = {
    background: "#222",
    color: "#fff",
    border: "1px solid #444",
    padding: "6px",
    borderRadius: "6px",
    flex: 1,
  };

  const checkboxStyle = { marginRight: 6 };

  return (
    <div
      style={{
        background: "#111",
        color: "#fff",
        minHeight: "100vh",
        padding: 40,
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Discord Multi-Spammer</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 1000,
        }}
      >
        <textarea
          placeholder="Wiadomość"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "none", width: "100%" }}
        />

        <div>
          <label>Załącznik: </label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </div>

        <input
          placeholder="Interwał (ms)"
          type="number"
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          style={{ ...inputStyle, width: "100%" }}
        />

        <input
          placeholder="Channel ID"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          style={{ ...inputStyle, width: "100%" }}
        />

        <h3 style={{ marginTop: 20 }}>Konta:</h3>

        {accounts.map((acc, i) => (
          <div
            key={i}
            style={{
              background: "#1b1b1b",
              padding: 12,
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="checkbox"
                checked={acc.useToken}
                onChange={(e) =>
                  updateAccount(i, "useToken", e.target.checked)
                }
                style={checkboxStyle}
              />
              <input
                placeholder="Token"
                value={acc.token}
                onChange={(e) => updateAccount(i, "token", e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="checkbox"
                checked={acc.useUserAgent}
                onChange={(e) =>
                  updateAccount(i, "useUserAgent", e.target.checked)
                }
                style={checkboxStyle}
              />
              <input
                placeholder="User-Agent"
                value={acc.userAgent}
                onChange={(e) =>
                  updateAccount(i, "userAgent", e.target.value)
                }
                style={{ ...inputStyle, width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="checkbox"
                checked={acc.useFingerprint}
                onChange={(e) =>
                  updateAccount(i, "useFingerprint", e.target.checked)
                }
                style={checkboxStyle}
              />
              <input
                placeholder="Fingerprint"
                value={acc.fingerprint}
                onChange={(e) =>
                  updateAccount(i, "fingerprint", e.target.value)
                }
                style={{ ...inputStyle, width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="checkbox"
                checked={acc.useProxy}
                onChange={(e) =>
                  updateAccount(i, "useProxy", e.target.checked)
                }
                style={checkboxStyle}
              />
              <input
                placeholder="Proxy"
                value={acc.proxy}
                onChange={(e) => updateAccount(i, "proxy", e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
              />
            </div>
            <button
              onClick={() => removeAccount(i)}
              style={{
                background: "transparent",
                color: "red",
                border: "none",
                marginTop: 5,
                textAlign: "right",
                cursor: "pointer",
              }}
            >
              Usuń
            </button>
          </div>
        ))}

        <button
          onClick={addAccount}
          style={{
            padding: 10,
            borderRadius: 6,
            background: "#333",
            color: "#fff",
            border: "1px solid #555",
            cursor: "pointer",
          }}
        >
          + Dodaj konto
        </button>

        <button
          onClick={isRunning ? handleStop : handleStart}
          style={{
            padding: 10,
            borderRadius: 6,
            background: isRunning ? "#c62828" : "#2e7d32",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: 10,
          }}
        >
          {isRunning ? "🛑 Stop" : "▶️ Start"}
        </button>
      </div>
    </div>
  );
}
