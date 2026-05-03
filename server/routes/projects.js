const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const { requireAdmin } = require("../middlewares/requireAdmin");
const {
  getProjects,
  createProjectHandler,
  updateProjectHandler,
  deleteProjectHandler
} = require("../controllers/projectsController");

const router = express.Router();

router.use(verifyToken);

router.get("/", getProjects);
router.post("/", requireAdmin, createProjectHandler);
router.put("/:id", requireAdmin, updateProjectHandler);
router.delete("/:id", requireAdmin, deleteProjectHandler);

module.exports = router;
