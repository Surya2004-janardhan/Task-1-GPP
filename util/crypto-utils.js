const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function loadPrivateKey() {
  try {
    const privateKeyPem = fs.readFileSync(
      path.join(__dirname, "../keys/student_private.pem"),
      "utf8"
    );
    return crypto.createPrivateKey(privateKeyPem);
  } catch (error) {
    throw new Error(`Failed to load private key: ${error.message}`);
  }
}

function loadPublicKey(filename) {
  try {
    const publicKeyPem = fs.readFileSync(filename, "utf8");
    return crypto.createPublicKey(publicKeyPem);
  } catch (error) {
    throw new Error(
      `Failed to load public key from ${filename}: ${error.message}`
    );
  }
}

function decryptSeed(encryptedSeedB64, privateKey) {
  try {
    const encryptedBytes = Buffer.from(encryptedSeedB64, "base64");

    const decryptedBytes = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
        oaepLabel: undefined,
      },
      encryptedBytes
    );

    const hexSeed = decryptedBytes.toString();

    if (hexSeed.length !== 64 || !/^[0-9a-f]{64}$/.test(hexSeed)) {
      throw new Error("Decrypted seed is not a valid 64-character hex string");
    }

    return hexSeed;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

function signMessage(message, privateKey) {
  try {
    const messageBytes = Buffer.from(message, "utf8");

    return crypto.sign("sha256", messageBytes, {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_MAX,
    });
  } catch (error) {
    throw new Error(`Signing failed: ${error.message}`);
  }
}

function encryptWithPublicKey(data, publicKey) {
  try {
    return crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
        oaepLabel: undefined,
      },
      data
    );
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

module.exports = {
  loadPrivateKey,
  loadPublicKey,
  decryptSeed,
  signMessage,
  encryptWithPublicKey,
};
