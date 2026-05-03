const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcrypt");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const taskRoutes = require("./routes/tasks");
const dashboardRoutes = require("./routes/dashboard");
const teamRoutes = require("./routes/teams");
const userRoutes = require("./routes/users");
const { countSuperAdmins, createUser, findByEmail } = require("./models/userModel");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/users", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function ensureSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  const existing = await findByEmail(email);
  if (existing) {
    return;
  }

  const count = await countSuperAdmins();
  if (count > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await createUser({
    name: "Super Admin",
    email,
    passwordHash,
    role: "super_admin"
  });

  console.log("Super Admin account created");
}

ensureSuperAdmin().catch((error) => {
  console.error("Failed to create Super Admin", error);
});
