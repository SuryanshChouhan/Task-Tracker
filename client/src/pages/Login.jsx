import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="card-glass rounded-3xl p-8 shadow-lg">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-slate">Log in to manage your team workload.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl border border-slate/20 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-slate/10"
            onClick={() => {
              setEmail("suryansh@super.com");
              setPassword("admin12");
            }}
          >
            Use Super Admin
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate/20 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-slate/10"
            onClick={() => {
              setEmail("amanmember@member.com");
              setPassword("member12");
            }}
          >
            Use Member
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate/20 bg-white px-4 py-3"
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate/20 bg-white px-4 py-3"
              required
            />
          </label>
          {error ? <p className="text-sm text-ember">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-ink px-4 py-3 text-white transition hover:bg-slate"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate">
          Need an account?{" "}
          <Link to="/signup" className="font-semibold text-ink">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
