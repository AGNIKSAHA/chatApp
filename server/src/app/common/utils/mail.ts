import { Resend } from "resend";
import { env } from "../config/env";

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

let resendInstance: Resend | null = null;

const getResendInstance = () => {
  if (!resendInstance) {
    if (!env.RESEND_API_KEY) {
      return null;
    }
    resendInstance = new Resend(env.RESEND_API_KEY);
  }
  return resendInstance;
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const isDev = env.NODE_ENV !== "production";

  try {
    const resend = getResendInstance();

    if (!resend) {
      if (isDev) {
        console.warn(
          "⚠️ RESEND_API_KEY is not defined. Email will not be sent.",
        );
        console.log("📬 DEV EMAIL PREVIEW:");
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Content: ${options.html || options.text}`);
        return;
      }
      throw new Error("RESEND_API_KEY is missing in production");
    }

    const { data, error } = await resend.emails.send({
      from: `Chat App <${env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: options.to,
      subject: options.subject,
      html: options.html || "",
      text: options.text || "",
    });

    if (error) {
      if (isDev) {
        console.error("❌ Resend sandbox restriction or error:", error.message);
        console.log("📬 DEV EMAIL PREVIEW (Delivery Failed):");
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Content: ${options.html || options.text}`);
        return; // Don't throw in dev, just show the link in console
      }
      throw new Error(`Email sending failed: ${error.message}`);
    }

    console.log("✅ Message sent successfully:", data?.id);
  } catch (error: any) {
    if (isDev) {
      console.error("❌ Error in sendEmail (handled for dev):", error.message);
      console.log("📬 DEV EMAIL PREVIEW (Internal Error):");
      console.log(`To: ${options.to}`);
      console.log(`Content: ${options.html || options.text}`);
      return;
    }
    console.error("Error sending email:", error);
    throw new Error("Email sending failed");
  }
};
