"use client";

import { useSyncExternalStore } from "react";

const EVENTS = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;

let activated = false;
const listeners = new Set<() => void>();

const activate = () => {
  if (activated) return;
  activated = true;
  EVENTS.forEach((e) => window.removeEventListener(e, activate));
  listeners.forEach((l) => l());
};

if (typeof window !== "undefined") {
  EVENTS.forEach((e) => window.addEventListener(e, activate, { passive: true, once: true }));
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useUserActivation = () =>
  useSyncExternalStore(
    subscribe,
    () => activated,
    () => false,
  );
