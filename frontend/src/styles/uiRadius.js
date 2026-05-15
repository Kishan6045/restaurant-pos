/**
 * Shared border-radius tokens (Tailwind class strings).
 * Use these so cards, buttons, and chips stay consistent across cashier / kitchen / billing / admin.
 */
export const RADIUS = {
  /** Main cards: menu, cart, tables, billing sections */
  panel: "rounded-2xl",
  /** Large floating header / hero shells */
  panelLg: "rounded-2xl sm:rounded-3xl",
  /** Mobile bottom drawer top corners */
  sheetTop: "rounded-t-3xl",
  /** Standard buttons */
  btn: "rounded-xl",
  /** Toolbar actions, category chips, search */
  pill: "rounded-full",
  /** Text inputs (non-pill) */
  input: "rounded-xl",
  /** Search bars */
  inputPill: "rounded-full",
  /** Status / count chips */
  chip: "rounded-full",
  /** Small badges in dense lists (kitchen lines) */
  badge: "rounded-lg",
  /** List rows (POS lines) */
  row: "rounded-xl",
  thumb: "rounded-lg",
  thumbLg: "rounded-xl",
  /** Icon-only controls */
  icon: "rounded-xl",
};
