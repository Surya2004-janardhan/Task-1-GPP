const fs = require("fs");
const { generateTOTPCode } = require("./totp-utils");

function logCurrent2FACode() {
  try {
    // Use absolute path for Docker container
    const seedFile = "/data/seed.txt";

    if (!fs.existsSync(seedFile)) {
      console.error("Seed file not found");
      return;
    }

    const hexSeed = fs.readFileSync(seedFile, "utf8").trim();

    const code = generateTOTPCode(hexSeed);

    // Get UTC timestamp in format: YYYY-MM-DD HH:MM:SS
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const hours = String(now.getUTCHours()).padStart(2, "0");
    const minutes = String(now.getUTCMinutes()).padStart(2, "0");
    const seconds = String(now.getUTCSeconds()).padStart(2, "0");
    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const logLine = `${timestamp} - 2FA Code: ${code}\n`;

    process.stdout.write(logLine);
  } catch (error) {
    console.error("Error generating 2FA code:", error.message);
  }
}

if (require.main === module) {
  logCurrent2FACode();
}

module.exports = { logCurrent2FACode };
