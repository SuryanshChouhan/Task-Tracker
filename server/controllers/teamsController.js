const {
  listAllTeams,
  listTeamsForUser,
  createTeam,
  updateTeam,
  deleteTeam,
  setTeamMembers,
  listTeamMembers
} = require("../models/teamModel");
const { sendSuccess, sendError } = require("../utils/response");
const { normalizeArray } = require("../utils/validation");

function parseMemberIds(value) {
  const list = normalizeArray(value);
  return list
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
}

async function getTeams(req, res, next) {
  try {
    const teams =
      ["admin", "super_admin"].includes(req.user.role)
        ? await listAllTeams()
        : await listTeamsForUser(req.user.id);

    const teamsWithMembers = await Promise.all(
      teams.map(async (team) => ({
        ...team,
        members: await listTeamMembers(team.id)
      }))
    );

    return sendSuccess(res, teamsWithMembers);
  } catch (error) {
    return next(error);
  }
}

async function createTeamHandler(req, res, next) {
  try {
    const { name, memberIds } = req.body;

    if (!name) {
      return sendError(res, 400, "name", "Team name is required");
    }

    const team = await createTeam({
      name,
      createdBy: req.user.id
    });

    const members = parseMemberIds(memberIds);
    if (members.length) {
      await setTeamMembers(team.id, members);
    }

    const teamMembers = await listTeamMembers(team.id);

    return sendSuccess(res, { ...team, members: teamMembers }, 201);
  } catch (error) {
    return next(error);
  }
}

async function updateTeamHandler(req, res, next) {
  try {
    const teamId = Number(req.params.id);
    if (!Number.isInteger(teamId)) {
      return sendError(res, 400, "id", "Invalid team id");
    }

    const name = req.body.name;

    if (!name) {
      return sendError(res, 400, "name", "Team name is required");
    }

    const updated = await updateTeam({ teamId, name });

    if (req.body.memberIds !== undefined) {
      const members = parseMemberIds(req.body.memberIds);
      await setTeamMembers(teamId, members);
    }

    const teamMembers = await listTeamMembers(teamId);

    return sendSuccess(res, { ...updated, members: teamMembers });
  } catch (error) {
    return next(error);
  }
}

async function deleteTeamHandler(req, res, next) {
  try {
    const teamId = Number(req.params.id);
    if (!Number.isInteger(teamId)) {
      return sendError(res, 400, "id", "Invalid team id");
    }

    await deleteTeam(teamId);
    return sendSuccess(res, { id: teamId });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTeams,
  createTeamHandler,
  updateTeamHandler,
  deleteTeamHandler
};
