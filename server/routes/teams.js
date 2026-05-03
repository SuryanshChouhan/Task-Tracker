const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const { requireAdmin } = require("../middlewares/requireAdmin");
const {
  getTeams,
  createTeamHandler,
  updateTeamHandler,
  deleteTeamHandler
} = require("../controllers/teamsController");

const router = express.Router();

router.use(verifyToken);

router.get("/", getTeams);
router.post("/", requireAdmin, createTeamHandler);
router.put("/:id", requireAdmin, updateTeamHandler);
router.delete("/:id", requireAdmin, deleteTeamHandler);

module.exports = router;
