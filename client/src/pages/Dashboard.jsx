import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchDashboard } from "../api/dashboard.js";
import { updateTask } from "../api/tasks.js";
import TeamStatsCard from "../components/TeamStatsCard.jsx";

export default function Dashboard() {
  const { auth } = useAuth();
  const [data, setData] = useState(null);
  const [tasksState, setTasksState] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const payload = await fetchDashboard();
        if (isMounted) {
          setData(payload);
          setTasksState(payload.tasks || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load dashboard");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <p className="text-slate">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-ember">{error}</p>;
  }

  const role = data?.role || auth?.user?.role;
  const tasks = tasksState.length ? tasksState : data?.tasks || [];
  const handleStatusChange = async (taskId, status) => {
    try {
      const updated = await updateTask(taskId, { status });
      setTasksState((prev) => prev.map((task) => (task.id === taskId ? updated : task)));
    } catch (err) {
      setError(err.message || "Unable to update task status");
    }
  };
  const statusSummary = data?.statusSummary || {};
  const totals = data?.totals || {};
  const teamPerformance = data?.teamPerformance || [];
  const memberProgress = data?.memberProgress || [];
  const projectProgress = data?.projectProgress || [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold">Hi {auth?.user?.name || "there"}</h1>
        <p className="text-slate">Keep an eye on your personal workload.</p>
      </header>

      {role === "member" ? (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="card-glass rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wide text-slate">Assigned tasks</p>
            <p className="mt-3 text-3xl font-semibold text-ink">{tasks.length}</p>
          </div>
          <div className="card-glass rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wide text-slate">Overdue</p>
            <p className="mt-3 text-3xl font-semibold text-ember">{data?.overdueCount || 0}</p>
          </div>
          <div className="card-glass rounded-2xl p-5 shadow-lg">
            <p className="text-xs uppercase tracking-wide text-slate">Completed</p>
            <p className="mt-3 text-3xl font-semibold text-ink">{statusSummary.completed || 0}</p>
          </div>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-4">
          <TeamStatsCard title="Total tasks" value={totals.total || 0} />
          <TeamStatsCard title="Completed" value={totals.completed || 0} />
          <TeamStatsCard title="Pending" value={totals.pending || 0} />
          <TeamStatsCard title="Overdue" value={totals.overdue || 0} />
        </section>
      )}

      <section className="card-glass rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{role === "member" ? "My tasks" : "All tasks"}</h2>
          {role === "member" ? (
            <div className="text-xs text-slate">
              Pending: {statusSummary.pending || 0} | In progress: {statusSummary.in_progress || 0}
            </div>
          ) : null}
        </div>
        <div className="mt-5 space-y-3">
          {tasks.length ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-2 rounded-2xl border border-white/60 bg-white/80 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-lg font-semibold text-ink">{task.title}</p>
                  <p className="text-sm text-slate">{task.description}</p>
                </div>
                <div className="text-sm text-slate">
                  <span className="mr-3">Status: {task.status}</span>
                  {task.is_overdue ? <span className="mr-3 text-ember">Overdue</span> : null}
                  <span>Due: {task.due_date}</span>
                </div>
                {role === "member" ? (
                  <select
                    value={task.status}
                    onChange={(event) => handleStatusChange(task.id, event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate/20 bg-white px-3 py-2 text-sm md:mt-0 md:w-40"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-slate">No tasks available yet.</p>
          )}
        </div>
      </section>

      {role !== "member" ? (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="card-glass rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold">Team completion</h2>
            <div className="mt-4 space-y-3">
              {teamPerformance.length ? (
                teamPerformance.map((team) => {
                  const total = Number(team.total) || 0;
                  const completed = Number(team.completed) || 0;
                  const percent = total ? Math.round((completed / total) * 100) : 0;
                  return (
                    <div key={team.team_id || team.team_name} className="rounded-2xl border border-white/60 bg-white/80 p-4">
                      <p className="text-lg font-semibold text-ink">{team.team_name || "Unassigned"}</p>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate/20">
                        <div className="h-2 rounded-full bg-ink" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-slate">{percent}% completed</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate">No team data yet.</p>
              )}
            </div>
          </div>
          <div className="card-glass rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold">Member completion</h2>
            <div className="mt-4 space-y-3">
              {memberProgress.length ? (
                memberProgress.map((member) => {
                  const total = Number(member.total) || 0;
                  const completed = Number(member.completed) || 0;
                  const percent = total ? Math.round((completed / total) * 100) : 0;
                  return (
                    <div key={member.id} className="rounded-2xl border border-white/60 bg-white/80 p-4">
                      <p className="text-lg font-semibold text-ink">{member.name}</p>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate/20">
                        <div className="h-2 rounded-full bg-ink" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-slate">{percent}% completed</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate">No member data yet.</p>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {role !== "member" ? (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="card-glass rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold">Overdue by team</h2>
            <div className="mt-4 space-y-3">
              {teamPerformance.length ? (
                teamPerformance.map((team) => (
                  <div key={`overdue-${team.team_id || team.team_name}`} className="rounded-2xl border border-white/60 bg-white/80 p-4">
                    <p className="text-lg font-semibold text-ink">{team.team_name || "Unassigned"}</p>
                    <p className="text-sm text-slate">Overdue: {team.overdue}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate">No overdue data yet.</p>
              )}
            </div>
          </div>
          <div className="card-glass rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold">Tasks by status</h2>
            <div className="mt-4 space-y-3">
              {[
                { label: "Pending", value: totals.pending || 0 },
                { label: "In Progress", value: totals.in_progress || 0 },
                { label: "Completed", value: totals.completed || 0 }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/60 bg-white/80 p-4">
                  <p className="text-sm text-slate">{item.label}</p>
                  <p className="text-lg font-semibold text-ink">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {role !== "member" ? (
        <section className="card-glass rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold">Project progress</h2>
          <div className="mt-4 space-y-3">
            {projectProgress.length ? (
              projectProgress.map((project) => {
                const total = Number(project.total) || 0;
                const completed = Number(project.completed) || 0;
                const percent = total ? Math.round((completed / total) * 100) : 0;
                return (
                  <div key={project.id} className="rounded-2xl border border-white/60 bg-white/80 p-4">
                    <p className="text-lg font-semibold text-ink">{project.name}</p>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate/20">
                      <div className="h-2 rounded-full bg-ink" style={{ width: `${percent}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-slate">{percent}% completed</p>
                  </div>
                );
              })
            ) : (
              <p className="text-slate">No project data yet.</p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
