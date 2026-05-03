const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const { requireAdmin } = require("../middlewares/requireAdmin");
const {
  getTasks,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler
} = require("../controllers/tasksController");

const router = express.Router();

router.use(verifyToken);

router.get("/", getTasks);
router.post("/", requireAdmin, createTaskHandler);
router.put("/:id", updateTaskHandler);
router.delete("/:id", requireAdmin, deleteTaskHandler);

module.exports = router;
