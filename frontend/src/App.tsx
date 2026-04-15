import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useAuthStore } from "./stores/authStore";
import { LoginPage } from "./pages/Login";
import { SignupPage } from "./pages/Signup";
import { DashboardPage } from "./pages/Dashboard";

const EditorPage = lazy(() => import("./pages/Editor").then((m) => ({ default: m.EditorPage })));

function Protected({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function EditorFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          Loading editor…
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const token = useAuthStore((s) => s.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <DashboardPage />
            </Protected>
          }
        />
        <Route
          path="/docs/:id"
          element={
            <Protected>
              <Suspense fallback={<EditorFallback />}>
                <EditorPage />
              </Suspense>
            </Protected>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
