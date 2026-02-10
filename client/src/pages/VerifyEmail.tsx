import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { api } from "../lib/axios";
import toast from "react-hot-toast";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string>("Verifying your email...");

  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (!token || verificationAttempted.current) return;

    verificationAttempted.current = true;

    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage("Email verified successfully! Redirecting to login...");
        toast.success("Email verified!");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err: unknown) {
        setStatus("error");
        let errorMessage = "Verification failed. Please try again.";
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as {
            response?: { data?: { message?: string } };
          };
          if (axiosError.response?.data?.message) {
            errorMessage = axiosError.response.data.message;
          }
        }
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md animate-slideUp bg-bg-secondary rounded-xl p-8 text-center shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <Mail size={48} />
          </div>
        </div>

        <h1 className="mb-4 text-2xl font-bold tracking-tight text-text-primary">
          Email Verification
        </h1>

        <div className="space-y-6">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8 animate-fadeIn">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-medium text-text-secondary">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 py-8 animate-fadeIn">
              <CheckCircle2 className="h-16 w-16 text-success" />
              <p className="font-semibold text-success">{message}</p>
              <div className="h-1 w-full max-w-[120px] overflow-hidden rounded-full bg-success/20">
                <div className="h-full w-full origin-left animate-[loading_3s_ease-in-out] bg-success"></div>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-6 py-8 animate-fadeIn">
              <XCircle className="h-16 w-16 text-danger" />
              <div className="rounded-lg bg-danger/10 p-4 text-danger">
                <p className="text-sm font-medium">{message}</p>
              </div>
              <button
                className="btn btn-primary w-full"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
