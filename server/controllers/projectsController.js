const {
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
} = require("../models/projectModel");
const { sendSuccess, sendError } = require("../utils/response");
const { normalizeArray } = require("../utils/validation");

function parseMemberIds(value) {
  const list = normalizeArray(value);
  return list
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
}

async function getProjects(req, res, next) {
  try {
    const projects =
      req.user.role === "admin"
        ? await listAllProjects()
        : await listProjectsForUser(req.user.id);

    const projectsWithTeams = await Promise.all(
      projects.map(async (project) => ({
        ...project,
        teams: await listProjectTeams(project.id)
      }))
    );

    return sendSuccess(res, projectsWithTeams);
  } catch (error) {
    return next(error);
  }
}

async function createProjectHandler(req, res, next) {
  try {
    const { name, description, memberIds, teamIds } = req.body;

    if (!name) {
      return sendError(res, 400, "name", "Project name is required");
    }

    if (!description) {
      return sendError(res, 400, "description", "Description is required");
    }

    const project = await createProject({
      name,
      description,
      createdBy: req.user.id
    });

    const members = parseMemberIds(memberIds);
    if (members.length) {
      await setProjectMembers(project.id, members);
    }

    const teams = parseMemberIds(teamIds);
    if (teams.length) {
      await setProjectTeams(project.id, teams);
    }

    const projectMembers = await listProjectMembers(project.id);
    const projectTeams = await listProjectTeams(project.id);

    return sendSuccess(res, { ...project, members: projectMembers, teams: projectTeams }, 201);
  } catch (error) {
    return next(error);
  }
}

async function updateProjectHandler(req, res, next) {
  try {
    const projectId = Number(req.params.id);
    if (!Number.isInteger(projectId)) {
      return sendError(res, 400, "id", "Invalid project id");
    }

    const existing = await getProjectById(projectId);
    if (!existing) {
      return sendError(res, 404, "project", "Project not found");
    }

    const name = req.body.name || existing.name;
    const description = req.body.description || existing.description;

    if (!name) {
      return sendError(res, 400, "name", "Project name is required");
    }

    if (!description) {
      return sendError(res, 400, "description", "Description is required");
    }

    const updated = await updateProject({ projectId, name, description });

    if (req.body.memberIds !== undefined) {
      const members = parseMemberIds(req.body.memberIds);
      await setProjectMembers(projectId, members);
    }

    if (req.body.teamIds !== undefined) {
      const teams = parseMemberIds(req.body.teamIds);
      await setProjectTeams(projectId, teams);
    }

    const projectMembers = await listProjectMembers(projectId);
    const projectTeams = await listProjectTeams(projectId);

    return sendSuccess(res, { ...updated, members: projectMembers, teams: projectTeams });
  } catch (error) {
    return next(error);
  }
}

async function deleteProjectHandler(req, res, next) {
  try {
    const projectId = Number(req.params.id);
    if (!Number.isInteger(projectId)) {
      return sendError(res, 400, "id", "Invalid project id");
    }

    const existing = await getProjectById(projectId);
    if (!existing) {
      return sendError(res, 404, "project", "Project not found");
    }

    await deleteProject(projectId);
    return sendSuccess(res, { id: projectId });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProjects,
  createProjectHandler,
  updateProjectHandler,
  deleteProjectHandler
};
