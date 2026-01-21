import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut } from "lucide-react";

const ProfileDropdown = ({ role, userName }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const storedRole =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const resolvedRole = role || storedRole;
  const roleLabel = resolvedRole
    ? `${resolvedRole.charAt(0).toUpperCase()}${resolvedRole.slice(1)}`
    : "User";
  const displayName = userName || `${roleLabel} User`;

  // close on outside click (mobile safety)
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      /* 🖥️ hover open */
      onMouseEnter={() => setOpen(true)}
    //   onMouseLeave={() => setOpen(false)}
    >
      {/* Avatar */}
      <button
        /* 📱 click fallback */
        onClick={() => setOpen((prev) => !prev)}
        className="
          w-9 h-9 rounded-full overflow-hidden
          border border-gray-400
          hover:border-blue-800
          transition
        "
      >
        <img
          src="https://i.pravatar.cc/100"
          alt="profile"
          className="w-full h-full object-cover"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute right-0 mt-3
            w-60
            bg-white
            rounded-xl
            shadow-[0_10px_40px_rgba(0,0,0,0.12)]
            border border-gray-100
            z-50
          "
        >
          {/* User info */}
          <div className="px-5 py-4 border-b">
            <p className="text-xs text-gray-500">{roleLabel}</p>
            <p className="text-sm font-semibold text-gray-800">
              {displayName}
            </p>
          </div>

          {/* Menu */}
          <div className="py-2 text-sm">
            <button className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-gray-100">
              <User size={16} className="text-gray-500" />
              My Profile
            </button>

            <button className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-gray-100">
              <Settings size={16} className="text-gray-500" />
              Settings
            </button>

            <div className="my-1 h-px bg-gray-100" />

            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-red-500 hover:bg-red-50"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
