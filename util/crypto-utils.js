const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * Load RSA private key from PEM file
 * @returns {crypto.KeyObject} Private key object
 */
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

/**
 * Load RSA public key from PEM file
 * @param {string} filename - Key file name
 * @returns {crypto.KeyObject} Public key object
 */
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

/**
 * Decrypt base64-encoded encrypted seed using RSA/OAEP
 * @param {string} encryptedSeedB64 - Base64 encoded ciphertext
 * @param {crypto.KeyObject} privateKey - RSA private key
 * @returns {string} Decrypted hex seed (64-character string)
 */
function decryptSeed(encryptedSeedB64, privateKey) {
  try {
    // Base64 decode
    const encryptedBytes = Buffer.from(encryptedSeedB64, "base64");

    // RSA/OAEP decrypt with SHA-256, no label
    const decryptedBytes = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
        oaepLabel: undefined,
      },
      encryptedBytes
    );

    // Convert to string (assuming it's the hex seed)
    const hexSeed = decryptedBytes.toString();

    // Validate: must be 64-character hex
    if (hexSeed.length !== 64 || !/^[0-9a-f]{64}$/.test(hexSeed)) {
      throw new Error("Decrypted seed is not a valid 64-character hex string");
    }

    return hexSeed;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Sign a message using RSA-PSS with SHA-256
 * @param {string} message - Message to sign (ASCII string)
 * @param {crypto.KeyObject} privateKey - RSA private key
 * @returns {Buffer} Signature bytes
 */
function signMessage(message, privateKey) {
  try {
    const messageBytes = Buffer.from(message, "utf8");

    return crypto.sign(
      "sha256", // Hash algorithm
      messageBytes,
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: crypto.constants.RSA_PSS_SALTLEN_MAX, // Maximum salt length
      }
    );
  } catch (error) {
    throw new Error(`Signing failed: ${error.message}`);
  }
}

/**
 * Encrypt data using RSA/OAEP with public key
 * @param {Buffer} data - Data to encrypt
 * @param {crypto.KeyObject} publicKey - RSA public key
 * @returns {Buffer} Encrypted ciphertext
 */
function encryptWithPublicKey(data, publicKey) {
  try {
    return crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
        oaepLabel: undefined, // No label
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
