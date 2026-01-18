const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function generateRSAKeyPair() {
  console.log("🔐 Generating RSA 4096-bit key pair...");

  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicExponent: 65537,
    });

    const privateKeyPem = privateKey.export({
      type: "pkcs8",
      format: "pem",
    });

    const publicKeyPem = publicKey.export({
      type: "spki",
      format: "pem",
    });

    fs.writeFileSync(
      path.join(__dirname, "../keys/student_private.pem"),
      privateKeyPem,
    );
    console.log("✅ Private key saved to ../keys/student_private.pem");

    fs.writeFileSync(
      path.join(__dirname, "../keys/student_public.pem"),
      publicKeyPem,
    );
    console.log("✅ Public key saved to ../keys/student_public.pem");

    console.log(
      "\n⚠️  SECURITY WARNING: These keys will be committed to Git and become PUBLIC.",
    );
    console.log("   DO NOT reuse these keys for any other purpose!");
    console.log("   Generate new keys for any production use.");
  } catch (error) {
    console.error("❌ Error generating key pair:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  generateRSAKeyPair();
}

module.exports = { generateRSAKeyPair };
