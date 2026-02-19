import { Resend } from "resend";
import { env } from "../config/env";

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    if (!env.RESEND_API_KEY && env.NODE_ENV !== "production") {
      console.warn("RESEND_API_KEY is not defined. Email will not be sent.");
      console.log("Email Options:", options);
      return;
    }

    const { data, error } = await resend.emails.send({
      from: `Chat App <${env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: options.to,
      subject: options.subject,
      html: options.html || "",
      text: options.text || "",
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(`Email sending failed: ${error.message}`);
    }

    console.log("Message sent:", data?.id);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email sending failed");
  }
};
