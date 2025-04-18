import fs from "fs";
const logDir = "./backend/logs";
const logFile = logDir + "/actions.log";

// Upewnij się, że folder i plik logów istnieje
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
if (!fs.existsSync(logFile)) fs.writeFileSync(logFile, "");

export function logAction(action, ip, browser, username = "unknown") {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${action} | User: ${username} | IP: ${ip} | Browser: ${browser}\n`;
    fs.appendFileSync(logFile, entry);
}