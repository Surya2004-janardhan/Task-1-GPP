const { authenticator } = require("otplib");

/**
 * Generate current TOTP code from hex seed
 * @param {string} hexSeed - 64-character hex string
 * @returns {string} 6-digit TOTP code
 */
function generateTOTPCode(hexSeed) {
  try {
    // Validate hex seed
    if (!/^[0-9a-f]{64}$/.test(hexSeed)) {
      throw new Error("Invalid hex seed: must be 64-character hexadecimal");
    }

    // Convert hex to bytes
    const seedBytes = Buffer.from(hexSeed, "hex");

    // Convert bytes to base32 encoding
    const base32Seed = seedBytes
      .toString("base64")
      .replace(/\+/g, "0") // Replace + with 0
      .replace(/\//g, "1") // Replace / with 1
      .replace(/=/g, ""); // Remove padding

    // Pad to multiple of 8 for base32
    const paddedBase32 = base32Seed.padEnd(
      Math.ceil(base32Seed.length / 8) * 8,
      "="
    );

    // Configure TOTP
    authenticator.options = {
      algorithm: "sha1", // Standard for TOTP
      digits: 6, // 6-digit codes
      step: 30, // 30-second periods
    };

    // Generate current code
    return authenticator.generate(paddedBase32);
  } catch (error) {
    throw new Error(`TOTP generation failed: ${error.message}`);
  }
}

/**
 * Verify TOTP code with time window tolerance
 * @param {string} hexSeed - 64-character hex string
 * @param {string} code - 6-digit code to verify
 * @param {number} validWindow - Number of periods before/after (default 1 = ±30s)
 * @returns {boolean} True if valid, false otherwise
 */
function verifyTOTPCode(hexSeed, code, validWindow = 1) {
  try {
    // Validate inputs
    if (
      !code ||
      typeof code !== "string" ||
      code.length !== 6 ||
      !/^\d{6}$/.test(code)
    ) {
      return false;
    }

    // Validate hex seed
    if (!/^[0-9a-f]{64}$/.test(hexSeed)) {
      throw new Error("Invalid hex seed: must be 64-character hexadecimal");
    }

    // Convert hex to bytes
    const seedBytes = Buffer.from(hexSeed, "hex");

    // Convert bytes to base32 encoding (same as generation)
    const base32Seed = seedBytes
      .toString("base64")
      .replace(/\+/g, "0")
      .replace(/\//g, "1")
      .replace(/=/g, "");

    const paddedBase32 = base32Seed.padEnd(
      Math.ceil(base32Seed.length / 8) * 8,
      "="
    );

    // Configure TOTP (same as generation)
    authenticator.options = {
      algorithm: "sha1",
      digits: 6,
      step: 30,
    };

    // Verify with time window tolerance
    return authenticator.verify({
      token: code,
      secret: paddedBase32,
      window: validWindow, // ± validWindow periods
    });
  } catch (error) {
    console.error(`TOTP verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Calculate remaining seconds in current TOTP period
 * @returns {number} Seconds remaining (0-29)
 */
function getRemainingSeconds() {
  const now = Math.floor(Date.now() / 1000);
  return 30 - (now % 30);
}

module.exports = {
  generateTOTPCode,
  verifyTOTPCode,
  getRemainingSeconds,
};
