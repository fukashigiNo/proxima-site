export const PROXIMA_HREF = "/proxima";
export const PROXIMA_WARP_EVENT = "proxima:warp";
export const WARP_MS = 950;
export const ARRIVE_MS = 750;

export const isWarping = () => document.documentElement.hasAttribute("data-warping");

const CONTENT = 1280;

export const PROXIMA_SLOT_EVENT = "proxima:slot";

let headerSlot: { x: number; y: number } | null = null;
export function setProximaSlot(slot: { x: number; y: number } | null) {
  const changed = slot?.x !== headerSlot?.x || slot?.y !== headerSlot?.y;
  headerSlot = slot;
  if (changed) window.dispatchEvent(new Event(PROXIMA_SLOT_EVENT));
}

export function proximaPosition(width: number, height: number, scroll: number) {
  const margin = (width - CONTENT) / 2;
  if (margin > 40) return { x: width - margin / 2, y: height * 0.38 - scroll * 0.04, clickable: true, scale: 1, inHeader: false };
  if (headerSlot) return { x: headerSlot.x, y: headerSlot.y, clickable: true, scale: 0.62, inHeader: true };
  return { x: width * 0.9, y: height * 0.38 - scroll * 0.04, clickable: false, scale: 1, inHeader: false };
}
