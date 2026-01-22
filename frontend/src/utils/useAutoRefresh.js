import { useEffect, useRef } from "react";

const useAutoRefresh = (callback, intervalMs, options = {}) => {
  const {
    enabled = true,
    runOnMount = true,
    skipIfRunning = true,
  } = options;

  const savedCallback = useRef(callback);
  const runningRef = useRef(false);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !intervalMs || intervalMs <= 0) return undefined;

    const run = async () => {
      if (skipIfRunning && runningRef.current) return;
      runningRef.current = true;
      try {
        await savedCallback.current();
      } catch (err) {
        // Avoid breaking the interval loop on errors.
        console.error("Auto refresh failed:", err);
      } finally {
        runningRef.current = false;
      }
    };

    if (runOnMount) {
      run();
    }

    const id = setInterval(run, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, runOnMount, skipIfRunning]);
};

export default useAutoRefresh;
