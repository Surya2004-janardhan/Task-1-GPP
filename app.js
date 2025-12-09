const express = require("express");
const fs = require("fs");
const path = require("path");

const { loadPrivateKey, decryptSeed } = require("./util/crypto-utils");
const {
  generateTOTPCode,
  verifyTOTPCode,
  getRemainingSeconds,
} = require("./util/totp-utils");

const app = express();
const PORT = 8080;

app.use(express.json());

const DATA_DIR = "./data";
const SEED_FILE = path.join(DATA_DIR, "seed.txt");

app.post("/decrypt-seed", (req, res) => {
  try {
    const { encrypted_seed } = req.body;

    if (!encrypted_seed || typeof encrypted_seed !== "string") {
      return res
        .status(400)
        .json({ error: "Missing or invalid encrypted_seed" });
    }

    console.log("🔓 Decrypting seed...");

    const privateKey = loadPrivateKey();

    const hexSeed = decryptSeed(encrypted_seed, privateKey);

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    fs.writeFileSync(SEED_FILE, hexSeed, "utf8");

    console.log("✅ Seed decrypted and saved to persistent storage");

    res.json({ status: "ok" });
  } catch (error) {
    console.error("❌ Decryption error:", error.message);
    res.status(500).json({ error: "Decryption failed" });
  }
});
// tested
app.get("/generate-2fa", (req, res) => {
  try {
    if (!fs.existsSync(SEED_FILE)) {
      return res.status(500).json({ error: "Seed not decrypted yet" });
    }

    const hexSeed = fs.readFileSync(SEED_FILE, "utf8").trim();

    const code = generateTOTPCode(hexSeed);

    const validFor = getRemainingSeconds();

    console.log(`🔢 Generated 2FA code: ${code} (valid for ${validFor}s)`);

    res.json({
      code: code,
      valid_for: validFor,
    });
  } catch (error) {
    console.error("❌ 2FA generation error:", error.message);
    res.status(500).json({ error: "Seed not decrypted yet" });
  }
});

app.post("/verify-2fa", (req, res) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Missing code" });
    }

    if (!fs.existsSync(SEED_FILE)) {
      return res.status(500).json({ error: "Seed not decrypted yet" });
    }

    const hexSeed = fs.readFileSync(SEED_FILE, "utf8").trim();

    const isValid = verifyTOTPCode(hexSeed, code, 1);

    console.log(
      `🔍 Verified 2FA code: ${code} -> ${isValid ? "valid" : "invalid"}`
    );

    res.json({ valid: isValid });
  } catch (error) {
    console.error("❌ 2FA verification error:", error.message);
    res.status(500).json({ error: "Seed not decrypted yet" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
