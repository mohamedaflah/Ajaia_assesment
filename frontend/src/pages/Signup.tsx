import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signup } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { FileText } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type FormValues = z.infer<typeof schema>;

export function SignupPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => signup(values.email, values.password),
    onSuccess: (data) => {
      setToken(data.token);
      navigate("/dashboard", { replace: true });
    },
  });

  const errorText = useMemo(() => {
    if (!mutation.isError) return null;
    return mutation.error instanceof Error ? mutation.error.message : "Signup failed";
  }, [mutation.isError, mutation.error]);

  return (
    <div className="min-h-screen bg-[#f0f0f3]">
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="mx-auto flex min-h-[calc(100vh-6px)] w-full max-w-md items-center px-6">
        <div className="w-full animate-slide-up border-2 border-slate-900 bg-[#f7f7f9] p-8 shadow-[6px_6px_0_#0f172a]">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center bg-slate-900 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 uppercase">DocEditor</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900">Join DocEditor ✨</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create your account and start collaborating in seconds.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
          >
            <div>
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Email</label>
              <Input className="mt-1.5" autoComplete="email" {...register("email")} />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <Input
                type="password"
                className="mt-1.5"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {errorText && (
              <p className="text-sm text-red-600 bg-red-50 border-2 border-red-200 px-3 py-2 font-medium">{errorText}</p>
            )}

            <Button type="submit" disabled={mutation.isPending} className="w-full">
              {mutation.isPending ? "Creating…" : "Create account →"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 transition-colors" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
