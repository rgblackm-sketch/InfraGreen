"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase";

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("invalid login credentials") || message.includes("invalid_grant")) {
      return "Invalid email or password. Please check your credentials and try again.";
    }

    if (message.includes("timeout") || message.includes("network") || message.includes("fetch")) {
      return "The sign-in request timed out or the network is unavailable. Please try again.";
    }

    if (message.includes("missing") || message.includes("environment") || message.includes("config")) {
      return "The admin login is not configured correctly. Please contact the InfraGreen administrator.";
    }

    return error.message;
  }

  return fallback;
}

const AUTH_TIMEOUT_MS = 15000;

export function AdminLoginForm({ errorMessage }: { errorMessage?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(errorMessage ?? null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      const supabase = getSupabaseBrowserClient();

      const authRequest = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data, error } = await Promise.race([
        authRequest,
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Authentication request timed out.")), AUTH_TIMEOUT_MS);
        }),
      ]);

      if (error) {
        setFormError(getAuthErrorMessage(error, error.message || "Unable to sign in."));
        return;
      }

      if (!data.user) {
        setFormError("Authentication did not return a valid admin user. Please try again.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      setFormError(getAuthErrorMessage(error, "We couldn’t sign you in right now. Please check your credentials and try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-card admin-card--auth">
      <div className="admin-hero-badge">InfraGreen</div>
      <h1>Admin sign in</h1>
      <p className="admin-subtitle">Use your approved InfraGreen administrator account to access project and professional submissions.</p>

      <form className="admin-auth-form" onSubmit={handleSubmit}>
        <label className="field field-full">
          <span>Email</span>
          <input
            autoComplete="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@infragreen.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="field field-full">
          <span>Password</span>
          <input
            autoComplete="current-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            type="password"
            value={password}
          />
        </label>

        {(formError || errorMessage) && (
          <p className="admin-alert admin-alert--error" role="alert">
            {formError ?? errorMessage}
          </p>
        )}

        <button className="button button-primary admin-submit" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
