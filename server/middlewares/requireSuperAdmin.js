function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      data: null,
      error: { field: "role", message: "Super Admin access required" }
    });
  }

  return next();
}

module.exports = { requireSuperAdmin };
