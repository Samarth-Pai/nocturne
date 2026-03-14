"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    setError(null);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = mode === "login" ? { email, password } : { name, email, password };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = (await response.json()) as { token?: string; error?: string };

      if (!response.ok) {
        setError(data.error ?? "Authentication failed");
        return;
      }

      if (data.token) {
        localStorage.setItem("levelup_token", data.token);
      }

      router.push("/");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setError("Sign in timed out. Please check your database connection.");
      } else {
        setError("Unable to connect to auth service.");
      }
    } finally {
      clearTimeout(timeoutId);
      setPending(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
      <div className="glass-panel w-full max-w-md p-8">
        <h1 className="cyber-text-subtle text-2xl font-black">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">Welcome to Nocturne — authenticate to continue.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-purple-500/30 bg-slate-800/60 p-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-sky focus:ring-1 focus:ring-primary-sky/40 transition-colors"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-purple-500/30 bg-slate-800/60 p-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-sky focus:ring-1 focus:ring-primary-sky/40 transition-colors"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-purple-500/30 bg-slate-800/60 p-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-sky focus:ring-1 focus:ring-primary-sky/40 transition-colors"
            required
          />

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink py-3 text-sm font-bold text-white shadow-lg shadow-accent-purple/30 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {pending ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="mt-4 text-sm font-semibold text-primary-sky hover:text-accent-purple transition-colors"
        >
          {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}
