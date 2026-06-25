"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

interface ComposeContextValue {
  isOpen: boolean;
  openCompose: () => void;
  closeCompose: () => void;
  submit: (content: string, mediaUrl?: string) => Promise<void>;
  registerHandler: (fn: (content: string, mediaUrl?: string) => Promise<void>) => void;
}

const ComposeContext = createContext<ComposeContextValue | null>(null);

export function ComposeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const handlerRef = useRef<(content: string, mediaUrl?: string) => Promise<void>>(async () => {});

  const openCompose = useCallback(() => setIsOpen(true), []);
  const closeCompose = useCallback(() => setIsOpen(false), []);

  const submit = useCallback(async (content: string, mediaUrl?: string) => {
    try {
      await handlerRef.current(content, mediaUrl);
      setIsOpen(false);
    } catch {
      // handler threw — keep sheet open so user can retry
    }
  }, []);

  const registerHandler = useCallback(
    (fn: (content: string, mediaUrl?: string) => Promise<void>) => {
      handlerRef.current = fn;
    },
    []
  );

  return (
    <ComposeContext.Provider
      value={{ isOpen, openCompose, closeCompose, submit, registerHandler }}
    >
      {children}
    </ComposeContext.Provider>
  );
}

export function useCompose(): ComposeContextValue {
  const ctx = useContext(ComposeContext);
  if (!ctx) throw new Error("useCompose must be used inside ComposeProvider");
  return ctx;
}
