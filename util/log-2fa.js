const fs = require("fs");
const path = require("path");
const { generateTOTPCode } = require("./totp-utils");

function logCurrent2FACode() {
  try {
    const seedFile = path.join(__dirname, "../data/seed.txt");

    if (!fs.existsSync(seedFile)) {
      console.error("Seed file not found");
      return;
    }

    const hexSeed = fs.readFileSync(seedFile, "utf8").trim();

    const code = generateTOTPCode(hexSeed);

    const now = new Date();
    const timestamp = now.toISOString().replace("T", " ").substring(0, 19);

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
