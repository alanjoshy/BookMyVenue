import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUserAsync } from "../modules/auth/authSlice";

function Navbar({ activePage = "" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isOwner = user?.is_venue_owner;
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    await dispatch(logoutUserAsync());
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3.5 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-rose-200">
            BMV
          </div>
          <span className="font-bold text-slate-800 text-lg hidden sm:inline">BookMyVenue</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
          <Link
            to="/"
            className={`hover:text-rose-600 transition-colors ${activePage === "home" ? "text-rose-600 font-medium" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/venues"
            className={`hover:text-rose-600 transition-colors ${activePage === "venues" ? "text-rose-600 font-medium" : ""}`}
          >
            Venues
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {isOwner ? (
                <Link
                  to="/owner/dashboard"
                  className="text-sm text-slate-600 hover:text-rose-600 hidden sm:inline px-3 py-1.5 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="text-sm text-slate-600 hover:text-rose-600 hidden sm:inline px-3 py-1.5 transition-colors"
                >
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm text-slate-600 hover:text-rose-600 hidden sm:inline px-3 py-1.5 transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-rose-600 hover:bg-rose-700 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors shadow-sm shadow-rose-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-slate-600 hover:text-rose-600 px-3 py-1.5 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-rose-600 hover:bg-rose-700 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors shadow-sm shadow-rose-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;