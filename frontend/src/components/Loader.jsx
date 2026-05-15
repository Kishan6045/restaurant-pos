import { Loader2 } from "lucide-react";

const Loader = ({
  label = "Loading...",
  showLabel = true,
  size = 28,
  containerClassName = "",
  spinnerClassName = "text-indigo-600",
  labelClassName = "text-slate-500",
}) => {
  const shouldShowLabel = showLabel && Boolean(label);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${containerClassName}`}
    >
      <Loader2
        className={`animate-spin drop-shadow-sm ${spinnerClassName}`}
        size={size}
        aria-hidden
      />
      {shouldShowLabel ? (
        <p className={`text-sm font-medium ${labelClassName}`}>{label}</p>
      ) : null}
    </div>
  );
};

export default Loader;
