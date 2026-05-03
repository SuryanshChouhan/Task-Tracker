import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchTasks, updateTask } from "../api/tasks.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProjectDetail() {
  const { id } = useParams();
  const { auth } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const data = await fetchTasks(id);
      setTasks(data);
    } catch (err) {
      setError(err.message || "Unable to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [id]);

  const filteredTasks = useMemo(() => {
    if (filter === "all") {
      return tasks;
    }
    return tasks.filter((task) => task.status === filter);
  }, [tasks, filter]);

  const handleStatusChange = async (taskId, status) => {
    try {
      const updated = await updateTask(taskId, { status });
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updated : task)));
    } catch (err) {
      setError(err.message || "Unable to update task");
    }
  };

  if (loading) {
    return <p className="text-slate">Loading project tasks...</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Project tasks</h1>
          <p className="text-slate">Project ID: {id}</p>
        </div>
        {["admin", "super_admin"].includes(auth?.user?.role) ? (
          <Link
            to={`/tasks/new?projectId=${id}`}
            className="rounded-full bg-ink px-5 py-2 text-sm text-white"
          >
            Add task
          </Link>
        ) : null}
      </header>

      {error ? <p className="text-sm text-ember">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {["all", "pending", "in_progress", "completed"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full px-4 py-2 text-sm ${
              filter === status ? "bg-ink text-white" : "bg-white text-slate"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {filteredTasks.map((task) => (
          <div key={task.id} className="card-glass rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{task.title}</h2>
              <span className="text-xs uppercase text-slate">{task.priority}</span>
            </div>
            <p className="mt-2 text-sm text-slate">{task.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate">
              <span>Due {task.due_date}</span>
              <span>Assignee {task.assignee_name || `#${task.assigned_to}`}</span>
              {task.team_name ? <span>Team {task.team_name}</span> : null}
            </div>
            <div className="mt-4">
              <label className="text-xs font-semibold uppercase text-slate">Status</label>
              <select
                value={task.status}
                onChange={(event) => handleStatusChange(task.id, event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate/20 bg-white px-3 py-2 text-sm"
                disabled={!["admin", "super_admin", "member"].includes(auth?.user?.role)}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        ))}
        {!filteredTasks.length ? <p className="text-slate">No tasks yet.</p> : null}
      </section>
    </div>
  );
}
