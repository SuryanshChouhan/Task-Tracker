const db = require("../models/db");
const { sendSuccess } = require("../utils/response");
const { listTeamsForUser } = require("../models/teamModel");
const { listUsers } = require("../models/userModel");

async function getDashboard(req, res, next) {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role === "member") {
      const visibleTaskWhere =
        "t.assigned_to = $1 OR pm.user_id = $1 OR project_tm.user_id = $1 OR task_tm.user_id = $1";

      const tasksResult = await db.query(
        `SELECT DISTINCT t.id, t.title, t.description, t.assigned_to, u.name AS assignee_name, t.team_id, tm.name AS team_name, t.project_id, p.name AS project_name, t.status, t.due_date, t.priority, t.created_at, (t.due_date < CURRENT_DATE AND t.status != 'completed') AS is_overdue FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id LEFT JOIN teams tm ON t.team_id = tm.id LEFT JOIN projects p ON t.project_id = p.id LEFT JOIN project_members pm ON pm.project_id = t.project_id LEFT JOIN project_teams pt ON pt.project_id = t.project_id LEFT JOIN team_members project_tm ON project_tm.team_id = pt.team_id LEFT JOIN team_members task_tm ON task_tm.team_id = t.team_id WHERE ${visibleTaskWhere} ORDER BY t.due_date ASC`,
        [userId]
      );

      const overdueResult = await db.query(
        `SELECT COUNT(DISTINCT t.id)::int AS count FROM tasks t LEFT JOIN project_members pm ON pm.project_id = t.project_id LEFT JOIN project_teams pt ON pt.project_id = t.project_id LEFT JOIN team_members project_tm ON project_tm.team_id = pt.team_id LEFT JOIN team_members task_tm ON task_tm.team_id = t.team_id WHERE (${visibleTaskWhere}) AND t.status != 'completed' AND t.due_date < CURRENT_DATE`,
        [userId]
      );

      const summaryResult = await db.query(
        `SELECT t.status, COUNT(DISTINCT t.id)::int AS count FROM tasks t LEFT JOIN project_members pm ON pm.project_id = t.project_id LEFT JOIN project_teams pt ON pt.project_id = t.project_id LEFT JOIN team_members project_tm ON project_tm.team_id = pt.team_id LEFT JOIN team_members task_tm ON task_tm.team_id = t.team_id WHERE ${visibleTaskWhere} GROUP BY t.status`,
        [userId]
      );

      const summary = summaryResult.rows.reduce((acc, row) => {
        acc[row.status] = row.count;
        return acc;
      }, {});

      return sendSuccess(res, {
        role,
        tasks: tasksResult.rows,
        overdueCount: overdueResult.rows[0].count,
        statusSummary: summary
      });
    }

    const totalsResult = await db.query(
      "SELECT COUNT(*)::int AS total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::int AS completed, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::int AS pending, SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)::int AS in_progress, SUM(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 ELSE 0 END)::int AS overdue FROM tasks",
      []
    );

    const teamPerformance = await db.query(
      "SELECT t.team_id, tm.name AS team_name, COUNT(*)::int AS total, SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END)::int AS completed, SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END)::int AS pending, SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END)::int AS in_progress, SUM(CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN 1 ELSE 0 END)::int AS overdue FROM tasks t LEFT JOIN teams tm ON t.team_id = tm.id GROUP BY t.team_id, tm.name ORDER BY tm.name",
      []
    );

    const memberProgress = await db.query(
      "SELECT u.id, u.name, u.email, COUNT(t.id)::int AS total, SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END)::int AS completed, SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END)::int AS pending, SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END)::int AS in_progress, SUM(CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN 1 ELSE 0 END)::int AS overdue FROM users u LEFT JOIN tasks t ON t.assigned_to = u.id WHERE u.role = 'member' GROUP BY u.id, u.name, u.email ORDER BY u.name",
      []
    );

    const projectProgress = await db.query(
      "SELECT p.id, p.name, COUNT(t.id)::int AS total, SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END)::int AS completed, SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END)::int AS pending, SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END)::int AS in_progress, SUM(CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN 1 ELSE 0 END)::int AS overdue FROM projects p LEFT JOIN tasks t ON t.project_id = p.id GROUP BY p.id, p.name ORDER BY p.name",
      []
    );

    const tasksResult = await db.query(
      "SELECT t.id, t.title, t.description, t.assigned_to, u.name AS assignee_name, t.team_id, tm.name AS team_name, t.status, t.due_date, t.priority, t.created_by, t.created_at, (t.due_date < CURRENT_DATE AND t.status != 'completed') AS is_overdue FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id LEFT JOIN teams tm ON t.team_id = tm.id ORDER BY t.created_at DESC",
      []
    );

    const teams = await listTeamsForUser(userId);
    const response = {
      role,
      totals: totalsResult.rows[0],
      teamPerformance: teamPerformance.rows,
      memberProgress: memberProgress.rows,
      projectProgress: projectProgress.rows,
      tasks: tasksResult.rows,
      teams
    };

    if (role === "super_admin") {
      response.users = await listUsers();
    }

    return sendSuccess(res, response);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getDashboard };
