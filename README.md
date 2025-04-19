# 💥 VACRECORD – Discord Multi-Spammer

> Project by [ggaappa](https://github.com/ggaappa) and [kamixon131](https://github.com/kamixon131)

VACRECORD is a powerful tool for testing Discord's messaging limits – perfect for bug bounty, pentesting, and stress-testing. From a clean web panel, you can control multiple accounts and send messages automatically with full flexibility.

---

## ✨ Features

- 🔁 **Spam using multiple Discord accounts** (user tokens)
- ⏱️ **Loop & interval control** – set how often messages are sent
- 📎 **Attachment support** – send images, files, and more
- 🔐 **Login and session system**
- 🧊 **Anti-cooldown handling** – detects 429 errors and continues spamming
- ⚙️ **Two `.env` `config.env` config files** for full setup (IP, ports, etc.)
- 🌐 **React frontend + Node.js (Express) backend**

---

## 🧰 Requirements

- Node.js 
- MongoDB 
- Yarn or npm
- Discord user tokens

---

## 🚀 Installation

```bash
git clone https://github.com/noicekakalet/VACRECORD.git
cd backend #for backend
npm i
npm install dotenv
npm install form-data
npm run start

cd frontend #for frontend
npm i 
npm install react-router-dom
npm install js-cookie
npm run start
```

---

## 🖥️ Project Structure

```
VACRECORD/
├── backend/         # Express logic, spam system
├── frontend/        # React UI panel
├── config.env       # central configuration
```

---

## 🔑 Licensing System (optional)

A license system (to enable premium access) includes:
- License key (e.g., distributed via Discord server)
- Account registration with email + hCaptcha
- MongoDB for storing users and license durations

---

## 🤝 Authors

- 🧠 [ggaappa](https://github.com/ggaappa) – frontend, backend, spam logic
- 🛠️ [kamixon131](https://github.com/kamixon131) – backend, license system, integrations

---

## ⚠️ Disclaimer

This project is for **educational and testing purposes only**. We are not responsible for unauthorized use. Respect Discord's Terms of Service and do not abuse the power of VACRECORD!
