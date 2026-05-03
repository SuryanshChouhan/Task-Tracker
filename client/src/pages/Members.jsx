import { useEffect, useMemo, useState } from "react";
import { fetchUsers, updateUserRole, updateUserTeam } from "../api/users.js";
import { fetchTeams } from "../api/teams.js";

export default function Members() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, teamsData] = await Promise.all([fetchUsers(), fetchTeams()]);
        setUsers(usersData);
        setTeams(teamsData);
      } catch (err) {
        setError(err.message || "Unable to load members");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return users;
    }

    return users.filter((user) =>
      `${user.name} ${user.email}`.toLowerCase().includes(term)
    );
  }, [users, query]);

  const handleRoleChange = async (userId, role) => {
    try {
      const updated = await updateUserRole(userId, role);
      setUsers((prev) => prev.map((user) => (user.id === updated.id ? updated : user)));
    } catch (err) {
      setError(err.message || "Unable to update role");
    }
  };

  const handleTeamChange = async (userId, teamId) => {
    try {
      const updated = await updateUserTeam(userId, teamId);
      setUsers((prev) => prev.map((user) => (user.id === updated.id ? updated : user)));
    } catch (err) {
      setError(err.message || "Unable to update team");
    }
  };

  if (loading) {
    return <p className="text-slate">Loading members...</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Members</h1>
        <p className="text-slate">Search members and assign roles or teams.</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email"
          className="w-full max-w-sm rounded-xl border border-slate/20 bg-white px-4 py-3"
        />
      </div>

      {error ? <p className="text-sm text-ember">{error}</p> : null}

      <section className="card-glass rounded-3xl p-6 shadow-lg">
        <div className="grid grid-cols-6 gap-3 text-xs font-semibold uppercase text-slate">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Team</span>
          <span>Status</span>
          <span>Created</span>
        </div>
        <div className="mt-4 space-y-3">
          {filtered.length ? (
            filtered.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-6 items-center gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 text-sm"
              >
                <span className="font-semibold text-ink">{user.name}</span>
                <span className="text-slate">{user.email}</span>
                <select
                  value={user.role}
                  onChange={(event) => handleRoleChange(user.id, event.target.value)}
                  className="rounded-xl border border-slate/20 bg-white px-2 py-2 text-sm"
                  disabled={user.role === "super_admin"}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={user.team_id || ""}
                  onChange={(event) => handleTeamChange(user.id, event.target.value)}
                  className="rounded-xl border border-slate/20 bg-white px-2 py-2 text-sm"
                  disabled={user.role !== "member"}
                >
                  <option value="">No team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <span className="text-slate">Active</span>
                <span className="text-slate">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-slate">No members found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
