"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { players } from "@/lib/api";
import { containsProfanity } from "@/lib/profanity";
import { setSession } from "@/lib/identity";

type Tab = "register" | "login";

interface Props {
  onSuccess: (guestId: string, alias: string) => void;
}

const ALIAS_RE = /^[a-zA-Z0-9]+$/;

function validateAlias(alias: string, t: (k: string) => string): string | null {
  if (alias.length === 0) return null;
  if (alias.length < 4) return t("identity.errorTooShort");
  if (alias.length > 8) return t("identity.errorTooLong");
  if (!ALIAS_RE.test(alias)) return t("identity.errorInvalidChars");
  if (containsProfanity(alias)) return t("identity.errorProfanity");
  return null;
}

function validatePin(pin: string, t: (k: string) => string): string | null {
  if (!pin) return null;
  if (!/^\d{4}$/.test(pin)) return t("identity.errorPinInvalid");
  return null;
}

export function PlayerAliasModal({ onSuccess }: Props) {
  const { t } = useI18n();

  const [tab, setTab] = useState<Tab>("register");
  const [alias, setAlias] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // availability check state (register tab only)
  const [availStatus, setAvailStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  // login-specific: alias tiene PIN en el servidor (hint o respuesta 401)
  const [pinRequired, setPinRequired] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const aliasError = validateAlias(alias, t);
  const pinError = validatePin(pin, t);

  // ── Availability debounce (register tab) ─────────────────────────────────
  useEffect(() => {
    if (tab !== "register") return;
    if (alias.length < 4 || aliasError) {
      setAvailStatus("idle");
      return;
    }
    setAvailStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { available } = await players.available(alias);
        setAvailStatus(available ? "available" : "taken");
      } catch {
        setAvailStatus("idle");
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [alias, aliasError, tab]);

  // Login: check whether the alias exists and requires a PIN (avoids 401 on first try)
  useEffect(() => {
    if (tab !== "login") return;
    if (alias.length < 4 || aliasError) {
      setPinRequired(false);
      return;
    }
    if (hintDebounceRef.current) clearTimeout(hintDebounceRef.current);
    hintDebounceRef.current = setTimeout(async () => {
      try {
        const h = await players.hint(alias);
        setPinRequired(Boolean(h.exists && h.hasPin));
      } catch {
        setPinRequired(false);
      }
    }, 400);
    return () => {
      if (hintDebounceRef.current) clearTimeout(hintDebounceRef.current);
    };
  }, [alias, aliasError, tab]);

  // Clear errors when switching tabs
  useEffect(() => {
    setServerError(null);
    setPinRequired(false);
    setPin("");
  }, [tab]);

  // ── Submit register ───────────────────────────────────────────────────────
  const handleRegister = useCallback(async () => {
    if (aliasError || pinError || availStatus !== "available") return;
    setPending(true);
    setServerError(null);
    try {
      const { guestId, alias: displayAlias } = await players.register(
        alias,
        pin || undefined,
      );
      setSession(guestId, displayAlias);
      onSuccess(guestId, displayAlias);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setPending(false);
    }
  }, [alias, pin, aliasError, pinError, availStatus, onSuccess]);

  // ── Submit login ──────────────────────────────────────────────────────────
  const handleLogin = useCallback(async () => {
    if (!alias.trim()) return;
    setPending(true);
    setServerError(null);
    try {
      const { guestId, alias: displayAlias } = await players.login(
        alias,
        pin || undefined,
      );
      setSession(guestId, displayAlias);
      onSuccess(guestId, displayAlias);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      // If backend says PIN is required, show the PIN field
      if (msg.toLowerCase().includes("pin")) {
        setPinRequired(true);
      }
      setServerError(msg);
    } finally {
      setPending(false);
    }
  }, [alias, pin, onSuccess]);

  // ── Keyboard submit ───────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Enter" || pending) return;
      if (tab === "register") handleRegister();
      else handleLogin();
    },
    [tab, pending, handleRegister, handleLogin],
  );

  const registerDisabled =
    pending ||
    Boolean(aliasError) ||
    Boolean(pinError) ||
    availStatus !== "available";

  const loginNeedsPin = pinRequired;
  const loginPinReady = !loginNeedsPin || /^\d{4}$/.test(pin);
  const loginDisabled =
    pending ||
    !alias.trim() ||
    Boolean(aliasError) ||
    Boolean(pinError) ||
    !loginPinReady;

  // ── Alias availability indicator ──────────────────────────────────────────
  const availNode = (() => {
    if (tab !== "register" || alias.length < 4 || aliasError) return null;
    if (availStatus === "checking")
      return (
        <span className="text-[var(--muted)]">{t("identity.aliasChecking")}</span>
      );
    if (availStatus === "available")
      return (
        <span className="text-emerald-400">{t("identity.aliasAvailable")}</span>
      );
    if (availStatus === "taken")
      return (
        <span className="text-[var(--status-danger-bright)]">
          {t("identity.aliasTaken")}
        </span>
      );
    return null;
  })();

  const inputBase =
    "w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-shadow duration-150";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="identity-modal-title"
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="px-6 pt-7 pb-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent-text)]">
            {t("app.title")}
          </p>
          <h2
            id="identity-modal-title"
            className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]"
          >
            {t("identity.welcomeTitle")}
          </h2>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            {t("identity.welcomeSubtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="mx-6 flex rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-1">
          {(["register", "login"] as Tab[]).map((t_) => (
            <button
              key={t_}
              type="button"
              onClick={() => setTab(t_)}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors duration-150 ${
                tab === t_
                  ? "bg-[var(--accent)] text-[var(--on-accent)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {t_ === "register" ? t("identity.tabNew") : t("identity.tabLogin")}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="px-6 pt-5 pb-6 flex flex-col gap-4">
          {/* Hint */}
          <p className="text-xs text-[var(--muted)]">
            {tab === "register"
              ? t("identity.aliasHint")
              : t("identity.loginHint")}
          </p>

          {/* Alias input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="identity-alias"
              className="text-xs font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider"
            >
              {t("identity.aliasLabel")}
            </label>
            <input
              id="identity-alias"
              type="text"
              autoComplete="username"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={8}
              value={alias}
              onChange={(e) => {
                setAlias(e.target.value);
                setServerError(null);
                if (tab === "register") setPinRequired(false);
              }}
              placeholder={t("identity.aliasPlaceholder")}
              className={inputBase}
              aria-describedby={aliasError ? "alias-error" : undefined}
              aria-invalid={Boolean(aliasError)}
            />
            {/* validation / availability message */}
            <div className="min-h-[1.1rem] text-[11px]">
              {aliasError ? (
                <span id="alias-error" className="text-[var(--status-danger-bright)]">
                  {aliasError}
                </span>
              ) : (
                availNode
              )}
            </div>
          </div>

          {/* PIN input */}
          {(tab === "register" || (tab === "login" && pinRequired)) && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="identity-pin"
                className="text-xs font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider"
              >
                {tab === "register"
                  ? t("identity.pinLabel")
                  : t("identity.pinLabelRequired")}
              </label>
              <div className="relative">
                <input
                  id="identity-pin"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="current-password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                    setServerError(null);
                  }}
                  placeholder={t("identity.pinPlaceholder")}
                  className={`${inputBase} pr-12`}
                  aria-describedby={pinError ? "pin-error" : undefined}
                  aria-invalid={Boolean(pinError)}
                />
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-xs hover:text-[var(--foreground)] transition-colors"
                  aria-label={showPin ? t("identity.pinHide") : t("identity.pinShow")}
                >
                  {showPin ? "✕" : "◉"}
                </button>
              </div>
              {pinError ? (
                <span id="pin-error" className="text-[11px] text-[var(--status-danger-bright)]">
                  {pinError}
                </span>
              ) : (
                tab === "register" && (
                  <span className="text-[11px] text-[var(--muted)]">
                    {t("identity.pinHint")}
                  </span>
                )
              )}
            </div>
          )}

          {/* Server error */}
          {serverError && (
            <p
              className="rounded-xl border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] px-3 py-2 text-xs text-[var(--status-warn-fg)]"
              role="alert"
            >
              {serverError}
            </p>
          )}

          {/* Submit button */}
          <button
            type="button"
            onClick={tab === "register" ? handleRegister : handleLogin}
            disabled={tab === "register" ? registerDisabled : loginDisabled}
            className="mt-1 flex w-full min-h-[2.75rem] items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-opacity duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60"
          >
            {pending
              ? tab === "register"
                ? t("identity.registerBtnLoading")
                : t("identity.loginBtnLoading")
              : tab === "register"
                ? t("identity.registerBtn")
                : t("identity.loginBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
