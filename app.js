const express = require("express");
const fs = require("fs");
const path = require("path");

const { loadPrivateKey, decryptSeed } = require("./crypto-utils");
const {
  generateTOTPCode,
  verifyTOTPCode,
  getRemainingSeconds,
} = require("./totp-utils");

const app = express();
const PORT = 8080;

// Middleware
app.use(express.json());

// Paths for persistent storage
const DATA_DIR = "/data";
const SEED_FILE = path.join(DATA_DIR, "seed.txt");

/**
 * POST /decrypt-seed
 * Accept base64-encoded encrypted seed, decrypt using student private key,
 * store persistently at /data/seed.txt
 */
app.post("/decrypt-seed", (req, res) => {
  try {
    const { encrypted_seed } = req.body;

    if (!encrypted_seed || typeof encrypted_seed !== "string") {
      return res
        .status(400)
        .json({ error: "Missing or invalid encrypted_seed" });
    }

    console.log("🔓 Decrypting seed...");

    // Load private key
    const privateKey = loadPrivateKey();

    // Decrypt seed
    const hexSeed = decryptSeed(encrypted_seed, privateKey);

    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Save seed to persistent storage
    fs.writeFileSync(SEED_FILE, hexSeed, "utf8");

    console.log("✅ Seed decrypted and saved to persistent storage");

    res.json({ status: "ok" });
  } catch (error) {
    console.error("❌ Decryption error:", error.message);
    res.status(500).json({ error: "Decryption failed" });
  }
});

/**
 * GET /generate-2fa
 * Read seed from persistent storage, generate current TOTP code,
 * calculate remaining validity seconds
 */
app.get("/generate-2fa", (req, res) => {
  try {
    // Check if seed file exists
    if (!fs.existsSync(SEED_FILE)) {
      return res.status(500).json({ error: "Seed not decrypted yet" });
    }

    // Read hex seed
    const hexSeed = fs.readFileSync(SEED_FILE, "utf8").trim();

    // Generate TOTP code
    const code = generateTOTPCode(hexSeed);

    // Calculate remaining seconds
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

/**
 * POST /verify-2fa
 * Accept {"code": "123456"}, verify against stored seed with ±1 period tolerance
 */
app.post("/verify-2fa", (req, res) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Missing code" });
    }

    // Check if seed file exists
    if (!fs.existsSync(SEED_FILE)) {
      return res.status(500).json({ error: "Seed not decrypted yet" });
    }

    // Read hex seed
    const hexSeed = fs.readFileSync(SEED_FILE, "utf8").trim();

    // Verify TOTP code with ±1 period tolerance
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

// Health check endpoint (optional but recommended)
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Authentication microservice running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
