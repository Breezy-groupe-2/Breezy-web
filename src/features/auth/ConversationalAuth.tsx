"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon, Avatar } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/store/theme-context";
import { loginUser, registerUser, loginWithGoogle } from "./auth.api";
import { GoogleButton, isGoogleConfigured } from "./GoogleButton";
import { isAxiosError } from "@/lib/axios";

const FLOAT_CARDS = [
  { name: "Lina Khoury",  avatar: "https://i.pravatar.cc/150?img=45", text: "7h12 sur les toits. juste le soleil qui fait son taf.",          style: { top: "9%",  left: "3%",  rotate: "-4deg" } },
  { name: "Jade Olivier", avatar: "https://i.pravatar.cc/150?img=44", text: "Il pleut. parfait. j'avais prévu de ne rien faire.",              style: { top: "12%", right: "3%", rotate: "3deg"  } },
  { name: "Maé Lambert",  avatar: "https://i.pravatar.cc/150?img=47", text: "laisser de l'air, c'est aussi un choix de design.",               style: { bottom: "18%", left: "2%", rotate: "-3deg" } },
  { name: "Noah Berger",  avatar: "https://i.pravatar.cc/150?img=12", text: "ralentis tes animations de 80ms. tout devient doux.",             style: { bottom: "14%", right: "2%", rotate: "4deg" } },
] as const;

type Mode = "login" | "register";
type StepKey = "email" | "pwd" | "username";

const PROMPTS: Record<StepKey, { q: (mode: Mode) => string; ph: string; type: string }> = {
  email: {
    q: (m) => (m === "login" ? "Content de te revoir." : "On commence par ton email."),
    ph: "toi@exemple.com",
    type: "email",
  },
  pwd: {
    q: (m) => (m === "login" ? "Ton mot de passe." : "Choisis un mot de passe."),
    ph: "••••••••",
    type: "password",
  },
  username: {
    q: () => "Et comment on t'appelle ?",
    ph: "mon_pseudo",
    type: "text",
  },
};

function pwdStrength(pwd: string): number {
  return Math.min(3, Math.floor(pwd.length / 4) + (/[0-9]/.test(pwd) ? 1 : 0));
}

interface ConversationalAuthProps {
  initialMode?: Mode;
}

