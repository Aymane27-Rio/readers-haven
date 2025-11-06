export function ok(res, data = null, message = 'OK') {
  return res.status(200).json({ status: 'success', message, data, requestId: res.getHeader('x-request-id') });
}

export function created(res, data = null, message = 'Created') {
  return res.status(201).json({ status: 'success', message, data, requestId: res.getHeader('x-request-id') });
}

export function error(res, statusCode = 500, message = 'Internal Server Error', code = 'INTERNAL_ERROR', details = undefined) {
  return res.status(statusCode).json({
    status: 'error',
    message,
    error: { code, details },
    requestId: res.getHeader('x-request-id')
  });
}

export function notFound(res, message = 'Not Found') {
  return error(res, 404, message, 'NOT_FOUND');
}

export function unauthorized(res, message = 'Unauthorized') {
  return error(res, 401, message, 'UNAUTHORIZED');
}

export function badRequest(res, message = 'Bad Request', details) {
  return error(res, 400, message, 'BAD_REQUEST', details);
}
