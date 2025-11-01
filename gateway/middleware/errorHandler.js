export const errorHandler = (err, req, res, next) => {
  console.error("Gateway Error:", err.message);
  if (err.response) {
    return res.status(err.response.status).json(err.response.data);
  }
  res.status(500).json({ message: "Internal Server Error" });
};