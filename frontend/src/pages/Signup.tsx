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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
        <div className="w-full animate-slide-up rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900">DocEditor</span>
          </div>

          <h1 className="text-xl font-semibold text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Set up your account to start collaborating.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
          >
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input className="mt-1.5" autoComplete="email" {...register("email")} />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Input
                type="password"
                className="mt-1.5"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {errorText && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{errorText}</p>
            )}

            <Button type="submit" disabled={mutation.isPending} className="w-full">
              {mutation.isPending ? "Creating…" : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
