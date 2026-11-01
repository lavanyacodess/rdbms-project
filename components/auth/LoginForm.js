"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icons";
import DemoCredentials from "./DemoCredentials";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values) {
  const errors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(email) || email.length > 100) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Enter your password.";
  } else if (values.password.length > 72) {
    errors.password = "Password must be at most 72 characters.";
  }

  return errors;
}

export default function LoginForm({ next = "/dashboard" }) {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const registerHref =
    next && next !== "/dashboard"
      ? `/register?next=${encodeURIComponent(next)}`
      : "/register";

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
    if (error) setError("");
  }

  function fillDemo(account) {
    setValues({ email: account.email, password: account.password });
    setFieldErrors({});
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    setError("");
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }

    setLoading(true);
    setFieldErrors({});

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password,
          next,
        }),
      });

      const data = (await response.json().catch(() => null)) ?? {};

      if (!response.ok) {
        setError(data.error || "We could not sign you in. Please try again.");
        return;
      }

      router.replace(data.redirectTo || next || "/dashboard");
      router.refresh();
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-rise">
      <span className="badge-brand">
        <Icon name="lock" className="h-3.5 w-3.5" />
        Member sign in
      </span>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        Welcome back
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Sign in to get back to your clubs, events, and campus updates.
      </p>

      {error ? (
        <div className="form-error mt-6" role="alert">
          {error}
        </div>
      ) : null}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} aria-busy={loading} noValidate>
        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <div className="relative">
            <Icon
              name="mail"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              inputMode="email"
              maxLength={100}
              placeholder="you@college.edu"
              value={values.email}
              onChange={handleChange}
              disabled={loading}
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              className={`input pl-10 ${
                fieldErrors.email
                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/10"
                  : ""
              }`}
            />
          </div>
          {fieldErrors.email ? (
            <p id="email-error" className="field-error">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="relative">
            <Icon
              name="lock"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={values.password}
              onChange={handleChange}
              disabled={loading}
              required
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              className={`input pl-10 pr-16 ${
                fieldErrors.password
                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/10"
                  : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3.5 text-xs font-semibold text-slate-500 transition hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              disabled={loading}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {fieldErrors.password ? (
            <p id="password-error" className="field-error">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <button type="submit" className="btn-primary btn-lg w-full" disabled={loading}>
          {loading ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <Icon name="arrowRight" className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        New to CampusConnect?{" "}
        <Link
          href={registerHref}
          className="font-semibold text-brand-600 underline-offset-4 hover:text-brand-700 hover:underline"
        >
          Create an account
        </Link>
      </p>

      <DemoCredentials onSelect={fillDemo} disabled={loading} />
    </div>
  );
}
