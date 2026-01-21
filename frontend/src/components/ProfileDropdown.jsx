import { useState, useRef, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import api from "../utils/axios";

const ProfileDropdown = ({ role, userName }) => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profile, setProfile] = useState(null);
  const ref = useRef(null);

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

  const formatRole = (value) => {
    if (!value) return "User";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString();
  };

  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileError("");
    try {
      const res = await api.get("/api/auth/me");
      setProfile(res.data.user);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load profile";
      setProfileError(message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileOpen = () => {
    setOpen(false);
    setProfileOpen(true);
    if (!profile && !profileLoading) {
      fetchProfile();
    }
  };

  const storedRole =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const roleLabel = formatRole(profile?.role || role || storedRole);
  const displayName =
    userName || profile?.name || (roleLabel ? `${roleLabel} User` : "User");

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)}>
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
            absolute right-0 top-full mt-3
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
            <button
              type="button"
              onClick={handleProfileOpen}
              className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-gray-100"
            >
              <User size={16} className="text-gray-500" />
              My Profile
            </button>

            <div className="my-1 h-px bg-gray-100" />

            <button
              type="button"
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

      {profileOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setProfileOpen(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b px-6 py-2">
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  Profile Details
                </h3>
                <p className="text-xs text-gray-500">
                  Account information from your login
                </p>
              </div>
            </div>

            <div className="px-6 py-5">
              {profileLoading && (
                <p className="text-sm text-gray-500">
                  Loading profile details...
                </p>
              )}

              {profileError && (
                <p className="text-sm text-red-500">{profileError}</p>
              )}

              {!profileLoading && !profileError && profile && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-xs uppercase tracking-wide text-gray-600">
                      Name :
                    </span>
                    <span className="text-right font-medium text-gray-800">
                      {profile.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-xs uppercase tracking-wide text-gray-600">
                      Email :
                    </span>
                    <span className="max-w-[220px] break-all text-right text-gray-600">
                      {profile.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-xs uppercase tracking-wide text-gray-600">
                      Role :
                    </span>
                    <span className="text-right text-gray-700">
                      {formatRole(profile.role)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-xs uppercase tracking-wide text-gray-600">
                      Status :
                    </span>
                    <span className="text-right text-gray-700">
                      {profile.isActive ? "Active" : "Blocked"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-xs uppercase tracking-wide text-gray-600">
                      Joined :
                    </span>
                    <span className="text-right text-gray-700">
                      {formatDate(profile.createdAt)}
                    </span>
                  </div>
                </div>
              )}

              {!profileLoading && !profileError && !profile && (
                <p className="text-sm text-gray-500">
                  Profile data not available.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end border-t px-6 py-2">
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="rounded-lg border border-red-200 px-2 py-1 text-sm font-medium text-red-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
