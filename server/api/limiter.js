const rateLimit = require('express-rate-limit');
const log = require('../log');

const createRateLimiter = (options) => (req, res, next) => {
  if (process.env.NODE_ENV !== 'production' || (req.user && req.user.is_admin && req.user.is_active)) {
    return next(); // Disable rate limit for admins or in non-production mode
  }
  return rateLimit(options)(req, res, next);
};

const instanceApiRateLimiter = {
  DDOSProtectionApiRateLimiter: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 250, // Limit each IP to 250 requests per `window`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (request, response, next, options) => {
      log.warn(`DDOS protection API rate limiter: > 250req/minute/ip ${request.ip}`);
      return response.status(options.statusCode).send(options.message);
    },
  }),

  /** This is a limiter used to avoid spam
   * (used during the registration, pass recovery, posting events) */
  SPAMProtectionApiRateLimiter: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 6, // Limit each IP to 6 requests per 5 minutes
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (request, response, next, options) => {
      log.warn(`SPAM protection API rate limiter: 6req/5min/ip ${request.ip}`);
      return response.status(options.statusCode).send(options.message);
    },
  }),
};

module.exports = instanceApiRateLimiter;
