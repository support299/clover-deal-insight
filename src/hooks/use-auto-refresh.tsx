import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

/**
 * Periodically invalidate the current router state so loaders re-run.
 * @param intervalMs polling interval in milliseconds
 */
export function useAutoRefresh(intervalMs: number) {
  const router = useRouter();
  useEffect(() => {
    if (!intervalMs || intervalMs <= 0) return;
    const id = setInterval(() => {
      // Skip while tab is hidden to avoid unnecessary work
      if (typeof document !== "undefined" && document.hidden) return;
      router.invalidate();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
}
