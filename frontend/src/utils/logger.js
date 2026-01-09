const ENABLE_LOG = import.meta.env.VITE_LOG_ENABLED === "true";

const time = () => new Date().toLocaleTimeString();

export const log = (title, payload = {}) => {
  if (!ENABLE_LOG) return;

  console.groupCollapsed(
    `%c🟢 ${title} [%c${time()}%c]`,
    "color:#22c55e;font-weight:bold",
    "color:#0ea5e9",
    "color:#22c55e"
  );

  Object.entries(payload).forEach(([key, value]) => {
    console.log(key, value);
  });

  console.groupEnd();
};

export const logError = (title, payload = {}) => {
  if (!ENABLE_LOG) return;

  console.groupCollapsed(
    `%c🔴 ${title} [%c${time()}%c]`,
    "color:#ef4444;font-weight:bold",
    "color:#0ea5e9",
    "color:#ef4444"
  );

  Object.entries(payload).forEach(([key, value]) => {
    console.error(key, value);
  });

  console.groupEnd();
};
