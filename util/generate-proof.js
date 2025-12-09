const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const {
  loadPrivateKey,
  signMessage,
  encryptWithPublicKey,
} = require("./crypto-utils");

function loadInstructorPublicKey() {
  try {
    const publicKeyPem = fs.readFileSync(
      path.join(__dirname, "../keys/instructor_public.pem"),
      "utf8"
    );
    return crypto.createPublicKey(publicKeyPem);
  } catch (error) {
    throw new Error(`Failed to load instructor public key: ${error.message}`);
  }
}

function generateCommitProof(commitHash) {
  try {
    console.log("🔐 Generating commit proof...");

    const privateKey = loadPrivateKey();
    console.log("✅ Loaded student private key");

    const signature = signMessage(commitHash, privateKey);
    console.log("✅ Signed commit hash with RSA-PSS-SHA256");

    const instructorPublicKey = loadInstructorPublicKey();
    console.log("✅ Loaded instructor public key");

    const encryptedSignature = encryptWithPublicKey(
      signature,
      instructorPublicKey
    );
    console.log("✅ Encrypted signature with RSA/OAEP-SHA256");

    const base64Signature = encryptedSignature.toString("base64");
    console.log("✅ Encoded to base64");

    return {
      commitHash,
      encryptedSignature: base64Signature,
    };
  } catch (error) {
    console.error("❌ Failed to generate commit proof:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  const commitHash =
    process.argv[2] || "d18060a4daec882f242ac1ab8b4bc0b7d0811e93";
  const proof = generateCommitProof(commitHash);

  console.log("\n📋 Commit Proof:");
  console.log("Commit Hash:", proof.commitHash);
  console.log("Encrypted Signature:", proof.encryptedSignature);
}

module.exports = { generateCommitProof };
