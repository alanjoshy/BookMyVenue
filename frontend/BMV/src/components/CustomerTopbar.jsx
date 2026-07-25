import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { logoutUserAsync } from "../modules/auth/authSlice";

const NAV_ITEMS = [
  { label: "Venues", to: "/venues" },
  { label: "My Bookings", to: "/order-history" },
];

function isNavActive(pathname, to) {
  if (to === "/venues") return pathname === "/venues" || pathname.startsWith("/venues/");
  if (to === "/order-history") {
    return (
      pathname === "/order-history" ||
      pathname === "/my-bookings" ||
      pathname.startsWith("/bookings/") ||
      pathname.startsWith("/checkout/")
    );
  }
  return pathname === to;
}

function CustomerTopbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef(null);

  const firstName = user?.name?.split(" ")[0] || "Guest";
  const isVenueOwner = Boolean(user?.is_venue_owner);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await dispatch(logoutUserAsync());
    navigate("/login");
  };

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-100">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-rose-900 flex items-center justify-center">
              <span className="text-white text-[11px] font-bold tracking-tight">BMV</span>
            </div>
            <span className="text-base font-bold text-slate-900 hidden sm:inline">
              BookMyVenue
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={() =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isNavActive(location.pathname, to)
                      ? "text-rose-900 bg-rose-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-50"
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full pl-1 pr-1 sm:pr-2 py-1 hover:bg-slate-50 transition-colors"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-900 flex items-center justify-center text-sm font-semibold">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:inline max-w-[120px] truncate">
                {firstName}
              </span>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 text-sm z-20"
              >
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user?.name || "Customer"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user?.email || "Account"}</p>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => goTo("/profile")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50"
                >
                  <User size={16} className="text-slate-400" />
                  Profile
                </button>

                {isVenueOwner && (
                  <>
                    <div className="my-1.5 border-t border-slate-100" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => goTo("/owner/dashboard")}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-rose-800 hover:bg-rose-50"
                    >
                      <Building2 size={16} className="text-rose-700" />
                      Owner dashboard
                    </button>
                  </>
                )}

                <div className="my-1.5 border-t border-slate-100" />
                <a
                  href="mailto:support@bookmyvenue.com"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50"
                >
                  <HelpCircle size={16} className="text-slate-400" />
                  Support &amp; Help
                </a>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-rose-700 hover:bg-rose-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileNavOpen && (
        <nav className="md:hidden border-t border-slate-100 bg-white px-3 py-2 space-y-1">
          {NAV_ITEMS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={() =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isNavActive(location.pathname, to)
                    ? "text-rose-900 bg-rose-50"
                    : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

export default CustomerTopbar;
