import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchProjects, createProject, deleteProject } from "../api/projects.js";
import { fetchTeams } from "../api/teams.js";

export default function Projects() {
  const { auth } = useAuth();
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", memberIds: "", teamIds: [] });
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message || "Unable to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    if (["admin", "super_admin"].includes(auth?.user?.role)) {
      fetchTeams()
        .then(setTeams)
        .catch((err) => setError(err.message || "Unable to load teams"));
    }
  }, []);

  const handleChange = (event) => {
    const { name, selectedOptions, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "teamIds"
          ? Array.from(selectedOptions, (option) => Number(option.value))
          : value
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");

    const memberIds = form.memberIds
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isInteger(id) && id > 0);

    try {
      await createProject({
        name: form.name,
        description: form.description,
        memberIds,
        teamIds: form.teamIds
      });
      setForm({ name: "", description: "", memberIds: "", teamIds: [] });
      loadProjects();
    } catch (err) {
      setError(err.message || "Unable to create project");
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Delete this project?")) {
      return;
    }

    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (err) {
      setError(err.message || "Unable to delete project");
    }
  };

  const filteredProjects = projects.filter((project) => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return true;
    }

    const teamNames = (project.teams || []).map((team) => team.name).join(" ");
    return `${project.name} ${project.description} ${teamNames}`.toLowerCase().includes(term);
  });

  if (loading) {
    return <p className="text-slate">Loading projects...</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Projects</h1>
        <p className="text-slate">Track every initiative in one place.</p>
      </header>

      {["admin", "super_admin"].includes(auth?.user?.role) ? (
        <form onSubmit={handleCreate} className="card-glass rounded-3xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold">Create new project</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Project name"
              className="rounded-xl border border-slate/20 bg-white px-4 py-3"
              required
            />
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short description"
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
            <select
              name="teamIds"
              value={form.teamIds}
              onChange={handleChange}
              multiple
              className="min-h-28 rounded-xl border border-slate/20 bg-white px-4 py-3"
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}
          <button
            type="submit"
            className="mt-4 rounded-xl bg-ink px-5 py-2 text-white transition hover:bg-slate"
          >
            Create project
          </button>
        </form>
      ) : null}

      {error ? <p className="text-sm text-ember">{error}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search projects by name, description, or team"
          className="w-full max-w-sm rounded-xl border border-slate/20 bg-white px-4 py-3"
        />
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {filteredProjects.map((project) => (
          <div key={project.id} className="card-glass rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{project.name}</h3>
              {["admin", "super_admin"].includes(auth?.user?.role) ? (
                <button
                  type="button"
                  onClick={() => handleDelete(project.id)}
                  className="text-xs uppercase text-ember"
                >
                  Delete
                </button>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-slate">{project.description}</p>
            {project.teams?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.teams.map((team) => (
                  <span
                    key={team.id}
                    className="rounded-full border border-slate/20 bg-white px-3 py-1 text-xs font-semibold text-slate"
                  >
                    {team.name}
                  </span>
                ))}
              </div>
            ) : null}
            <Link
              to={`/projects/${project.id}`}
              className="mt-4 inline-flex text-sm font-semibold text-ink"
            >
              View tasks -&gt;
            </Link>
          </div>
        ))}
        {!filteredProjects.length ? <p className="text-slate">No projects found.</p> : null}
      </section>
    </div>
  );
}
