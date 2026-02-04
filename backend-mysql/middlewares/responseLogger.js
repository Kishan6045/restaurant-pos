const logger = require("../utils/logger");

module.exports = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    logger.http({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
    });

    return originalJson.call(this, data);
  };

  next();
};