export function ConversationalAuth({ initialMode = "login" }: ConversationalAuthProps) {
  const router = useRouter();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [username, setUsername] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const steps: StepKey[] = mode === "login" ? ["email", "pwd"] : ["email", "pwd", "username"];
  const key = steps[step];
  const prompt = PROMPTS[key];

  const value = key === "email" ? email : key === "pwd" ? pwd : username;
  const setValue = (v: string) => {
    setErr("");
    if (key === "email") setEmail(v);
    else if (key === "pwd") setPwd(v);
    else setUsername(v.replace(/[^a-zA-Z0-9_]/g, ""));
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [step, mode]);

  function validate(): string {
    if (key === "email")
      return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
        ? ""
        : "Hmm, cet email ne ressemble pas à un email.";
    if (key === "pwd")
      return pwd.length >= 8 ? "" : "Il faut au moins 8 caractères.";
    return /^[a-zA-Z0-9_]{3,50}$/.test(username)
      ? ""
      : "3 à 50 caractères : lettres, chiffres ou _.";
  }

  async function next() {
    const e = validate();
    if (e) { setErr(e); return; }

    if (step < steps.length - 1) {
      setErr("");
      setStep((s) => s + 1);
      return;
    }

    setLoading(true);
    try {
      const res =
        mode === "login"
          ? await loginUser({ email, password: pwd })
          : await registerUser({ email, password: pwd, username });
      login(res.token, res.user);
      router.push("/home");
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setErr(err.response.data?.error ?? "Identifiants incorrects.");
      } else {
        setErr("Une erreur est survenue. Réessaie plus tard.");
      }
    } finally {
      setLoading(false);
    }
  }

  function back() {
    if (step > 0) { setErr(""); setStep((s) => s - 1); }
  }

  const onGoogleCredential = async (credential: string) => {
    setGoogleLoading(true);
    setErr("");
    try {
      const res = await loginWithGoogle(credential);
      login(res.token, res.user);
      router.push("/home");
    } catch {
      setErr("Impossible de se connecter avec Google. Réessaie.");
    } finally {
      setGoogleLoading(false);
    }
  };


  function switchMode(m: Mode) {
    setMode(m);
    setStep(0);
    setErr("");
    setEmail("");
    setPwd("");
    setUsername("");
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") next();
  }

  const strength = pwdStrength(pwd);
  const isLast = step === steps.length - 1;

  return (
    <div className="relative h-svh overflow-hidden flex flex-col">
      {/* Background gradient blobs */}
      <div
        className="absolute w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: "var(--primary-soft)", top: -140, left: -100, filter: "blur(12px)", opacity: 0.8 }}
      />
      <div
        className="absolute w-[260px] h-[260px] rounded-full pointer-events-none"
        style={{ background: "var(--like-soft)", bottom: -100, right: -80, filter: "blur(12px)", opacity: 0.75 }}
      />

      {/* Floating preview cards */}
      {FLOAT_CARDS.map((card) => (
        <div
          key={card.name}
          className="absolute pointer-events-none hidden sm:flex items-center gap-3 px-4 py-3 max-w-[220px]"
          style={{
            ...card.style,
            background: "color-mix(in oklch, var(--surface) 55%, transparent)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: 18,
            boxShadow: "var(--card-shadow)",
            transform: `rotate(${card.style.rotate})`,
          }}
        >
          <Avatar displayName={card.name} src={card.avatar} size={36} />
          <div className="min-w-0">
            <p className="text-[12px] font-bold truncate" style={{ color: "var(--text)" }}>{card.name}</p>
            <p className="text-[11.5px] leading-snug" style={{ color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{card.text}</p>
          </div>
        </div>
      ))}

      {/* Top bar */}
      <div className="absolute top-14 left-5 right-5 flex items-center justify-between z-10">
        <div className="w-[42px]">
          {step > 0 && (
            <button
              onClick={back}
              className="w-[42px] h-[42px] flex items-center justify-center rounded-full"
              style={{ background: "var(--surface)", boxShadow: "var(--card-shadow)" }}
            >
              <Icon name="back" size={20} color="var(--text)" />
            </button>
          )}
        </div>
        <button
          onClick={toggleTheme}
          className="w-[42px] h-[42px] flex items-center justify-center rounded-full"
          style={{ background: "var(--surface)", boxShadow: "var(--card-shadow)" }}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} size={20} color="var(--text)" />
        </button>
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-[2]">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-7">
          <div
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              background: "var(--primary)",
              transform: "rotate(-4deg)",
            }}
          >
            <Icon name="gust" size={24} color="var(--on-primary)" stroke={2.1} />
          </div>
          <span
            className="font-display font-extrabold tracking-tight"
            style={{ fontSize: 24, color: "var(--text)", letterSpacing: "-0.03em" }}
          >
            breezy
          </span>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5 mb-5">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === step ? 26 : 16,
                background: i <= step ? "var(--primary)" : "var(--surface-2)",
              }}
            />
          ))}
        </div>

        {/* Question */}
        <h1
          className="font-display font-extrabold mb-1.5"
          style={{
            fontSize: 30,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            textWrap: "balance",
          } as React.CSSProperties}
        >
          {prompt.q(mode)}
        </h1>

        {step === 0 && (
          <p className="mb-5" style={{ fontSize: 15, color: "var(--text-muted)" }}>
            {mode === "login"
              ? "Connecte-toi pour retrouver ton fil."
              : "Quelques secondes et c'est à toi."}
          </p>
        )}

        {step > 0 && (
          <button
            onClick={back}
            className="inline-flex items-center gap-1.5 mb-4"
            style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-faint)" }}
          >
            <Icon name="back" size={14} color="var(--text-faint)" />
            {email}
            {key === "username" && " · ••••••••"}
          </button>
        )}

        {/* Input pill */}
        <div
          className="flex items-center gap-2 w-full max-w-[360px] h-[60px] px-1.5 pl-5 rounded-[18px] transition-all"
          style={{
            background: "var(--surface)",
            boxShadow: err
              ? "inset 0 0 0 2px var(--like), var(--card-shadow)"
              : "inset 0 0 0 1.5px var(--border), var(--card-shadow)",
          }}
        >
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type={key === "pwd" ? (showPwd ? "text" : "password") : prompt.type}
            placeholder={prompt.ph}
            onKeyDown={onKeyDown}
            autoComplete={key === "email" ? "email" : key === "pwd" ? (mode === "login" ? "current-password" : "new-password") : "username"}
            className="flex-1 bg-transparent border-none outline-none text-[17px]"
            style={{ color: "var(--text)" }}
          />
          {key === "pwd" && (
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="w-9 h-9 flex items-center justify-center"
              style={{ color: "var(--text-faint)" }}
            >
              <Icon name={showPwd ? "eyeOff" : "eye"} size={19} />
            </button>
          )}
          <button
            onClick={next}
            disabled={loading}
            className="w-12 h-12 flex items-center justify-center rounded-[15px] transition-opacity disabled:opacity-60"
            style={{ background: "var(--primary)", flexShrink: 0 }}
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin block" />
            ) : (
              <Icon
                name={isLast ? "check" : "send"}
                size={20}
                color="var(--on-primary)"
                stroke={2.2}
              />
            )}
          </button>
        </div>

        {/* Password strength */}
        {key === "pwd" && mode === "register" && pwd && (
          <div className="flex gap-1 mt-3 px-1 w-full max-w-[360px]">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-colors duration-200"
                style={{
                  background:
                    i < strength
                      ? strength === 1
                        ? "var(--like)"
                        : strength === 2
                        ? "oklch(0.78 0.13 90)"
                        : "oklch(0.7 0.14 155)"
                      : "var(--surface-2)",
                }}
              />
            ))}
          </div>
        )}

        {/* Username preview */}
        {key === "username" && (
          <div
            className="flex items-center gap-2 mt-3"
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: username.length >= 3 ? "oklch(0.62 0.14 155)" : "var(--text-faint)",
            }}
          >
            <Icon name="check" size={16} />
            breezy.app/@{username || "toi"}
          </div>
        )}

        {/* Error */}
        {err && (
          <p className="mt-3 text-[13px] font-semibold" style={{ color: "var(--like)" }}>
            {err}
          </p>
        )}

        {/* Google OAuth — only on first step */}
        {step === 0 && isGoogleConfigured && (
          <div className="w-full max-w-[360px] mt-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--text-faint)" }}>ou</span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>
            <GoogleButton
              onCredential={onGoogleCredential}
              text={mode === "login" ? "signin_with" : "signup_with"}
            />
            {googleLoading && (
              <p className="mt-2 text-center text-[13px]" style={{ color: "var(--text-faint)" }}>
                Connexion en cours…
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom link */}
      <div className="absolute bottom-6 inset-x-0 px-7 z-10">
        <p className="text-center text-[14.5px]" style={{ color: "var(--text-muted)" }}>
          {mode === "login" ? (
            <>
              Pas encore sur Breezy ?{" "}
              <button
                onClick={() => switchMode("register")}
                className="font-extrabold"
                style={{ color: "var(--primary)" }}
              >
                Créer un compte
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <button
                onClick={() => switchMode("login")}
                className="font-extrabold"
                style={{ color: "var(--primary)" }}
              >
                Se connecter
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
