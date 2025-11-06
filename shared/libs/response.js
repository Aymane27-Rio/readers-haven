export const ok = (res, data = null, message = 'ok', status = 200) => {
  return res.status(status).json({ status: 'success', message, data });
};

export const error = (res, status = 500, message = 'Internal Error', code = 'INTERNAL_ERROR', data = null) => {
  return res.status(status).json({ status: 'error', message, code, data });
};

export default { ok, error };
