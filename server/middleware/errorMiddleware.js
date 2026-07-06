const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? error.statusCode || 500 : res.statusCode;

  res.status(statusCode).json({
    message: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : error.stack
  });
};

export { notFound, errorHandler };
