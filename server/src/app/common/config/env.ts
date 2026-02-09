import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  NODE_ENV: "development" | "production" | "test";
  CLIENT_URL: string;
  MESSAGE_ENCRYPTION_KEY?: string;
  EMAIL_SERVICE?: string;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

export const env: EnvConfig = {
  PORT: parseInt(getEnvVariable("PORT", "5000"), 10),
  MONGODB_URI: getEnvVariable("MONGODB_URI"),
  JWT_SECRET: getEnvVariable("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnvVariable("JWT_EXPIRES_IN", "15m"),
  REFRESH_TOKEN_SECRET: getEnvVariable("REFRESH_TOKEN_SECRET"),
  REFRESH_TOKEN_EXPIRES_IN: getEnvVariable("REFRESH_TOKEN_EXPIRES_IN", "7d"),
  NODE_ENV: getEnvVariable("NODE_ENV", "development") as EnvConfig["NODE_ENV"],
  CLIENT_URL: getEnvVariable("CLIENT_URL", "http://localhost:5173"),
  MESSAGE_ENCRYPTION_KEY: process.env.MESSAGE_ENCRYPTION_KEY,
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};
