import nodemailer from "nodemailer";
import { env } from "../config/env";

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const createTransporter = async () => {
  // Use Ethereal for testing if no email config provided
  if (!env.EMAIL_USER) {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // Use configured service
  return nodemailer.createTransport({
    service: env.EMAIL_SERVICE || "gmail",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: `"Chat App" <${env.EMAIL_USER || "noreply@chatapp.com"}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log("Message sent: %s", info.messageId);

    // If using Ethereal, log preview URL
    if (!env.EMAIL_USER) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email sending failed");
  }
};
