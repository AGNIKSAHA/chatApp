import crypto from "crypto";
import { env } from "../config/env";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // For AES, this is always 16

// Ensuring the key is 32 bytes
const ENCRYPTION_KEY = Buffer.from(
  crypto
    .createHash("sha256")
    .update(env.MESSAGE_ENCRYPTION_KEY || "default_secret_key_change_me_123")
    .digest(),
);

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

export const decrypt = (text: string): string => {
  try {
    const [ivHex, encryptedText] = text.split(":");
    if (!ivHex || !encryptedText) return text; // Not encrypted

    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return text; // Return as is if decryption fails
  }
};
