/** Mongo documents use `_id`; legacy UI sometimes used `id`. */
export function docId(entity) {
  if (entity == null) return "";
  const v = entity._id ?? entity.id;
  return v != null ? String(v) : "";
}
