import React, { useEffect, Suspense, lazy } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { setCredentials, logout } from "./store/slices/authSlice";
import { useProfile } from "./hooks/queries/useAuth";
import { initializeSocket } from "./lib/socket";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Chat = lazy(() => import("./pages/Chat"));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#1a1a2e]">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#8b5cf6] border-t-transparent"></div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: "/verify-email",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <VerifyEmail />
      </Suspense>
    ),
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <Chat />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: <Navigate to="/chat" replace />,
  },
]);

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: user, isSuccess, isError } = useProfile();

  useEffect(() => {
    if (isSuccess && user) {
      dispatch(setCredentials({ user }));
      initializeSocket();
    } else if (isError) {
      dispatch(logout());
    }
  }, [isSuccess, isError, user, dispatch]);

  return <RouterProvider router={router} />;
};

export default App;
