
const rateLimit = require('express-rate-limit');

/**
 * @description Rate limiter for general API requests to prevent abuse.
 * It limits each IP to a specified number of requests within a given time window.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 10000 requests per 15 minutes
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

/**
 * @description Rate limiter specifically for authentication routes (login/register)
 * to prevent brute-force attacks.
 */
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 login/register attempts per hour
  message: 'Too many login attempts from this IP, please try again after an hour'
});

module.exports = { apiLimiter, authLimiter };
