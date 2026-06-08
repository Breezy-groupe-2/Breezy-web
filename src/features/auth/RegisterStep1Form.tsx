"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BreezyLogo } from "@/components/ui";
import { isAxiosError } from "axios";
import { REGISTER_STEP1_KEY, type RegisterStep1Data } from "./register-session";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="size-[18px] shrink-0">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

export function RegisterStep1Form() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate() {
    const errors: Record<string, string> = {};
    if (!email) errors.email = "L'email est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Adresse email invalide.";
    if (!password) errors.password = "Le mot de passe est requis.";
    else if (password.length < 8) errors.password = "Minimum 8 caractères.";
    return errors;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const data: RegisterStep1Data = { email, password };
    sessionStorage.setItem(REGISTER_STEP1_KEY, JSON.stringify(data));
    router.push("/register/username");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col" noValidate>
      <div className="md:hidden mb-7">
        <BreezyLogo iconSize={36} textSize="text-[20px]" />
      </div>

      <h1 className="text-[26px] font-extrabold text-ink tracking-tight mb-1">
        Créer un compte
      </h1>
      <p className="text-[14px] text-sub mb-8">Rejoins la communauté.</p>

      <button
        type="button"
        className="w-full h-[48px] border-[1.5px] border-line-strong rounded-[12px] flex items-center justify-center gap-[10px] text-[15px] font-semibold text-ink bg-white hover:bg-canvas transition-colors mb-[18px] cursor-pointer"
      >
        <GoogleIcon />
        S&apos;inscrire avec Google
      </button>

      <div className="flex items-center gap-3 mb-[18px]">
        <hr className="flex-1 border-line" />
        <span className="text-[12px] text-muted font-medium">ou</span>
        <hr className="flex-1 border-line" />
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-[10px] bg-red-50 border border-red-200 text-[13px] text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-[14px] mb-6">
        <div className="flex flex-col gap-[6px]">
          <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[0.06em] text-sub">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
            className={[
              "w-full h-12 border-[1.5px] rounded-[10px] px-[14px] text-[15px] text-ink bg-canvas placeholder:text-muted outline-none transition-colors",
              fieldErrors.email
                ? "border-red-400 focus:border-red-400"
                : "border-line focus:border-ink focus:bg-white",
            ].join(" ")}
          />
          {fieldErrors.email && (
            <p className="text-[12px] text-red-500">{fieldErrors.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-[6px]">
          <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[0.06em] text-sub">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={[
              "w-full h-12 border-[1.5px] rounded-[10px] px-[14px] text-[15px] text-ink bg-canvas placeholder:text-muted outline-none transition-colors",
              fieldErrors.password
                ? "border-red-400 focus:border-red-400"
                : "border-line focus:border-ink focus:bg-white",
            ].join(" ")}
          />
          {fieldErrors.password && (
            <p className="text-[12px] text-red-500">{fieldErrors.password}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!email || !password}
        className="w-full h-[50px] bg-ink text-white rounded-full text-[16px] font-bold hover:bg-black/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-5"
      >
        Continuer
      </button>

      <p className="text-[14px] text-sub text-center">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-ink font-bold underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
