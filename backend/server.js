require('dotenv').config({ path: '../config/config.env' });
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { formidable } = require("formidable");
const axios = require("axios");
const dotenv = require("dotenv");
const FormData = require("form-data");

dotenv.config();
const app = express();
const PORT = process.env.BACKEND_PORT;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const USERS_PATH = path.join(__dirname, "users.json");
const USERS_FRONT_PATH = path.join(__dirname, "users.front.json");
const LOGS_PATH = path.join(__dirname, "logs", "actions.log");

app.post("/send", (req, res) => {
  const contentType = req.headers["content-type"] || "";

  if (contentType.includes("multipart/form-data")) {
    const form = formidable({ multiples: false, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Parse error (multipart):", err);
        return res.status(400).json({ error: "Upload failed" });
      }

      const message = fields.message?.[0] || fields.message;
      const channelId = fields.channelId?.[0] || fields.channelId;
      const token = fields.token?.[0] || fields.token;
      const file = files.file?.[0] || files.file;

      if (!token || !channelId || !message) {
        return res.status(400).json({ error: "Missing data (multipart)" });
      }

      const formData = new FormData();

      if (file && file.filepath) {
        const stream = fs.createReadStream(file.filepath);
        const filename = file.originalFilename || file.newFilename || "file.dat";

        formData.append("files[0]", stream, filename);
        formData.append("payload_json", JSON.stringify({
          content: message,
          attachments: [{ id: 0, filename }]
        }));
      } else {
        formData.append("payload_json", JSON.stringify({ content: message }));
      }

      try {
        await axios.post(`https://discord.com/api/v9/channels/${channelId}/messages`, formData, {
          headers: {
            ...formData.getHeaders(),
            Authorization: token
          }
        });

        console.log(`[SEND] multipart sent (file ${file?.filepath ? "included" : "omitted"})`);
        res.json({ success: true });
      } catch (err) {
        console.error("Discord error:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        res.status(500).json({ error: "Failed to send to Discord (multipart)" });
      }
    });
  } else {
    let body = "";
    req.on("data", chunk => { body += chunk.toString(); });

    req.on("end", async () => {
      try {
        const parsed = JSON.parse(body);
        const { message, channelId, token } = parsed;

        if (!token || !channelId || !message) {
          return res.status(400).json({ error: "Missing data (json)" });
        }

        await axios.post(`https://discord.com/api/v9/channels/${channelId}/messages`, {
          content: message
        }, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json"
          }
        });

        console.log(`[SEND] json sent`);
        res.json({ success: true });
      } catch (err) {
        console.error("Discord error:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        res.status(500).json({ error: "Failed to send to Discord (json)" });
      }
    });
  }
});

// --- Pozostałe endpointy bez zmian ---
app.post("/login-front", (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FRONT_PATH, "utf-8"));
  if (users[username] && users[username] === password) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

app.post("/admin-login", (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_PATH, "utf-8"));
  if (users[username] && users[username] === password) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

app.get("/logs", (req, res) => {
  const logs = fs.readFileSync(LOGS_PATH, "utf-8");
  res.type("text").send(logs);
});

app.get("/users", (req, res) => {
  const users = JSON.parse(fs.readFileSync(USERS_PATH, "utf-8"));
  res.json(users);
});

app.post("/users", (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_PATH, "utf-8"));
  users[username] = password;
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

app.delete("/users/:username", (req, res) => {
  const { username } = req.params;
  const users = JSON.parse(fs.readFileSync(USERS_PATH, "utf-8"));
  delete users[username];
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

app.put("/users/:username", (req, res) => {
  const { username } = req.params;
  const { password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_PATH, "utf-8"));
  users[username] = password;
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

app.get("/users-front", (req, res) => {
  const users = JSON.parse(fs.readFileSync(USERS_FRONT_PATH, "utf-8"));
  res.json(users);
});

app.post("/users-front", (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FRONT_PATH, "utf-8"));
  users[username] = password;
  fs.writeFileSync(USERS_FRONT_PATH, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

app.delete("/users-front/:username", (req, res) => {
  const { username } = req.params;
  const users = JSON.parse(fs.readFileSync(USERS_FRONT_PATH, "utf-8"));
  delete users[username];
  fs.writeFileSync(USERS_FRONT_PATH, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
