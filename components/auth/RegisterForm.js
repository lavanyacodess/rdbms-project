"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icons";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const YEARS = [
  ["1", "1st year"],
  ["2", "2nd year"],
  ["3", "3rd year"],
  ["4", "4th year"],
  ["5", "5th year"],
];

function validate(values) {
  const errors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const department = values.department.trim();

  if (!name) {
    errors.name = "Enter your full name.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (name.length > 100) {
    errors.name = "Name must be at most 100 characters.";
  }

  if (!email) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(email) || email.length > 100) {
    errors.email = "Enter a valid email address.";
  }

  if (department.length > 50) {
    errors.department = "Department must be at most 50 characters.";
  }

  if (values.year && !YEARS.some(([value]) => value === values.year)) {
    errors.year = "Choose a year between 1 and 5.";
  }

  if (!values.password) {
    errors.password = "Create a password.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (values.password.length > 72) {
    errors.password = "Password must be at most 72 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export default function RegisterForm({ next = "/dashboard" }) {
  const router = useRouter();
  const [values, setValues] = useState({
    name: "",
    email: "",
    department: "",
    year: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loginHref =
    next && next !== "/dashboard"
      ? `/login?next=${encodeURIComponent(next)}`
      : "/login";

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      const keysToClear = name === "password" ? ["password", "confirmPassword"] : [name];
      if (!keysToClear.some((key) => current[key])) return current;
      const nextErrors = { ...current };
      for (const key of keysToClear) delete nextErrors[key];
      return nextErrors;
    });
    if (error) setError("");
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          department: values.department.trim() || null,
          year: values.year ? Number(values.year) : null,
          next,
        }),
      });

      const data = (await response.json().catch(() => null)) ?? {};

      if (response.status === 409) {
        const message =
          data.error || "An account with this email already exists. Try signing in instead.";
        setFieldErrors({ email: message });
        document.getElementById("email")?.focus();
        return;
      }

      if (!response.ok) {
        setError(data.error || "We could not create your account. Please try again.");
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
    <div>
      <h1 className="text-[clamp(1.75rem,4.4vw,2.9rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-[var(--ink)]">
        Join CampusConnect
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
        Create your student account and start finding your people.
      </p>

      {error ? (
        <div className="form-error mt-6" role="alert">
          {error}
        </div>
      ) : null}

      <form className="mt-7 space-y-6" onSubmit={handleSubmit} aria-busy={loading} noValidate>
        <div>
          <label htmlFor="name" className="label">
            Full name
          </label>
          <div className="relative">
            <Icon
              name="user"
              className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]"
            />
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              placeholder="Aarav Mehta"
              value={values.name}
              onChange={handleChange}
              disabled={loading}
              required
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              className={`input pl-7 ${fieldErrors.name ? "input-error" : ""}`}
            />
          </div>
          {fieldErrors.name ? (
            <p id="name-error" className="field-error">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <div className="relative">
            <Icon
              name="mail"
              className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]"
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
              className={`input pl-7 ${fieldErrors.email ? "input-error" : ""}`}
            />
          </div>
          {fieldErrors.email ? (
            <p id="email-error" className="field-error">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="department" className="label">
              Department{" "}
              <span className="font-normal normal-case tracking-normal text-[var(--ink-faint)]">
                (optional)
              </span>
            </label>
            <div className="relative">
              <Icon
                name="building"
                className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]"
              />
              <input
                id="department"
                name="department"
                type="text"
                autoComplete="off"
                maxLength={50}
                placeholder="e.g. Computer Science"
                value={values.department}
                onChange={handleChange}
                disabled={loading}
                aria-invalid={Boolean(fieldErrors.department)}
                aria-describedby={fieldErrors.department ? "department-error" : undefined}
                className={`input pl-7 ${fieldErrors.department ? "input-error" : ""}`}
              />
            </div>
            {fieldErrors.department ? (
              <p id="department-error" className="field-error">
                {fieldErrors.department}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="year" className="label">
              Year of study{" "}
              <span className="font-normal normal-case tracking-normal text-[var(--ink-faint)]">
                (optional)
              </span>
            </label>
            <div className="relative">
              <Icon
                name="graduation"
                className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]"
              />
              <select
                id="year"
                name="year"
                value={values.year}
                onChange={handleChange}
                disabled={loading}
                aria-invalid={Boolean(fieldErrors.year)}
                aria-describedby={fieldErrors.year ? "year-error" : undefined}
                className={`select pl-7 ${fieldErrors.year ? "input-error" : ""}`}
              >
                <option value="">Select year</option>
                {YEARS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {fieldErrors.year ? (
              <p id="year-error" className="field-error">
                {fieldErrors.year}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="relative">
            <Icon
              name="lock"
              className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              value={values.password}
              onChange={handleChange}
              disabled={loading}
              required
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? "password-error" : "password-hint"
              }
              className={`input pl-7 pr-16 ${fieldErrors.password ? "input-error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex items-center px-0 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)] transition hover:text-[var(--margin)] disabled:cursor-not-allowed disabled:opacity-50"
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
          ) : (
            <p id="password-hint" className="hint">
              Use at least 8 characters.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">
            Confirm password
          </label>
          <div className="relative">
            <Icon
              name="lock"
              className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]"
            />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={values.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              required
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={
                fieldErrors.confirmPassword ? "confirmPassword-error" : undefined
              }
              className={`input pl-7 pr-16 ${
                fieldErrors.confirmPassword ? "input-error" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex items-center px-0 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)] transition hover:text-[var(--margin)] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={
                showConfirmPassword ? "Hide confirm password" : "Show confirm password"
              }
              aria-pressed={showConfirmPassword}
              disabled={loading}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
          {fieldErrors.confirmPassword ? (
            <p id="confirmPassword-error" className="field-error">
              {fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>

        <button type="submit" className="btn-primary btn-lg w-full" disabled={loading}>
          {loading ? (
            <>
              <span
                className="h-3.5 w-3.5 animate-spin border border-[var(--paper-raised)] border-t-transparent"
                aria-hidden="true"
              />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <Icon name="arrowRight" className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-sm leading-6 text-[var(--ink-soft)]">
        Already have an account?{" "}
        <Link
          href={loginHref}
          className="font-semibold text-[var(--ink)] underline decoration-[var(--rule-strong)] underline-offset-4 transition hover:text-[var(--margin)]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
