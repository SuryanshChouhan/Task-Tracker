const db = require("./db");

async function listAllTeams() {
  const result = await db.query(
    "SELECT t.id, t.name, t.created_by, t.created_at, u.name AS creator_name FROM teams t JOIN users u ON t.created_by = u.id ORDER BY t.created_at DESC",
    []
  );

  return result.rows;
}

async function listTeamsForUser(userId) {
  const result = await db.query(
    "SELECT t.id, t.name, t.created_by, t.created_at, u.name AS creator_name FROM teams t JOIN users u ON t.created_by = u.id JOIN team_members tm ON tm.team_id = t.id WHERE tm.user_id = $1 ORDER BY t.created_at DESC",
    [userId]
  );

  return result.rows;
}

async function createTeam({ name, createdBy }) {
  const result = await db.query(
    "INSERT INTO teams (name, created_by) VALUES ($1, $2) RETURNING id, name, created_by, created_at",
    [name, createdBy]
  );

  return result.rows[0];
}

async function updateTeam({ teamId, name }) {
  const result = await db.query(
    "UPDATE teams SET name = $1 WHERE id = $2 RETURNING id, name, created_by, created_at",
    [name, teamId]
  );

  return result.rows[0];
}

async function deleteTeam(teamId) {
  await db.query("DELETE FROM teams WHERE id = $1", [teamId]);
}

async function setTeamMembers(teamId, memberIds) {
  await db.query("DELETE FROM team_members WHERE team_id = $1", [teamId]);

  const uniqueIds = [...new Set(memberIds)];
  if (!uniqueIds.length) {
    return;
  }

  const values = uniqueIds.map((memberId, index) => `($1, $${index + 2})`).join(", ");
  await db.query(
    `INSERT INTO team_members (team_id, user_id) VALUES ${values}`,
    [teamId, ...uniqueIds]
  );
}

async function listTeamMembers(teamId) {
  const result = await db.query(
    "SELECT u.id, u.name, u.email, u.role FROM team_members tm JOIN users u ON tm.user_id = u.id WHERE tm.team_id = $1",
    [teamId]
  );

  return result.rows;
}


module.exports = {
  listAllTeams,
  listTeamsForUser,
  createTeam,
  updateTeam,
  deleteTeam,
  setTeamMembers,
  listTeamMembers
};
