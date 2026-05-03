const { listUsers, updateUserRole, findById } = require("../models/userModel");
const { sendSuccess, sendError } = require("../utils/response");
const db = require("../models/db");

const allowedRoles = ["admin", "member"];

async function getUsers(req, res, next) {
  try {
    const users = await listUsers();
    return sendSuccess(res, users);
  } catch (error) {
    return next(error);
  }
}

async function updateUserRoleHandler(req, res, next) {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId)) {
      return sendError(res, 400, "id", "Invalid user id");
    }

    const { role } = req.body;
    if (!role || !allowedRoles.includes(role)) {
      return sendError(res, 400, "role", "Role must be admin or member");
    }

    const user = await findById(userId);
    if (!user) {
      return sendError(res, 404, "user", "User not found");
    }

    if (user.role === "super_admin") {
      return sendError(res, 403, "role", "Cannot change Super Admin role");
    }

    const updated = await updateUserRole(userId, role);
    return sendSuccess(res, updated);
  } catch (error) {
    return next(error);
  }
}

async function updateUserTeamHandler(req, res, next) {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId)) {
      return sendError(res, 400, "id", "Invalid user id");
    }

    const { teamId } = req.body;
    const user = await findById(userId);
    if (!user) {
      return sendError(res, 404, "user", "User not found");
    }

    if (user.role !== "member") {
      return sendError(res, 403, "role", "Only members can be assigned to teams");
    }

    await db.query("DELETE FROM team_members WHERE user_id = $1", [userId]);

    if (teamId !== null && teamId !== undefined && teamId !== "") {
      const parsed = Number(teamId);
      if (!Number.isInteger(parsed)) {
        return sendError(res, 400, "teamId", "Valid team id is required");
      }
      await db.query("INSERT INTO team_members (user_id, team_id) VALUES ($1, $2)", [userId, parsed]);
    }

    const users = await listUsers();
    const updated = users.find((item) => item.id === userId);
    return sendSuccess(res, updated);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getUsers, updateUserRoleHandler, updateUserTeamHandler };
