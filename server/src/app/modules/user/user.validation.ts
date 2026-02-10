import { signupSchema } from "./dto/signup.dto";
import { loginSchema } from "./dto/login.dto";
import { z } from "zod";

export const userValidation = {
  signup: signupSchema,
  login: loginSchema,
  forgotPassword: z.object({
    email: z.string().email("Invalid email address"),
  }),
  resetPassword: z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
};
