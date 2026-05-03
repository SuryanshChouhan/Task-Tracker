const db = require("./db");

async function listAllProjects() {
  const result = await db.query(
    "SELECT p.id, p.name, p.description, p.created_by, p.created_at, u.name AS creator_name FROM projects p JOIN users u ON p.created_by = u.id ORDER BY p.created_at DESC",
    []
  );

  return result.rows;
}

async function listProjectsForUser(userId) {
  const result = await db.query(
    "SELECT DISTINCT p.id, p.name, p.description, p.created_by, p.created_at, u.name AS creator_name FROM projects p JOIN users u ON p.created_by = u.id LEFT JOIN project_members pm ON pm.project_id = p.id LEFT JOIN project_teams pt ON pt.project_id = p.id LEFT JOIN team_members tm ON tm.team_id = pt.team_id WHERE p.created_by = $1 OR pm.user_id = $1 OR tm.user_id = $1 ORDER BY p.created_at DESC",
    [userId]
  );

  return result.rows;
}

async function getProjectById(projectId) {
  const result = await db.query(
    "SELECT id, name, description, created_by, created_at FROM projects WHERE id = $1",
    [projectId]
  );

  return result.rows[0];
}

async function createProject({ name, description, createdBy }) {
  const result = await db.query(
    "INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING id, name, description, created_by, created_at",
    [name, description, createdBy]
  );

  return result.rows[0];
}

async function updateProject({ projectId, name, description }) {
  const result = await db.query(
    "UPDATE projects SET name = $1, description = $2 WHERE id = $3 RETURNING id, name, description, created_by, created_at",
    [name, description, projectId]
  );

  return result.rows[0];
}

async function deleteProject(projectId) {
  await db.query("DELETE FROM projects WHERE id = $1", [projectId]);
}

async function setProjectMembers(projectId, memberIds) {
  await db.query("DELETE FROM project_members WHERE project_id = $1", [projectId]);

  const uniqueIds = [...new Set(memberIds)];
  if (!uniqueIds.length) {
    return;
  }

  const values = uniqueIds.map((memberId, index) => `($1, $${index + 2})`).join(", ");
  await db.query(
    `INSERT INTO project_members (project_id, user_id) VALUES ${values}`,
    [projectId, ...uniqueIds]
  );
}

async function setProjectTeams(projectId, teamIds) {
  await db.query("DELETE FROM project_teams WHERE project_id = $1", [projectId]);

  const uniqueIds = [...new Set(teamIds)];
  if (!uniqueIds.length) {
    return;
  }

  const values = uniqueIds.map((teamId, index) => `($1, $${index + 2})`).join(", ");
  await db.query(
    `INSERT INTO project_teams (project_id, team_id) VALUES ${values}`,
    [projectId, ...uniqueIds]
  );
}

async function listProjectTeams(projectId) {
  const result = await db.query(
    "SELECT t.id, t.name FROM project_teams pt JOIN teams t ON pt.team_id = t.id WHERE pt.project_id = $1",
    [projectId]
  );

  return result.rows;
}

async function listProjectMembers(projectId) {
  const result = await db.query(
    "SELECT u.id, u.name, u.email, u.role FROM project_members pm JOIN users u ON pm.user_id = u.id WHERE pm.project_id = $1",
    [projectId]
  );

  return result.rows;
}

module.exports = {
  listAllProjects,
  listProjectsForUser,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  setProjectMembers,
  listProjectMembers,
  setProjectTeams,
  listProjectTeams
};
