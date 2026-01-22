module.exports = (...permissions) => {
  return (req, res, next) => {
    const required = permissions
      .flat()
      .filter(Boolean)
      .map((perm) => perm.toLowerCase());
    const userPermissions = (req.user?.permissions || []).map((perm) =>
      perm.toLowerCase()
    );

    const hasPermission = required.some((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Permission denied" });
    }
    next();
  };
};
