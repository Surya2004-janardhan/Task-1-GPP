const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/**
 * Request encrypted seed from instructor API
 * @param {string} studentId - Your student ID
 * @param {string} githubRepoUrl - Exact GitHub repository URL
 * @param {string} apiUrl - Instructor API endpoint
 */
async function requestEncryptedSeed(
  studentId,
  githubRepoUrl,
  apiUrl = "https://eajeyq4r3zljoq4rpovy2nthda0vtjqf.lambda-url.ap-south-1.on.aws"
) {
  console.log("🌐 Requesting encrypted seed from instructor API...");

  try {
    // Read student public key
    const publicKeyPem = fs.readFileSync(
      path.join(__dirname, "../keys/student_public.pem"),
      "utf8"
    );
    console.log("📖 Read student public key");

    // Convert to SPKI format
    const publicKey = crypto.createPublicKey(publicKeyPem);
    const publicKeySpki = publicKey.export({
      type: "spki",
      format: "pem",
    });
    console.log("🔄 Converted public key to SPKI format");

    // Prepare request payload
    const payload = {
      student_id: studentId,
      github_repo_url: githubRepoUrl,
      public_key: publicKeySpki,
    };

    console.log("📤 Sending request to instructor API...");

    // Send POST request
    const response = await axios.post(apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 seconds
    });

    if (response.data.status === "success") {
      const encryptedSeed = response.data.encrypted_seed;

      // Save encrypted seed
      fs.writeFileSync(
        path.join(__dirname, "../keys/encrypted_seed.txt"),
        encryptedSeed
      );
      console.log("✅ Encrypted seed saved to ../keys/encrypted_seed.txt");
      console.log("🔒 Keep this file secure - DO NOT commit to Git!");
    } else {
      console.error("❌ API returned error:", response.data);
      process.exit(1);
    }
  } catch (error) {
    console.error(
      "❌ Error requesting seed:",
      error.response?.data || error.message
    );
    process.exit(1);
  }
}

// Run if called directly with arguments
if (require.main === module) {
  const studentId = "22MH1A4288";
  const githubRepoUrl = "https://github.com/Surya2004-janardhan/Task-1-GPP";
  requestEncryptedSeed(studentId, githubRepoUrl);
}

module.exports = { requestEncryptedSeed };
