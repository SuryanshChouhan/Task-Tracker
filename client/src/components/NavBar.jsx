import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function NavBar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="px-6 py-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-3xl border border-white/40 bg-white/70 px-6 py-4 shadow-glow">
        <div>
          <Link to="/dashboard" className="text-xl font-semibold text-ink">
            Team Task Manager
          </Link>
          <p className="text-xs text-slate">Stay ahead of every deliverable</p>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          {auth?.token ? (
            <>
              <Link to="/dashboard" className="text-slate hover:text-ink">
                Dashboard
              </Link>
              <Link to="/projects" className="text-slate hover:text-ink">
                Projects
              </Link>
              <Link to="/teams" className="text-slate hover:text-ink">
                Teams
              </Link>
              {auth?.user?.role === "super_admin" ? (
                <Link to="/members" className="text-slate hover:text-ink">
                  Members
                </Link>
              ) : null}
              <Link to="/tasks/new" className="text-slate hover:text-ink">
                New Task
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-ink px-4 py-2 text-ink transition hover:bg-ink hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate hover:text-ink">
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-ink px-4 py-2 text-white transition hover:bg-slate"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
