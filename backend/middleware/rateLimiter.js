const rateLimit = require('express-rate-limit'); // Import rate limiting middleware
const limiter = rateLimit({//rateLimit is a middleware function that limits repeated requests to APIs
    windowMs: 15 * 60 * 1000, // 15-minute window, windowMs is a configuration option that specifies the time frame for which the maximum number of requests is allowed
    max: 100 // Allow only 100 requests per IP per window
  });