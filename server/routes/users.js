const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const { requireSuperAdmin } = require("../middlewares/requireSuperAdmin");
const { requireAdmin } = require("../middlewares/requireAdmin");
const {
	getUsers,
	updateUserRoleHandler,
	updateUserTeamHandler
} = require("../controllers/usersController");

const router = express.Router();

router.use(verifyToken);

router.get("/", requireSuperAdmin, getUsers);
router.put("/:id/role", requireSuperAdmin, updateUserRoleHandler);
router.put("/:id/team", requireAdmin, updateUserTeamHandler);

module.exports = router;
