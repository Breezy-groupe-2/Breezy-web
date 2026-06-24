"use client";

import { useEffect, useRef } from "react";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GSI_SRC = "https://accounts.google.com/gsi/client";

/** Whether "Sign in with Google" is configured. */
export const isGoogleConfigured = Boolean(CLIENT_ID);

interface GsiId {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GsiId } };
  }
}

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("not in browser"));
      return;
    }
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("GSI load failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("GSI load failed"));
    document.head.appendChild(script);
  });
}

interface GoogleButtonProps {
  onCredential: (credential: string) => void;
  /** "signin_with" | "signup_with" | "continue_with" */
  text?: string;
}

/**
 * Renders Google's official sign-in button (popup ID-token flow). This is far
 * more reliable than One Tap / FedCM `prompt()`, which can fail with NetworkError
 * depending on the browser and third-party-cookie settings. Renders nothing when
 * Google is not configured.
 */
export function GoogleButton({ onCredential, text = "continue_with" }: GoogleButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);

  // Keep the latest callback without writing the ref during render.
  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGsiScript()
      .then(() => {
        const gsi = window.google?.accounts?.id;
        if (cancelled || !gsi || !containerRef.current) return;
        gsi.initialize({
          client_id: CLIENT_ID,
          callback: (response) => {
            if (response.credential) callbackRef.current(response.credential);
          },
        });
        containerRef.current.innerHTML = "";
        gsi.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text,
          logo_alignment: "center",
          width: 320,
        });
      })
      .catch(() => {
        /* leave the slot empty if GSI fails to load */
      });

    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!CLIENT_ID) return null;
  return <div ref={containerRef} className="flex justify-center min-h-[44px]" />;
}
