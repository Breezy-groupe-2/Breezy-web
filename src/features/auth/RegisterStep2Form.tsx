"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui";
import { registerUser } from "./auth.api";
import { getRegisterStep1, clearRegisterStep1 } from "./register-session";
import { isAxiosError } from "axios";

export function RegisterStep2Form() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const step1 = getRegisterStep1();
    if (!step1) {
      router.replace("/register");
      return;
    }
    setEmail(step1.email);
  }, [router]);

  function validateUsername(value: string) {
    if (!value) return "Le nom d'utilisateur est requis.";
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(value))
      return "3 à 20 caractères : lettres, chiffres ou _.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const err = validateUsername(username);
    setFieldError(err);
    if (err) return;

    const step1 = getRegisterStep1();
    if (!step1) {
      router.replace("/register");
      return;
    }

    setIsLoading(true);
    try {
      const { token, user } = await registerUser({
        email: step1.email,
        password: step1.password,
        username,
      });
      clearRegisterStep1();
      login(token, user);
      router.push("/home");
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        const msg = err.response.data?.message ?? "Une erreur est survenue.";
        setError(msg);
      } else {
        setError("Une erreur est survenue. Réessaie plus tard.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const initials = username
    ? username[0].toUpperCase()
    : "?";

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col" noValidate>
      {/* Email confirmé */}
      <div className="flex items-center gap-[8px] bg-surface rounded-[10px] px-[14px] py-[10px] mb-10">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="text-[13px] text-sub">
          Email confirmé —{" "}
          <strong className="text-ink">{email}</strong>
        </span>
      </div>

      <h1 className="text-[28px] font-extrabold text-ink tracking-tight mb-2">
        Dernière étape.
      </h1>
      <p className="text-[14px] text-sub mb-9">
        Choisis comment tu t&apos;appelles sur Breezy.
      </p>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-[10px] bg-red-50 border border-red-200 text-[13px] text-red-700">
          {error}
        </div>
      )}

      {/* Big @ input */}
      <div className="relative mb-[10px]">
        <span className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[22px] font-bold text-sub pointer-events-none">
          @
        </span>
        <input
          id="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setFieldError(null);
          }}
          placeholder="alexmartin"
          className={[
            "w-full h-[60px] border-2 rounded-[14px] pl-[38px] pr-[18px] text-[22px] font-bold text-ink bg-white placeholder:text-muted outline-none transition-colors tracking-[-0.5px]",
            fieldError
              ? "border-red-400 focus:border-red-400"
              : "border-ink",
          ].join(" ")}
        />
      </div>

      {/* Availability / field error */}
      <div className="flex items-center gap-[6px] mb-8 pl-[2px] min-h-[20px]">
        {fieldError ? (
          <p className="text-[13px] text-red-500">{fieldError}</p>
        ) : username && !fieldError ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-[13px] text-sub">Disponible</span>
          </>
        ) : null}
      </div>

      {/* Profile preview */}
      <div className="border-[1.5px] border-line rounded-[14px] p-4 mb-8">
        <p className="text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-3">
          Aperçu de ton profil
        </p>
        <div className="flex items-center gap-3">
          <div className="size-[44px] rounded-full bg-ink flex items-center justify-center text-white text-[16px] font-extrabold shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-[15px] font-bold text-ink">
              {username || "—"}
            </p>
            <p className="text-[13px] text-sub">
              @{username || "—"}
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !username}
        className="w-full h-[50px] bg-ink text-white rounded-full text-[16px] font-bold hover:bg-black/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? <Spinner size="sm" /> : "C'est parti →"}
      </button>
    </form>
  );
}
