import { signupSchema } from "./dto/signup.dto";
import { loginSchema } from "./dto/login.dto";

export const userValidation = {
  signup: signupSchema,
  login: loginSchema,
};
