const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { field: "auth", message: "Missing or invalid token" }
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { field: "auth", message: "Invalid token" }
    });
  }
}

module.exports = { verifyToken };
