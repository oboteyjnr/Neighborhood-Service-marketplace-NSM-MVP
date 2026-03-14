const { USER_ROLES } = require("../utils/constants");

function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = req.session.user;
  return next();
}

function requireRole(...roles) {
  const validRoles = roles.length ? roles : Object.values(USER_ROLES);

  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!validRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
