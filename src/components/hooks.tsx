import { useEffect, useMemo, useRef } from "preact/hooks";

/**
 * Get the buzzer settings from local storage.
 */
export function useBuzzerSettings() {
  // prettier-ignore
  return useMemo(
    () => ({
      startFrequency: Number(localStorage.getItem("buzzer.startFrequency")),
      startDuration: Number(localStorage.getItem("buzzer.startDuration")),
      startMinimumDelay: Number(localStorage.getItem("buzzer.startMinimumDelay")),
      startRandomDelay: Number(localStorage.getItem("buzzer.startRandomDelay")),
      endFrequency: Number(localStorage.getItem("buzzer.endFrequency")),
      endDuration: Number(localStorage.getItem("buzzer.endDuration")),
      threshold: Number(localStorage.getItem("calibration.threshold")),
      cooldown: Number(localStorage.getItem("calibration.cooldown")),
    }),
    []
  );
}

/**
 * Get a ref to pass to a component allowing it to use the remaining height
 * (excluding the footer area) to place scrollable content if it has CSS
 * property `overflow-y: auto`.
 * @returns Reference to pass to an element.
 */
export function useRemainingHeight(dependencies?: any[]) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const updateHeight = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const offsetTop = rect.top;
        ref.current.style.height = `calc(100vh - ${offsetTop}px - var(--footer-size))`;
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, dependencies);

  return ref;
}
