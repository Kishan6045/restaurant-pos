import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

const MENU_GAP = 6;
const Z_MENU = 10050;

/**
 * Custom listbox (no native `<select>` panel) — consistent rounded menu, indigo highlight, shadow.
 * @param {{ value: string|number, label: string, disabled?: boolean }[]} options
 */
export default function Select({
  value,
  onChange,
  options = [],
  disabled = false,
  placeholder = "Select…",
  className = "",
  buttonClassName = "",
  variant = "default",
  id,
  "aria-label": ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const strVal = value === undefined || value === null ? "" : String(value);
  const selected = options.find((o) => !o.disabled && String(o.value) === strVal);
  const displayLabel = selected?.label ?? placeholder;

  const variantClasses =
    variant === "compact"
      ? "min-h-[36px] px-3 py-1.5 text-xs sm:text-sm"
      : "min-h-[42px] px-3 py-2.5 text-sm";

  const updatePosition = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const width = Math.min(r.width, vw - 16);
    const left = Math.min(Math.max(8, r.left), vw - width - 8);
    setMenuStyle({
      position: "fixed",
      left,
      top: r.bottom + MENU_GAP,
      width,
      zIndex: Z_MENU,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const el = btnRef.current;
    const ro = typeof ResizeObserver !== "undefined" && el ? new ResizeObserver(updatePosition) : null;
    if (el && ro) ro.observe(el);
    const onWin = () => updatePosition();
    window.addEventListener("scroll", onWin, true);
    window.addEventListener("resize", onWin);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("scroll", onWin, true);
      window.removeEventListener("resize", onWin);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = () => {
    if (disabled) return;
    setOpen((o) => !o);
  };

  const pick = (opt) => {
    if (opt.disabled) return;
    onChange?.(opt.value);
    setOpen(false);
  };

  const list = (
    <div
      ref={menuRef}
      role="listbox"
      style={menuStyle || undefined}
      className="max-h-60 overflow-y-auto overscroll-contain rounded-xl border border-slate-200/95 bg-white py-1 shadow-card-lg ring-1 ring-black/[0.03]"
    >
      {options.length === 0 ? (
        <div className="px-3 py-2.5 text-sm text-slate-500">No options</div>
      ) : (
        options.map((opt) => {
          const active = !opt.disabled && String(opt.value) === strVal;
          return (
            <button
              key={`${String(opt.value)}-${opt.label}`}
              type="button"
              role="option"
              aria-selected={active}
              disabled={opt.disabled}
              onClick={() => pick(opt)}
              className={[
                "flex w-full items-center px-3 py-2.5 text-left text-sm transition-colors",
                active ? "bg-indigo-50 font-semibold text-indigo-950" : "text-slate-800",
                opt.disabled
                  ? "cursor-not-allowed text-slate-400"
                  : "cursor-pointer hover:bg-slate-50",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })
      )}
    </div>
  );

  return (
    <>
      <div className={className}>
        <button
          ref={btnRef}
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={toggle}
          className={[
            "flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white text-left font-medium text-slate-800 shadow-sm transition",
            "hover:border-slate-300",
            "focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500",
            "disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:shadow-none",
            open ? "border-indigo-500 ring-2 ring-indigo-100" : "",
            variantClasses,
            buttonClassName,
          ].join(" ")}
        >
          <span className="min-w-0 flex-1 truncate">{displayLabel}</span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>
      {open && menuStyle ? createPortal(list, document.body) : null}
    </>
  );
}
