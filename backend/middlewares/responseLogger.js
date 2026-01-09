// const logger = require("../utils/logger");

// module.exports = (req, res, next) => {
//   const originalJson = res.json;

//   res.json = function (data) {
//     logger.http({
//       method: req.method,
//       url: req.originalUrl,
//       status: res.statusCode,
//     });

//     return originalJson.call(this, data);
//   };

//   next();
// };







// full data ke sath
const logger = require("../utils/logger");

module.exports = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    logger.http({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,

      // 👇 jo table me dekhna ho
      data: data?.categories || data?.data || null,
    });

    return originalJson.call(this, data);
  };

  next();
};

