const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const { getDashboard } = require("../controllers/dashboardController");

const router = express.Router();

router.use(verifyToken);
router.get("/", getDashboard);

module.exports = router;
