import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createTask } from "../api/tasks.js";
import { fetchProjects } from "../api/projects.js";
import { fetchTeams } from "../api/teams.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function TaskNew() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: searchParams.get("projectId") || "",
    assignedTo: "",
    teamId: "",
    status: "pending",
    dueDate: "",
    priority: "medium"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [projectsData, teamsData] = await Promise.all([fetchProjects(), fetchTeams()]);
        setProjects(projectsData);
        setTeams(teamsData);
      } catch (err) {
        setError(err.message || "Unable to load task form data");
      }
    };

    loadFormData();
  }, []);

  const selectedProject = useMemo(
    () => projects.find((project) => String(project.id) === String(form.projectId)),
    [projects, form.projectId]
  );

  const availableTeams = useMemo(() => {
    const projectTeams = selectedProject?.teams || [];
    return projectTeams.map((projectTeam) => {
      const fullTeam = teams.find((team) => Number(team.id) === Number(projectTeam.id));
      return fullTeam || projectTeam;
    });
  }, [selectedProject, teams]);

  const selectedTeam = useMemo(
    () => availableTeams.find((team) => String(team.id) === String(form.teamId)),
    [availableTeams, form.teamId]
  );

  const availableMembers = selectedTeam?.members || [];

  const minDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "projectId" ? { teamId: "", assignedTo: "" } : {}),
      ...(name === "teamId" ? { assignedTo: "" } : {})
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createTask({
        title: form.title,
        description: form.description,
        assignedTo: Number(form.assignedTo),
        teamId: form.teamId ? Number(form.teamId) : null,
        projectId: form.projectId ? Number(form.projectId) : null,
        status: form.status,
        dueDate: form.dueDate,
        priority: form.priority
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to create task");
    } finally {
      setLoading(false);
    }
  };

  if (!["admin", "super_admin"].includes(auth?.user?.role)) {
    return <p className="text-slate">Only admins can create tasks.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card-glass rounded-3xl p-8 shadow-lg">
        <h1 className="text-3xl font-semibold">Create a new task</h1>
        <p className="mt-2 text-sm text-slate">Assign work with clarity.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full rounded-xl border border-slate/20 bg-white px-4 py-3"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full rounded-xl border border-slate/20 bg-white px-4 py-3"
            rows={4}
            required
          />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium">
              Project
              <select
                name="projectId"
                value={form.projectId}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate/20 bg-white px-4 py-3"
                required
              >
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Team
              <select
                name="teamId"
                value={form.teamId}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate/20 bg-white px-4 py-3"
                disabled={!form.projectId || !availableTeams.length}
                required
              >
                <option value="">
                  {form.projectId && !availableTeams.length
                    ? "No teams assigned to this project"
                    : "Select team"}
                </option>
                {availableTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Assigned team member
              <select
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate/20 bg-white px-4 py-3"
                disabled={!form.teamId || !availableMembers.length}
                required
              >
                <option value="">
                  {form.teamId && !availableMembers.length
                    ? "No members in this team"
                    : "Select member"}
                </option>
                {availableMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm font-medium">
              Status
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate/20 bg-white px-4 py-3"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Priority
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate/20 bg-white px-4 py-3"
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Due date
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                min={minDate}
                className="mt-2 w-full rounded-xl border border-slate/20 bg-white px-4 py-3"
                required
              />
            </label>
          </div>
          {error ? <p className="text-sm text-ember">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-ink px-4 py-3 text-white transition hover:bg-slate"
            disabled={loading}
          >
            {loading ? "Creating task..." : "Create task"}
          </button>
        </form>
      </div>
    </div>
  );
}
