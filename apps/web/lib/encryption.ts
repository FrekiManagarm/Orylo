import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY is not set in environment variables. Please generate a 32-byte hex key.",
    );
  }
  return key;
}

/**
 * Encrypt sensitive text using AES-256-GCM
 * Format: salt:iv:authTag:encryptedData (all hex encoded)
 */
export function encrypt(text: string): string {
  if (!text) {
    throw new Error("Cannot encrypt empty text");
  }

  const key = getEncryptionKey();

  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // Derive key from ENCRYPTION_KEY + salt
  const derivedKey = crypto.pbkdf2Sync(
    Buffer.from(key, "hex"),
    salt,
    100000,
    32,
    "sha512",
  );

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

  // Encrypt
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Combine: salt:iv:authTag:encryptedData
  return `${salt.toString("hex")}:${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt text encrypted with encrypt()
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) {
    throw new Error("Cannot decrypt empty text");
  }

  const key = getEncryptionKey();

  try {
    // Split the encrypted text
    const parts = encryptedText.split(":");
    if (parts.length !== 4) {
      throw new Error("Invalid encrypted text format");
    }

    const [saltHex, ivHex, authTagHex, encrypted] = parts;

    // Convert from hex
    const salt = Buffer.from(saltHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    // Derive the same key
    const derivedKey = crypto.pbkdf2Sync(
      Buffer.from(key, "hex"),
      salt,
      100000,
      32,
      "sha512",
    );

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Validate that encryption is properly configured
 */
export function validateEncryption(): boolean {
  try {
    const key = getEncryptionKey();

    // Check key is valid hex
    if (!/^[0-9a-fA-F]{64}$/.test(key)) {
      throw new Error(
        "ENCRYPTION_KEY must be a 64-character hex string (32 bytes)",
      );
    }

    // Test encryption/decryption
    const testText = "test-encryption-validation";
    const encrypted = encrypt(testText);
    const decrypted = decrypt(encrypted);

    if (decrypted !== testText) {
      throw new Error("Encryption validation failed: mismatch");
    }

    return true;
  } catch (error) {
    console.error("❌ Encryption validation failed:", error);
    throw error;
  }
}

/**
 * Generate a new encryption key (for setup)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex");
}
