const fs = require("fs");
const path = require("path");
const { loadPrivateKey, decryptSeed } = require("./crypto-utils");

/**
 * Test decryption of the encrypted seed
 */
function testDecryption() {
  try {
    console.log("🧪 Testing seed decryption...");

    // Read encrypted seed
    const encryptedSeed = fs
      .readFileSync(path.join(__dirname, "../keys/encrypted_seed.txt"), "utf8")
      .trim()
      .replace(/^"|"$/g, "");
    console.log("📖 Read encrypted seed");

    // Load private key
    const privateKey = loadPrivateKey();
    console.log("🔑 Loaded private key");

    // Decrypt seed
    const hexSeed = decryptSeed(encryptedSeed, privateKey);
    console.log(`✅ Decryption successful! Hex seed: ${hexSeed}`);

    // Ensure data directory exists
    const DATA_DIR = "./data";
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Save to local file for testing
    fs.writeFileSync("./data/seed.txt", hexSeed);
    console.log("💾 Saved decrypted seed to ./data/seed.txt");

    return hexSeed;
  } catch (error) {
    console.error("❌ Decryption test failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testDecryption();
}

module.exports = { testDecryption };
