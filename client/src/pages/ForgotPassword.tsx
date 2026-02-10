import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  KeyRound,
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { api } from "../lib/axios";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues): Promise<void> => {
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", data);
      setSuccess(true);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const error = err as { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || "Something went wrong");
      } else {
        setError("Failed to send reset link");
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
            <KeyRound size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Forgot Password?
          </h1>
          <p className="mt-2 text-text-secondary">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-danger/10 p-4 text-danger animate-fadeIn">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {success ? (
          <div className="text-center animate-fadeIn">
            <div className="mb-6 flex flex-col items-center gap-3 rounded-lg bg-success/10 p-6 text-success">
              <CheckCircle2 size={48} className="mb-2" />
              <p className="text-lg font-semibold text-center">
                Check your email
              </p>
              <p className="text-sm text-center opacity-90">
                We've sent a password reset link to your email address.
              </p>
            </div>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-primary hover:text-primary-light font-medium transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Email Address
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

            <button
              type="submit"
              className="btn btn-primary w-full py-3"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
