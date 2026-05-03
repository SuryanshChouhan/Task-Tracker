const {
  getTaskById,
  listTasksForAdmin,
  listTasksForUser,
  canUserAccessTask,
  createTask,
  updateTask,
  deleteTask
} = require("../models/taskModel");
const db = require("../models/db");
const { sendSuccess, sendError } = require("../utils/response");
const { isValidDate, isValidEnum } = require("../utils/validation");

const statusOptions = ["pending", "in_progress", "completed"];
const priorityOptions = ["low", "medium", "high"];

async function getTasks(req, res, next) {
  try {
    const projectId = req.query.projectId ? Number(req.query.projectId) : null;

    if (req.query.projectId && !Number.isInteger(projectId)) {
      return sendError(res, 400, "projectId", "Invalid project id");
    }

    const tasks =
      ["admin", "super_admin"].includes(req.user.role)
        ? await listTasksForAdmin(projectId)
        : await listTasksForUser(req.user.id, projectId);

    return sendSuccess(res, tasks);
  } catch (error) {
    return next(error);
  }
}

async function createTaskHandler(req, res, next) {
  try {
    const { title, description, assignedTo, teamId, projectId, status, dueDate, priority } = req.body;

    if (!title) {
      return sendError(res, 400, "title", "Title is required");
    }

    if (!description) {
      return sendError(res, 400, "description", "Description is required");
    }

    if (!assignedTo || !Number.isInteger(Number(assignedTo))) {
      return sendError(res, 400, "assignedTo", "Valid assigned user id is required");
    }

    if (teamId !== undefined && teamId !== null && teamId !== "" && !Number.isInteger(Number(teamId))) {
      return sendError(res, 400, "teamId", "Valid team id is required");
    }

    if (projectId !== undefined && projectId !== null && projectId !== "" && !Number.isInteger(Number(projectId))) {
      return sendError(res, 400, "projectId", "Valid project id is required");
    }

    if (!isValidEnum(status, statusOptions)) {
      return sendError(res, 400, "status", "Invalid status value");
    }

    if (!isValidEnum(priority, priorityOptions)) {
      return sendError(res, 400, "priority", "Invalid priority value");
    }

    if (!isValidDate(dueDate)) {
      return sendError(res, 400, "dueDate", "Due date must be valid");
    }

    if (teamId && assignedTo) {
      const memberResult = await db.query(
        "SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2 LIMIT 1",
        [Number(teamId), Number(assignedTo)]
      );

      if (!memberResult.rows.length) {
        return sendError(res, 400, "assignedTo", "Assignee must be a member of the selected team");
      }
    }

    if (projectId && teamId) {
      const projectTeamResult = await db.query(
        "SELECT 1 FROM project_teams WHERE project_id = $1 AND team_id = $2 LIMIT 1",
        [Number(projectId), Number(teamId)]
      );

      if (!projectTeamResult.rows.length) {
        return sendError(res, 400, "teamId", "Selected team is not assigned to this project");
      }
    }

    const task = await createTask({
      title,
      description,
      assignedTo: Number(assignedTo),
      teamId: teamId ? Number(teamId) : null,
      projectId: projectId ? Number(projectId) : null,
      status,
      dueDate,
      priority,
      createdBy: req.user.id
    });

    return sendSuccess(res, task, 201);
  } catch (error) {
    return next(error);
  }
}

async function updateTaskHandler(req, res, next) {
  try {
    const taskId = Number(req.params.id);
    if (!Number.isInteger(taskId)) {
      return sendError(res, 400, "id", "Invalid task id");
    }

    const existing = await getTaskById(taskId);
    if (!existing) {
      return sendError(res, 404, "task", "Task not found");
    }

    if (!["admin", "super_admin"].includes(req.user.role)) {
      const hasAccess = await canUserAccessTask(req.user.id, taskId);
      if (!hasAccess) {
        return sendError(res, 403, "role", "Not authorized to update this task");
      }

      const allowed = Object.keys(req.body).every((key) => key === "status");
      if (!allowed) {
        return sendError(res, 403, "role", "Members can only update status");
      }
    }

    const fields = {};

    if (req.body.title !== undefined) {
      fields.title = req.body.title;
    }

    if (req.body.description !== undefined) {
      fields.description = req.body.description;
    }

    if (req.body.assignedTo !== undefined) {
      const parsed = Number(req.body.assignedTo);
      if (!Number.isInteger(parsed)) {
        return sendError(res, 400, "assignedTo", "Valid assigned user id is required");
      }
      fields.assigned_to = parsed;
    }

    if (req.body.teamId !== undefined) {
      if (req.body.teamId === null || req.body.teamId === "") {
        fields.team_id = null;
      } else {
        const parsed = Number(req.body.teamId);
        if (!Number.isInteger(parsed)) {
          return sendError(res, 400, "teamId", "Valid team id is required");
        }
        fields.team_id = parsed;
      }
    }

    if (req.body.projectId !== undefined) {
      if (req.body.projectId === null || req.body.projectId === "") {
        fields.project_id = null;
      } else {
        const parsed = Number(req.body.projectId);
        if (!Number.isInteger(parsed)) {
          return sendError(res, 400, "projectId", "Valid project id is required");
        }
        fields.project_id = parsed;
      }
    }

    if (req.body.status !== undefined) {
      if (!isValidEnum(req.body.status, statusOptions)) {
        return sendError(res, 400, "status", "Invalid status value");
      }
      fields.status = req.body.status;
    }

    if (req.body.priority !== undefined) {
      if (!isValidEnum(req.body.priority, priorityOptions)) {
        return sendError(res, 400, "priority", "Invalid priority value");
      }
      fields.priority = req.body.priority;
    }

    if (req.body.dueDate !== undefined) {
      if (!isValidDate(req.body.dueDate)) {
        return sendError(res, 400, "dueDate", "Due date must be valid");
      }
      fields.due_date = req.body.dueDate;
    }

    const updated = await updateTask({ taskId, fields });
    return sendSuccess(res, updated);
  } catch (error) {
    return next(error);
  }
}

async function deleteTaskHandler(req, res, next) {
  try {
    const taskId = Number(req.params.id);
    if (!Number.isInteger(taskId)) {
      return sendError(res, 400, "id", "Invalid task id");
    }

    const existing = await getTaskById(taskId);
    if (!existing) {
      return sendError(res, 404, "task", "Task not found");
    }

    await deleteTask(taskId);
    return sendSuccess(res, { id: taskId });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTasks,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler
};
