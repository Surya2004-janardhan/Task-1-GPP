const { authenticator } = require("otplib");

function generateTOTPCode(hexSeed) {
  try {
    if (!/^[0-9a-f]{64}$/.test(hexSeed)) {
      throw new Error("Invalid hex seed: must be 64-character hexadecimal");
    }

    const seedBytes = Buffer.from(hexSeed, "hex");

    const base32Seed = seedBytes
      .toString("base64")
      .replace(/\+/g, "0")
      .replace(/\//g, "1")
      .replace(/=/g, "");

    const paddedBase32 = base32Seed.padEnd(
      Math.ceil(base32Seed.length / 8) * 8,
      "="
    );

    authenticator.options = {
      algorithm: "sha1",
      digits: 6,
      step: 30,
    };

    return authenticator.generate(paddedBase32);
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

    if (!/^[0-9a-f]{64}$/.test(hexSeed)) {
      throw new Error("Invalid hex seed: must be 64-character hexadecimal");
    }

    const seedBytes = Buffer.from(hexSeed, "hex");

    const base32Seed = seedBytes
      .toString("base64")
      .replace(/\+/g, "0")
      .replace(/\//g, "1")
      .replace(/=/g, "");

    const paddedBase32 = base32Seed.padEnd(
      Math.ceil(base32Seed.length / 8) * 8,
      "="
    );

    authenticator.options = {
      algorithm: "sha1",
      digits: 6,
      step: 30,
    };

    return authenticator.verify({
      token: code,
      secret: paddedBase32,
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
