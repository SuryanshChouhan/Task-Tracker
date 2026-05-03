const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findByEmail, countSuperAdmins } = require("../models/userModel");
const { sendSuccess, sendError } = require("../utils/response");
const { isEmail } = require("../utils/validation");

const allowedRoles = ["admin", "member"];

async function signup(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name) {
      return sendError(res, 400, "name", "Name is required");
    }

    if (!email || !isEmail(email)) {
      return sendError(res, 400, "email", "Valid email is required");
    }

    if (!password || password.length < 6) {
      return sendError(res, 400, "password", "Password must be at least 6 characters");
    }

    if (!role || !allowedRoles.includes(role)) {
      return sendError(res, 400, "role", "Role must be admin or member");
    }

    const existingUser = await findByEmail(email);
    if (existingUser) {
      return sendError(res, 409, "email", "Email already in use");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let finalRole = role;

    if (role === "admin") {
      const superAdmins = await countSuperAdmins();
      if (superAdmins === 0) {
        finalRole = "super_admin";
      } else {
        return sendError(res, 403, "role", "Admins can only be created by Super Admin");
      }
    }

    const user = await createUser({ name, email, passwordHash, role: finalRole });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return sendSuccess(res, { token, user }, 201);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !isEmail(email)) {
      return sendError(res, 400, "email", "Valid email is required");
    }

    if (!password) {
      return sendError(res, 400, "password", "Password is required");
    }

    const user = await findByEmail(email);
    if (!user) {
      return sendError(res, 401, "auth", "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 401, "auth", "Invalid credentials");
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return sendSuccess(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { signup, login };
