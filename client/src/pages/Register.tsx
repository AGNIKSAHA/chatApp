import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, User, Mail, Lock } from "lucide-react";
import { api } from "../lib/axios";
import toast from "react-hot-toast";

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues): Promise<void> => {
    setLoading(true);

    try {
      const { confirmPassword, ...signupData } = data;
      await api.post("/auth/signup", signupData);

      toast.success(
        "Account created! Please check your email to verify your account.",
      );
      navigate("/login");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const error = err as {
          response?: { data?: { message?: string; error?: string } };
        };
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Registration failed",
        );
      } else {
        toast.error("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md animate-slideUp bg-bg-secondary rounded-xl p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Create Account
          </h1>
          <p className="mt-2 text-text-secondary">Join our chat community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Username
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                <User size={18} />
              </div>
              <input
                {...register("username")}
                type="text"
                className={`input pl-10 ${errors.username ? "border-danger focus:ring-danger/10" : ""}`}
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>
            {errors.username && (
              <p className="text-xs font-medium text-danger">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Email
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                <Mail size={18} />
              </div>
              <input
                {...register("email")}
                type="email"
                className={`input pl-10 ${errors.email ? "border-danger focus:ring-danger/10" : ""}`}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-danger">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                <Lock size={18} />
              </div>
              <input
                {...register("password")}
                type="password"
                className={`input pl-10 ${errors.password ? "border-danger focus:ring-danger/10" : ""}`}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-danger">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                <Lock size={18} />
              </div>
              <input
                {...register("confirmPassword")}
                type="password"
                className={`input pl-10 ${errors.confirmPassword ? "border-danger focus:ring-danger/10" : ""}`}
                placeholder="Confirm your password"
                disabled={loading}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-danger">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-3 mt-4"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-text-secondary">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary-light transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
