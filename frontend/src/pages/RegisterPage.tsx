// src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { parseApiError } from "../api/client";
import {
  UserPlus,
  User as UserIcon,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { LocationState } from "../types/api";

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  // Redirect destination after successful login
  const from = locationState?.from?.pathname || "/products";
  navigate(from, { replace: true });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    const trimmedName = name.trim();

    if (!trimmedName) {
      newErrors.name = "Full name is required.";
    } else if (trimmedName.length < 4) {
      newErrors.name = "Please enter a valid name.";
    } else if (trimmedName.length > 100) {
      newErrors.name = "Name must be 100 characters or fewer.";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.ChangeEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setApiError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFieldError = (field: keyof typeof errors) => {
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Create an account
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Join to start shopping and manage your orders
          </p>
        </div>

        {apiError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>{apiError}</div>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Full Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <input
                id="name"
                type="text"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError("name");
                  setApiError(null);
                }}
                placeholder="Jane Doe"
                className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition ${
                  errors.name
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-indigo-600"
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  (setEmail(e.target.value), clearFieldError("email"));
                  setApiError(null);
                }}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-indigo-600"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  (setPassword(e.target.value), clearFieldError("password"));
                  setApiError(null);
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition ${
                  errors.password
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-indigo-600"
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition ${
                  errors.confirmPassword
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-indigo-600"
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 mt-2 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register</span>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              state={{ from: location.state?.from }}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
