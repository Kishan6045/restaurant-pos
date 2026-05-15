module.exports = (permission) => {
  return (req, res, next) => {
    if (req.user?.role === "admin") {
      return next();
    }
    const perms = req.user?.permissions;
    if (!Array.isArray(perms) || !perms.includes(permission)) {
      return res.status(403).json({ message: "Permission denied" });
    }
    next();
  };
};
