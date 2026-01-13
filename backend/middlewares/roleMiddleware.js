module.exports = (...allowedRoles) => {     //  ...allowedRoles   roles chek kar ta hai
    return (req, res, next) => {
       // safety check
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // role check
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied" });
    }
    
       next();
    };
};