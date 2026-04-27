"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { WarriorPortrait } from "@/components/WarriorPortrait";
import { useI18n } from "@/i18n/I18nContext";
import { api } from "@/lib/api";
import { getOrCreateGuestId } from "@/lib/guest";
import {
  parseRoomCodeFromPastedValue,
  ROOM_CODE_LEN,
} from "@/lib/room-code";
import { createRoomsSocket, type Socket } from "@/lib/socket";
import type { Warrior } from "@/lib/types";
import { focusRing, pressScale } from "@/lib/ui";

export function PlayOnlineClient() {
  const { t } = useI18n();
  const router = useRouter();
  const search = useSearchParams();
  const codeFromUrl = search.get("code")?.trim().toUpperCase() ?? "";

  const [warriors, setWarriors] = useState<Warrior[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hostWarriorId, setHostWarriorId] = useState<string | null>(null);
  const [joinWarriorId, setJoinWarriorId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [copyHint, setCopyHint] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const hasJoinCodeParam = codeFromUrl.length > 0;
  const joinCodeFromUrlOk = codeFromUrl.length === ROOM_CODE_LEN;
  const joinCodeUrlInvalid = hasJoinCodeParam && !joinCodeFromUrlOk;
  const isJoin = hasJoinCodeParam && joinCodeFromUrlOk;

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        const g = getOrCreateGuestId();
        const w = await api.warriors(g || undefined);
        if (!c) setWarriors(w);
      } catch (e) {
        if (!c)
          setError(e instanceof Error ? e.message : t("online.errorLoad"));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [t]);

  /**
   * Manual fallback: HTTP poll if the socket misses the "room ready" event.
   * Only used from the visible “Refresh” button in the UI.
   */
  const refreshRoom = useCallback(async () => {
    if (!roomCode) return;
    try {
      const s = await api.getOnlineRoom(roomCode);
      setPollError(null);
      if (s.battleId) {
        router.push(`/battle/${s.battleId}`);
      }
    } catch (e) {
      setPollError(e instanceof Error ? e.message : "—");
    }
  }, [roomCode, router]);

  /**
   * WebSocket: once the host has a room code, subscribe to the /rooms
   * namespace and listen for "room:ready" to navigate to the battle without polling.
   */
  useEffect(() => {
    if (!roomCode || isJoin) return;

    const socket = createRoomsSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("watch", roomCode);
      setPollError(null);
    });

    socket.on("room:ready", ({ battleId }: { battleId: string }) => {
      router.push(`/battle/${battleId}`);
    });

    socket.on("connect_error", () => {
      setPollError(t("online.socketRealtimeError"));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomCode, isJoin, router, t]);

  async function createHostRoom() {
    const g = getOrCreateGuestId();
    if (!g || !hostWarriorId) return;
    setCreating(true);
    setError(null);
    try {
      const r = await api.createOnlineRoom({
        guestId: g,
        hostWarriorId: hostWarriorId,
      });
      setRoomCode(r.code);
      const base =
        typeof window !== "undefined" ? window.location.origin : "";
      setShareUrl(
        r.shareUrl.startsWith("http")
          ? r.shareUrl
          : `${base}${r.shareUrl}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : t("online.errorCreate"));
    } finally {
      setCreating(false);
    }
  }

  async function joinOnlineBattle() {
    const g = getOrCreateGuestId();
    if (!g || !joinWarriorId || !codeFromUrl) return;
    setJoining(true);
    setError(null);
    try {
      const r = await api.joinOnlineRoom(codeFromUrl, {
        joinerGuestId: g,
        joinerWarriorId: joinWarriorId,
      });
      router.push(`/battle/${r.battle._id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("online.errorJoin"));
    } finally {
      setJoining(false);
    }
  }

  function goToJoinWithCode() {
    const c = parseRoomCodeFromPastedValue(joinCodeInput);
    if (c.length !== ROOM_CODE_LEN) {
      setError(t("online.invalidCode"));
      return;
    }
    setError(null);
    router.push(`/play/online?code=${encodeURIComponent(c)}`);
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyHint(t("online.copied"));
    } catch {
      setCopyHint(t("online.copyFailed"));
    }
    window.setTimeout(() => setCopyHint(null), 2500);
  }

  return (
    <div className="relative min-h-full overflow-x-clip text-[var(--foreground)]">
      <div className="page-radial pointer-events-none absolute inset-0" aria-hidden />
      <main className="relative mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("online.title")}
          </h1>
          <p className="text-pretty text-sm text-[var(--muted)]">
            {t("online.subtitle")}
          </p>
        </div>

        {loading ? (
          <p className="text-[var(--muted)]">{t("common.loading")}</p>
        ) : error ? (
          <div className="rounded-xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] px-4 py-3 text-sm text-[var(--status-error-fg-soft)]">
            {error}
          </div>
        ) : null}

        {joinCodeUrlInvalid ? (
          <div className="rounded-xl border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] px-4 py-3 text-sm text-[var(--status-warn-fg)]">
            <p className="text-pretty">{t("online.joinCodeUrlInvalid")}</p>
            <Link
              href="/play/online"
              className={`mt-3 inline-block text-[var(--accent-cool)] underline ${focusRing}`}
            >
              {t("online.useOtherCode")}
            </Link>
          </div>
        ) : null}

        {!isJoin && !roomCode && !joinCodeUrlInvalid ? (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] md:items-stretch md:gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-8">
            <section className="flex min-h-0 min-w-0 flex-col space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)]/90 p-5">
              <h2 className="text-lg font-medium text-[var(--foreground-secondary)]">
                {t("online.hostTitle")}
              </h2>
              <p className="text-sm text-[var(--muted)]">{t("online.hostHint")}</p>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                {t("online.pickYourFighter")}
              </label>
              <div className="grid min-h-0 max-h-56 flex-1 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:max-h-64 md:grid-cols-4 md:gap-1.5">
                {warriors.map((w) => (
                  <button
                    key={w._id}
                    type="button"
                    onClick={() => setHostWarriorId(w._id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-left text-sm transition-colors md:gap-2 md:p-2.5 ${hostWarriorId === w._id ? "border-[var(--accent)]/50 bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]" : "border-[var(--border-subtle)] bg-[var(--chip-surface)]"} ${focusRing}`}
                  >
                    <WarriorPortrait
                      slug={w.slug}
                      imageUrl={w.imageUrl}
                      nombre={w.nombre}
                      className="h-20 w-16 md:h-[5.25rem] md:w-[4.25rem]"
                    />
                    <span className="line-clamp-2 text-center text-xs">{w.nombre}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={!hostWarriorId || creating}
                onClick={() => void createHostRoom()}
                className={`mt-auto w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-3 text-sm font-semibold text-[var(--on-accent)] ${pressScale} ${focusRing} disabled:opacity-40`}
              >
                {creating ? t("online.creating") : t("online.createRoom")}
              </button>
            </section>

            <section
              className="flex min-h-0 min-w-0 flex-col space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--chip-surface)] p-5"
              aria-labelledby="join-code-heading"
            >
              <h2
                id="join-code-heading"
                className="text-lg font-medium text-[var(--foreground)]"
              >
                {t("online.pasteCodeTitle")}
              </h2>
              <p className="text-sm text-[var(--muted)]">{t("online.pasteCodeHint")}</p>
              <label
                className="block text-xs font-semibold uppercase tracking-widest text-[var(--muted)]"
                htmlFor="room-code-input"
              >
                {t("online.codeLabel")}
              </label>
              <input
                id="room-code-input"
                type="text"
                name="roomCode"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={64}
                placeholder={t("online.pasteCodePlaceholder")}
                value={joinCodeInput}
                onChange={(e) =>
                  setJoinCodeInput(parseRoomCodeFromPastedValue(e.target.value))
                }
                className={`w-full rounded-xl border border-[var(--border-muted)] bg-[var(--surface-input)] px-4 py-3 font-mono text-lg tracking-widest text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] ${focusRing}`}
              />
              <button
                type="button"
                onClick={() => void goToJoinWithCode()}
                className={`mt-auto w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-[var(--on-accent)] ${pressScale} ${focusRing}`}
              >
                {t("online.continueWithCode")}
              </button>
            </section>
          </div>
        ) : null}

        {!isJoin && roomCode ? (
          <section className="space-y-4 rounded-2xl border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] p-5">
            <h2 className="text-lg font-medium text-[var(--status-warn-fg)]">
              {t("online.roomReady")}
            </h2>
            <p className="text-4xl font-mono font-bold tracking-[0.4em] text-[var(--accent-text)]">
              {roomCode}
            </p>
            {shareUrl ? (
              <div className="space-y-1">
                <p className="text-xs text-[var(--muted)]">{t("online.shareLink")}</p>
                <code className="block break-all rounded-lg bg-[var(--surface-code)] p-3 text-xs text-[var(--foreground)]">
                  {shareUrl}
                </code>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {roomCode ? (
                <button
                  type="button"
                  onClick={() => void copyToClipboard(roomCode)}
                  className={`rounded-lg border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] px-3 py-2 text-xs font-medium text-[var(--status-warn-fg)] ${pressScale} ${focusRing}`}
                >
                  {t("online.copyCode")}
                </button>
              ) : null}
              {shareUrl ? (
                <button
                  type="button"
                  onClick={() => void copyToClipboard(shareUrl)}
                  className={`rounded-lg border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] px-3 py-2 text-xs font-medium text-[var(--status-warn-fg)] ${pressScale} ${focusRing}`}
                >
                  {t("online.copyLink")}
                </button>
              ) : null}
            </div>
            {copyHint ? (
              <p className="text-xs text-[var(--muted)]">{copyHint}</p>
            ) : null}
            <p className="text-sm text-[var(--muted)]">{t("online.waitJoin")}</p>
            {pollError ? (
              <p className="text-sm text-[var(--status-warn-amber)]">{pollError}</p>
            ) : null}
            <button
              type="button"
              onClick={() => void refreshRoom()}
              className={`text-sm text-[var(--accent-text)] underline ${focusRing}`}
            >
              {t("online.refreshOnce")}
            </button>
          </section>
        ) : null}

        {isJoin ? (
          <section className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)]/90 p-5">
            <h2 className="text-lg font-medium text-[var(--foreground-secondary)]">
              {t("online.joinTitle")}
            </h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-sm text-[var(--muted)]">
                {t("online.codeLabel")}:{" "}
                <span className="text-[var(--accent-text)]">{codeFromUrl}</span>
              </p>
              <Link
                href="/play/online"
                className={`text-sm text-[var(--accent-cool)] underline ${focusRing}`}
              >
                {t("online.useOtherCode")}
              </Link>
            </div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              {t("online.pickRivalFighter")}
            </label>
            <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
              {warriors.map((w) => (
                <button
                  key={w._id}
                  type="button"
                  onClick={() => setJoinWarriorId(w._id)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-left text-sm transition-colors ${joinWarriorId === w._id ? "border-sky-400/50 bg-sky-500/10" : "border-[var(--border-subtle)] bg-[var(--chip-surface)]"} ${focusRing}`}
                >
                  <WarriorPortrait
                    slug={w.slug}
                    imageUrl={w.imageUrl}
                    nombre={w.nombre}
                    className="h-24 w-20"
                  />
                  <span className="line-clamp-2 text-center text-xs">{w.nombre}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!joinWarriorId || joining}
              onClick={() => void joinOnlineBattle()}
              className={`w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-[var(--on-accent)] ${pressScale} ${focusRing} disabled:opacity-40`}
            >
              {joining ? t("online.joining") : t("online.joinBattle")}
            </button>
          </section>
        ) : null}

        <p className="text-pretty text-xs text-[var(--muted)]">
          {t("online.rosterNote")}
        </p>

        <Link
          href="/"
          className={`inline-block text-sm text-[var(--accent-text)] underline-offset-4 ${focusRing}`}
        >
          {t("nav.selection")}
        </Link>
      </main>
    </div>
  );
}
