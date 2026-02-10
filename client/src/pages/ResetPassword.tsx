import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ShieldCheck,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { api } from "../lib/axios";
import toast from "react-hot-toast";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues): Promise<void> => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        password: data.password,
      });
      setSuccess(true);
      toast.success("Password updated successfully!");
      // Automatically redirect after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const error = err as { response?: { data?: { error?: string } } };
        toast.error(error.response?.data?.error || "Reset failed");
      } else {
        toast.error("Failed to reset password");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
        <div className="w-full max-w-md bg-bg-secondary rounded-xl p-8 shadow-xl text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-danger" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Invalid Link
          </h1>
          <p className="text-text-secondary mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            to="/forgot-password"
            className="btn btn-primary w-full inline-block"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md animate-slideUp bg-bg-secondary rounded-xl p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Reset Password
          </h1>
          <p className="mt-2 text-text-secondary">
            Enter your new password below.
          </p>
        </div>

        {success ? (
          <div className="text-center animate-fadeIn">
            <div className="mb-6 flex flex-col items-center gap-3 rounded-lg bg-success/10 p-6 text-success">
              <CheckCircle2 size={48} className="mb-2" />
              <p className="text-lg font-semibold">Password Reset!</p>
              <p className="text-sm">
                Your password has been successfully updated.
              </p>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              Redirecting you to login...
            </p>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-primary hover:text-primary-light font-medium transition-colors"
            >
              Sign In Now <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                New Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                  <Lock size={18} />
                </div>
                <input
                  {...register("password")}
                  type="password"
                  className={`input pl-10 ${errors.password ? "border-danger focus:ring-danger/10" : ""}`}
                  placeholder="Minimum 6 characters"
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
                Confirm New Password
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
              className="btn btn-primary w-full py-3"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
