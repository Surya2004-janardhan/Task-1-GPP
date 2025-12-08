const crypto = require("crypto");
const fs = require("fs");

/**
 * Generate RSA 4096-bit key pair with public exponent 65537
 * Saves to student_private.pem and student_public.pem
 */
function generateRSAKeyPair() {
  console.log("🔐 Generating RSA 4096-bit key pair...");

  try {
    // Generate key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096, // 4096 bits as required
      publicExponent: 65537, // Standard public exponent
    });

    // Export to PEM format
    const privateKeyPem = privateKey.export({
      type: "pkcs8",
      format: "pem",
    });

    const publicKeyPem = publicKey.export({
      type: "spki",
      format: "pem",
    });

    // Save private key
    fs.writeFileSync("student_private.pem", privateKeyPem);
    console.log("✅ Private key saved to student_private.pem");

    // Save public key
    fs.writeFileSync("student_public.pem", publicKeyPem);
    console.log("✅ Public key saved to student_public.pem");

    console.log(
      "\n⚠️  SECURITY WARNING: These keys will be committed to Git and become PUBLIC."
    );
    console.log("   DO NOT reuse these keys for any other purpose!");
    console.log("   Generate new keys for any production use.");
  } catch (error) {
    console.error("❌ Error generating key pair:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateRSAKeyPair();
}

module.exports = { generateRSAKeyPair };
