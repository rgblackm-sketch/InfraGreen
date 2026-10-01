"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase";

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
      const { error } = await getSupabaseBrowserClient().auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Sign in failed.");
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
