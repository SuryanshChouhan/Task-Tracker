const db = require("./db");

async function createUser({ name, email, passwordHash, role }) {
  const result = await db.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at",
    [name, email, passwordHash, role]
  );

  return result.rows[0];
}

async function findByEmail(email) {
  const result = await db.query(
    "SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1",
    [email]
  );

  return result.rows[0];
}

async function findById(id) {
  const result = await db.query(
    "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
    [id]
  );

  return result.rows[0];
}

async function listUsers() {
  const result = await db.query(
    "SELECT u.id, u.name, u.email, u.role, u.created_at, t.id AS team_id, t.name AS team_name FROM users u LEFT JOIN team_members tm ON tm.user_id = u.id LEFT JOIN teams t ON t.id = tm.team_id ORDER BY u.created_at DESC",
    []
  );

  return result.rows;
}

async function updateUserRole(userId, role) {
  const result = await db.query(
    "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, created_at",
    [role, userId]
  );

  return result.rows[0];
}

async function countSuperAdmins() {
  const result = await db.query(
    "SELECT COUNT(*)::int AS count FROM users WHERE role = 'super_admin'",
    []
  );

  return result.rows[0].count;
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  listUsers,
  updateUserRole,
  countSuperAdmins
};
