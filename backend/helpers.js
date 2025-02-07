const { CORS_WHITE_LIST, NODE_ENV } = process.env;

const rateLimitOptions = {
  global: true,
  max: 100,
  timeWindow: '1 minute',
  nameSpace: 'rate-limit',
};

const helmetOptions = {
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  expectCt: false,
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

const corsOptionDelegate = (origin, callback) => {
  if (NODE_ENV === 'development') return callback(null, true);
  if (!origin)
    return callback(
      {
        message: 'Invalid origin',
        statusCode: 403,
      },
      false,
    );
  const whiteList = CORS_WHITE_LIST.split(';');
  const isWhiteListed = whiteList.some(url => url === origin);
  if (!isWhiteListed)
    return callback(
      {
        message: 'Invalid origin',
        statusCode: 403,
      },
      false,
    );
  return callback(null, true);
};

module.exports = { rateLimitOptions, helmetOptions, corsOptionDelegate };
