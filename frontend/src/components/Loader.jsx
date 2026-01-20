import { Loader2 } from "lucide-react";

const Loader = ({
  label = "Loading...",
  showLabel = true,
  size = 28,
  containerClassName = "",
  spinnerClassName = "",
  labelClassName = "",
}) => {
  const shouldShowLabel = showLabel && Boolean(label);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-2 text-gray-500 ${containerClassName}`}
    >
      <Loader2 className={`animate-spin ${spinnerClassName}`} size={size} />
      {shouldShowLabel ? (
        <p className={`text-sm ${labelClassName}`}>{label}</p>
      ) : null}
    </div>
  );
};

export default Loader;
