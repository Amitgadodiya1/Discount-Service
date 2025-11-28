
// Authentication + Role Validation Middleware for admin and user roles
const authMiddleware = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  const role = req.headers["x-user-role"];

  if (!userId) {
    return res.status(400).json({ error: "Missing X-User-Id header" });
  }

  if (!role) {
    return res.status(400).json({ error: "Missing X-User-Role header" });
  }

  req.userId = userId;
  req.role = role.toLowerCase();
  next();
};

// Authorization: only user or admin
const userAccess = (req, res, next) => {
  if (req.role !== "user" && req.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Users only" });
  }
  next();
};

// Authorization: only admin
const adminAccess = (req, res, next) => {
  if (req.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Admin only" });
  }
  next();
};

module.exports = { authMiddleware, userAccess, adminAccess };