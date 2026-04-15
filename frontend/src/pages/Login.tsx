import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { FileText, KeyRound } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => login(values.email, values.password),
    onSuccess: (data) => {
      setToken(data.token);
      navigate("/dashboard", { replace: true });
    },
  });

  const errorText = useMemo(() => {
    if (mutation.isError) {
      return mutation.error instanceof Error ? mutation.error.message : "Login failed";
    }
    return null;
  }, [mutation.isError, mutation.error]);

  const fillTestCreds = () => {
    setValue("email", "test@gmail.com");
    setValue("password", "Test@1234");
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Top accent */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="mx-auto flex min-h-[calc(100vh-6px)] w-full max-w-md items-center px-6">
        <div className="w-full animate-slide-up border-2 border-slate-900 bg-white p-8 shadow-[6px_6px_0_#0f172a]">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center bg-slate-900 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 uppercase">DocEditor</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900">Welcome back 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Great to see you again. Sign in to continue.</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
          >
            <div>
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Email</label>
              <Input
                className="mt-1.5"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <Input
                type="password"
                className="mt-1.5"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {errorText && (
              <p className="text-sm text-red-600 bg-red-50 border-2 border-red-200 px-3 py-2 font-medium">{errorText}</p>
            )}

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? "Signing in…" : "Sign in →"}
            </Button>
          </form>

          {/* Test credentials */}
          <button
            type="button"
            onClick={fillTestCreds}
            className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 bg-slate-50 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Use test credentials
          </button>

          <div className="mt-6 text-center text-sm text-slate-500">
            Need an account?{" "}
            <Link className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 transition-colors" to="/signup">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
