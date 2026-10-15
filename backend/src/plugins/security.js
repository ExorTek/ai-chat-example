'use strict';

const config = require('../config');

const rateLimitOptions = {
  global: true,
  max: config.rateLimit.max,
  timeWindow: config.rateLimit.timeWindow,
  nameSpace: 'rate-limit',
};

const helmetOptions = {
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: false,
  hidePoweredBy: true,
  hsts: {
    maxAge: 15552000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: false,
  noSniff: true,
  permittedCrossDomainPolicies: { policy: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: false,
};

const denied = () => ({ message: 'Invalid origin', statusCode: 403 });

const corsOptionDelegate = (origin, callback) => {
  if (config.isDevelopment) return callback(null, true);
  // Same-origin requests, health checks and server-to-server callers send no Origin header.
  // CORS only governs browsers, so rejecting those would break tooling without adding safety.
  if (!origin) return callback(null, true);
  if (!config.corsWhiteList.includes(origin)) return callback(denied(), false);
  return callback(null, true);
};

module.exports = { rateLimitOptions, helmetOptions, corsOptionDelegate };
