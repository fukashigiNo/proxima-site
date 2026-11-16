type Callback = () => void;
const callbacks = new WeakMap<Element, Callback>();
let observer: IntersectionObserver | null = null;

export function onceVisible(element: Element, callback: Callback) {
  if (typeof IntersectionObserver === "undefined") {
    callback();
    return () => {};
  }
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.();
        callbacks.delete(entry.target);
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  callbacks.set(element, callback);
  observer.observe(element);
  return () => {
    callbacks.delete(element);
    observer?.unobserve(element);
  };
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
