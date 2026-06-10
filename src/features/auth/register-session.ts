export const REGISTER_STEP1_KEY = "breezy_register_step1";

export interface RegisterStep1Data {
  email: string;
  password: string;
}

export function getRegisterStep1(): RegisterStep1Data | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(REGISTER_STEP1_KEY);
    return raw ? (JSON.parse(raw) as RegisterStep1Data) : null;
  } catch {
    return null;
  }
}

export function clearRegisterStep1(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(REGISTER_STEP1_KEY);
  }
}
