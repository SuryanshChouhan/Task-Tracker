import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="card-glass rounded-3xl p-8 shadow-lg">
        <h1 className="text-3xl font-semibold">Join the crew</h1>
        <p className="mt-2 text-sm text-slate">Create your workspace in minutes.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate/20 bg-white px-4 py-3"
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate/20 bg-white px-4 py-3"
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate/20 bg-white px-4 py-3"
              required
            />
          </label>
          <div className="space-y-2">
            <p className="text-sm font-medium">Role</p>
            <div className="flex gap-3">
              {["member", "admin"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    form.role === role
                      ? "bg-ink text-white"
                      : "border border-slate/30 bg-white text-slate"
                  }`}
                >
                  {role === "admin" ? "Admin" : "Member"}
                </button>
              ))}
            </div>
          </div>
          {error ? <p className="text-sm text-ember">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-ink px-4 py-3 text-white transition hover:bg-slate"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-ink">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}