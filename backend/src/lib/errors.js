'use strict';

class ApiError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

const badRequest = (message, details) => new ApiError(400, 'BAD_REQUEST', message, details);
const notFound = message => new ApiError(404, 'NOT_FOUND', message);
const upstreamError = (message, details) => new ApiError(502, 'UPSTREAM_ERROR', message, details);
const serviceUnavailable = message => new ApiError(503, 'SERVICE_UNAVAILABLE', message);

// The OpenAI SDK is used for every provider, so one translation covers all of them.
const fromUpstream = error => {
  if (error instanceof ApiError) return error;
  if (error?.name === 'AbortError') return new ApiError(499, 'CLIENT_CLOSED_REQUEST', 'Request aborted');

  const status = error?.status || error?.response?.status;
  const message = error?.error?.message || error?.message || 'Upstream provider request failed';

  if (status === 401 || status === 403) return new ApiError(502, 'UPSTREAM_AUTH_ERROR', 'Provider rejected the API key');
  if (status === 404) return new ApiError(400, 'MODEL_NOT_FOUND', message);
  if (status === 429) return new ApiError(429, 'UPSTREAM_RATE_LIMITED', 'Provider rate limit reached, try again shortly');
  if (status >= 500) return serviceUnavailable('Provider is temporarily unavailable');

  return upstreamError(message);
};

module.exports = { ApiError, badRequest, notFound, upstreamError, serviceUnavailable, fromUpstream };
