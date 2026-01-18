const https = require("https");
const fs = require("fs");
const path = require("path");

const INSTRUCTOR_API =
  "https://eajeyq4r3zljoq4rpovy2nthda0vtjqf.lambda-url.ap-south-1.on.aws";

async function requestSeed(studentId, githubRepoUrl) {
  try {
    // Read public key
    const publicKeyPath = path.join(__dirname, "../keys/student_public.pem");
    const publicKey = fs.readFileSync(publicKeyPath, "utf8");

    console.log("🔑 Loaded public key from:", publicKeyPath);
    console.log("📋 Student ID:", studentId);
    console.log("🔗 GitHub Repo:", githubRepoUrl);

    const requestBody = JSON.stringify({
      student_id: studentId,
      github_repo_url: githubRepoUrl,
      public_key: publicKey,
    });

    const url = new URL(INSTRUCTOR_API);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const response = JSON.parse(data);
            if (response.status === "success" && response.encrypted_seed) {
              // Save encrypted seed
              const seedPath = path.join(
                __dirname,
                "../keys/encrypted_seed.txt",
              );
              fs.writeFileSync(seedPath, response.encrypted_seed);
              console.log("✅ Encrypted seed saved to:", seedPath);
              resolve(response.encrypted_seed);
            } else {
              console.error("❌ API Error:", response);
              reject(new Error(response.error || "Unknown error"));
            }
          } catch (e) {
            console.error("❌ Failed to parse response:", data);
            reject(e);
          }
        });
      });

      req.on("error", (e) => {
        console.error("❌ Request failed:", e.message);
        reject(e);
      });

      req.write(requestBody);
      req.end();
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

// Main
if (require.main === module) {
  const studentId = process.argv[2] || "22MH1A4288";
  const githubRepoUrl =
    process.argv[3] || "https://github.com/Surya2004-janardhan/Task-1-GPP";

  console.log("\n🚀 Requesting encrypted seed from instructor API...\n");
  requestSeed(studentId, githubRepoUrl)
    .then(() => {
      console.log("\n✅ Done! You can now test /decrypt-seed endpoint.");
    })
    .catch((err) => {
      console.error("\n❌ Failed:", err.message);
      process.exit(1);
    });
}

module.exports = { requestSeed };
