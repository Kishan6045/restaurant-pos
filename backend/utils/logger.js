const util = require("util");

const LOG_ENABLED = process.env.LOG_ENABLED === "true";
const time = () => new Date().toLocaleTimeString();

// ---------- OLD FORMAT (safe rakha) ----------
const inspect = (data) =>
  util.inspect(data, {
    depth: 4,
    colors: true,
    maxArrayLength: 10,
    breakLength: 120,
  });

exports.info = (title, data) => {
  if (!LOG_ENABLED) return;
  console.log(`\n🟢 ${title}`);
  if (data) console.log(inspect(data));
};

exports.warn = (title, data) => {
  if (!LOG_ENABLED) return;
  console.warn(`\n🟡 ${title}`);
  if (data) console.warn(inspect(data));
};

exports.error = (title, data) => {
  console.error(`\n🔴 ${title}`);
  if (data) console.error(inspect(data));
};

// ---------- HTTP DROPDOWN LOGGER (⭐ IMPORTANT) ----------
exports.http = ({ method, url, status, data }) => {
  if (!LOG_ENABLED) return;

  console.groupCollapsed(
    `${method.toUpperCase()} 🟢(${status}) || ${url} [${time()}]`
  );

  // 👇 sirf click karne par dikhega
  if (Array.isArray(data)) {
    console.table(data.slice(0, 5)); // max 5 rows
  } else if (data) {
    console.log(data);
  }

  console.groupEnd();
};
