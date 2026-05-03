import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchTeams, createTeam, deleteTeam } from "../api/teams.js";

export default function Teams() {
  const { auth } = useAuth();
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({ name: "", memberIds: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTeams = async () => {
    try {
      const data = await fetchTeams();
      setTeams(data);
    } catch (err) {
      setError(err.message || "Unable to load teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");

    const memberIds = form.memberIds
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isInteger(id) && id > 0);

    try {
      await createTeam({
        name: form.name,
        memberIds
      });
      setForm({ name: "", memberIds: "" });
      loadTeams();
    } catch (err) {
      setError(err.message || "Unable to create team");
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm("Delete this team?")) {
      return;
    }

    try {
      await deleteTeam(teamId);
      setTeams((prev) => prev.filter((team) => team.id !== teamId));
    } catch (err) {
      setError(err.message || "Unable to delete team");
    }
  };

  if (loading) {
    return <p className="text-slate">Loading teams...</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Teams</h1>
        <p className="text-slate">Group members into focused squads.</p>
      </header>

      {["admin", "super_admin"].includes(auth?.user?.role) ? (
        <form onSubmit={handleCreate} className="card-glass rounded-3xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold">Create new team</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Team name"
              className="rounded-xl border border-slate/20 bg-white px-4 py-3"
              required
            />
            <input
              name="memberIds"
              value={form.memberIds}
              onChange={handleChange}
              placeholder="Member IDs (comma separated)"
              className="rounded-xl border border-slate/20 bg-white px-4 py-3"
            />
          </div>
          {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}
          <button
            type="submit"
            className="mt-4 rounded-xl bg-ink px-5 py-2 text-white transition hover:bg-slate"
          >
            Create team
          </button>
        </form>
      ) : null}

      {error ? <p className="text-sm text-ember">{error}</p> : null}

      <section className="grid gap-4 md:grid-cols-2">
        {teams.map((team) => (
          <div key={team.id} className="card-glass rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{team.name}</h3>
              {["admin", "super_admin"].includes(auth?.user?.role) ? (
                <button
                  type="button"
                  onClick={() => handleDelete(team.id)}
                  className="text-xs uppercase text-ember"
                >
                  Delete
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
