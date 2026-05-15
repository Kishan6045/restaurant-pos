import { RADIUS } from "../../styles/uiRadius";

/**
 * Shared compact list row styling (cashier / kitchen) — mini thumb | title | price / actions.
 */
export const POS = {
  list: "flex flex-col gap-2",
  row: `flex w-full items-center gap-2.5 ${RADIUS.row} border border-indigo-100/70 bg-white px-2.5 py-2 text-left shadow-[0_1px_3px_rgba(67,56,202,0.06)] ring-1 ring-indigo-950/[0.03]`,
  rowStatic: `flex w-full items-center gap-2.5 ${RADIUS.row} border border-indigo-100/70 bg-white px-2.5 py-2 text-left shadow-[0_1px_3px_rgba(67,56,202,0.06)] ring-1 ring-indigo-950/[0.03]`,
  rowBtn: `flex w-full items-center gap-2.5 ${RADIUS.row} border border-indigo-100/70 bg-white px-2.5 py-2 text-left shadow-[0_1px_3px_rgba(67,56,202,0.06)] ring-1 ring-indigo-950/[0.03] transition hover:border-indigo-200 hover:bg-indigo-50/45 hover:shadow-[0_4px_14px_rgba(67,56,202,0.12)] active:scale-[0.99]`,
  thumb: `h-10 w-10 shrink-0 ${RADIUS.thumb} bg-indigo-50 object-cover shadow-inner ring-1 ring-indigo-100/70`,
  thumbLg: `h-12 w-12 shrink-0 ${RADIUS.thumbLg} bg-indigo-50 object-cover shadow-inner ring-1 ring-indigo-100/70 sm:h-[3.25rem] sm:w-[3.25rem]`,
  mono: `flex h-10 w-10 shrink-0 items-center justify-center ${RADIUS.thumbLg} bg-indigo-50 text-[11px] font-bold text-indigo-800 ring-1 ring-indigo-100/80`,
  title: "truncate text-[13px] font-medium leading-tight text-slate-900",
  sub: "truncate text-[10px] text-slate-500",
  price: "text-sm font-semibold tabular-nums text-indigo-950",
  priceSm: "text-xs font-semibold tabular-nums text-indigo-950",
};

/** Image for order line / cart line / product (handles populated productId). */
export function posLineImageSrc(item) {
  const p = item?.productId;
  if (p && typeof p === "object" && p.image) return p.image;
  if (typeof item?.image === "string" && item.image) return item.image;
  return "/no-image.png";
}
