import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LogIn, Mail, Lock } from "lucide-react";
import { api } from "../lib/axios";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/slices/authSlice";
import { initializeSocket } from "../lib/socket";
import { AuthResponse } from "../types";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues): Promise<void> => {
    setLoading(true);

    try {
      const response = await api.post<AuthResponse>("/auth/login", data);
      const { user } = response.data;

      dispatch(
        setCredentials({
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            isOnline: user.isOnline || true,
            lastSeen: new Date(),
          },
        }),
      );

      initializeSocket();
      toast.success("Welcome back!");
      navigate("/chat");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const error = err as { response?: { data?: { error?: string } } };
        toast.error(error.response?.data?.error || "Login failed");
      } else {
        toast.error("Login failed");
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
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Welcome Back
          </h1>
          <p className="mt-2 text-text-secondary">
            Sign in to continue chatting
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary hover:text-primary-light transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-3"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-text-secondary">
          <p>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary hover:text-primary-light transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
