const { authenticator } = require("otplib");

// Base32 alphabet for encoding
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Convert bytes to base32 encoding (RFC 4648)
 */
function bytesToBase32(buffer) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function generateTOTPCode(hexSeed) {
  try {
    if (!/^[0-9a-f]{64}$/i.test(hexSeed)) {
      throw new Error("Invalid hex seed: must be 64-character hexadecimal");
    }

    // Convert hex seed to bytes
    const seedBytes = Buffer.from(hexSeed, "hex");

    // Convert bytes to base32 (proper RFC 4648 encoding)
    const base32Seed = bytesToBase32(seedBytes);

    // Configure TOTP options
    authenticator.options = {
      algorithm: "sha1",
      digits: 6,
      step: 30,
    };

    return authenticator.generate(base32Seed);
  } catch (error) {
    throw new Error(`TOTP generation failed: ${error.message}`);
  }
}

function verifyTOTPCode(hexSeed, code, validWindow = 1) {
  try {
    if (
      !code ||
      typeof code !== "string" ||
      code.length !== 6 ||
      !/^\d{6}$/.test(code)
    ) {
      return false;
    }

    if (!/^[0-9a-f]{64}$/i.test(hexSeed)) {
      throw new Error("Invalid hex seed: must be 64-character hexadecimal");
    }

    // Convert hex seed to bytes
    const seedBytes = Buffer.from(hexSeed, "hex");

    // Convert bytes to base32 (proper RFC 4648 encoding)
    const base32Seed = bytesToBase32(seedBytes);

    // Configure TOTP options
    authenticator.options = {
      algorithm: "sha1",
      digits: 6,
      step: 30,
    };

    return authenticator.verify({
      token: code,
      secret: base32Seed,
      window: validWindow,
    });
  } catch (error) {
    console.error(`TOTP verification failed: ${error.message}`);
    return false;
  }
}

function getRemainingSeconds() {
  const now = Math.floor(Date.now() / 1000);
  return 30 - (now % 30);
}

module.exports = {
  generateTOTPCode,
  verifyTOTPCode,
  getRemainingSeconds,
};
