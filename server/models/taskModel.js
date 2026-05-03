const db = require("./db");

async function getTaskById(taskId) {
  const result = await db.query(
    "SELECT t.id, t.title, t.description, t.assigned_to, u.name AS assignee_name, t.team_id, tm.name AS team_name, t.project_id, p.name AS project_name, t.status, t.due_date, t.priority, t.created_by, t.created_at, (t.due_date < CURRENT_DATE AND t.status != 'completed') AS is_overdue FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id LEFT JOIN teams tm ON t.team_id = tm.id LEFT JOIN projects p ON t.project_id = p.id WHERE t.id = $1",
    [taskId]
  );

  return result.rows[0];
}

async function listTasksForAdmin(projectId) {
  if (projectId) {
    const result = await db.query(
      "SELECT t.id, t.title, t.description, t.assigned_to, u.name AS assignee_name, t.team_id, tm.name AS team_name, t.project_id, p.name AS project_name, t.status, t.due_date, t.priority, t.created_by, t.created_at, (t.due_date < CURRENT_DATE AND t.status != 'completed') AS is_overdue FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id LEFT JOIN teams tm ON t.team_id = tm.id LEFT JOIN projects p ON t.project_id = p.id WHERE t.project_id = $1 ORDER BY t.created_at DESC",
      [projectId]
    );

    return result.rows;
  }

  const result = await db.query(
    "SELECT t.id, t.title, t.description, t.assigned_to, u.name AS assignee_name, t.team_id, tm.name AS team_name, t.project_id, p.name AS project_name, t.status, t.due_date, t.priority, t.created_by, t.created_at, (t.due_date < CURRENT_DATE AND t.status != 'completed') AS is_overdue FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id LEFT JOIN teams tm ON t.team_id = tm.id LEFT JOIN projects p ON t.project_id = p.id ORDER BY t.created_at DESC",
    []
  );

  return result.rows;
}

async function listTasksForUser(userId, projectId) {
  if (projectId) {
    const result = await db.query(
      "SELECT DISTINCT t.id, t.title, t.description, t.assigned_to, u.name AS assignee_name, t.team_id, tm.name AS team_name, t.project_id, p.name AS project_name, t.status, t.due_date, t.priority, t.created_by, t.created_at, (t.due_date < CURRENT_DATE AND t.status != 'completed') AS is_overdue FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id LEFT JOIN teams tm ON t.team_id = tm.id LEFT JOIN projects p ON t.project_id = p.id LEFT JOIN project_members pm ON pm.project_id = t.project_id LEFT JOIN project_teams pt ON pt.project_id = t.project_id LEFT JOIN team_members project_tm ON project_tm.team_id = pt.team_id LEFT JOIN team_members task_tm ON task_tm.team_id = t.team_id WHERE t.project_id = $2 AND (t.assigned_to = $1 OR pm.user_id = $1 OR project_tm.user_id = $1 OR task_tm.user_id = $1) ORDER BY t.created_at DESC",
      [userId, projectId]
    );

    return result.rows;
  }

  const result = await db.query(
    "SELECT DISTINCT t.id, t.title, t.description, t.assigned_to, u.name AS assignee_name, t.team_id, tm.name AS team_name, t.project_id, p.name AS project_name, t.status, t.due_date, t.priority, t.created_by, t.created_at, (t.due_date < CURRENT_DATE AND t.status != 'completed') AS is_overdue FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id LEFT JOIN teams tm ON t.team_id = tm.id LEFT JOIN projects p ON t.project_id = p.id LEFT JOIN project_members pm ON pm.project_id = t.project_id LEFT JOIN project_teams pt ON pt.project_id = t.project_id LEFT JOIN team_members project_tm ON project_tm.team_id = pt.team_id LEFT JOIN team_members task_tm ON task_tm.team_id = t.team_id WHERE t.assigned_to = $1 OR pm.user_id = $1 OR project_tm.user_id = $1 OR task_tm.user_id = $1 ORDER BY t.created_at DESC",
    [userId]
  );

  return result.rows;
}

async function canUserAccessTask(userId, taskId) {
  const result = await db.query(
    "SELECT 1 FROM tasks t LEFT JOIN project_members pm ON pm.project_id = t.project_id LEFT JOIN project_teams pt ON pt.project_id = t.project_id LEFT JOIN team_members project_tm ON project_tm.team_id = pt.team_id LEFT JOIN team_members task_tm ON task_tm.team_id = t.team_id WHERE t.id = $2 AND (t.assigned_to = $1 OR pm.user_id = $1 OR project_tm.user_id = $1 OR task_tm.user_id = $1) LIMIT 1",
    [userId, taskId]
  );

  return Boolean(result.rows.length);
}

async function createTask({ title, description, assignedTo, teamId, projectId, status, dueDate, priority, createdBy }) {
  const result = await db.query(
    "INSERT INTO tasks (title, description, assigned_to, team_id, project_id, status, due_date, priority, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, title, description, assigned_to, team_id, project_id, status, due_date, priority, created_by, created_at",
    [title, description, assignedTo, teamId, projectId, status, dueDate, priority, createdBy]
  );

  return result.rows[0];
}

async function updateTask({ taskId, fields }) {
  const keys = Object.keys(fields);
  if (!keys.length) {
    return getTaskById(taskId);
  }

  const setParts = keys.map((key, index) => `${key} = $${index + 1}`);
  const values = keys.map((key) => fields[key]);
  values.push(taskId);

  await db.query(
    `UPDATE tasks SET ${setParts.join(", ")} WHERE id = $${keys.length + 1}`,
    values
  );

  return getTaskById(taskId);
}

async function deleteTask(taskId) {
  await db.query("DELETE FROM tasks WHERE id = $1", [taskId]);
}

module.exports = {
  getTaskById,
  listTasksForAdmin,
  listTasksForUser,
  canUserAccessTask,
  createTask,
  updateTask,
  deleteTask
};
