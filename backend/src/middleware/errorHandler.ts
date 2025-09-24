import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  status?: string
  isOperational?: boolean
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const status = err.status || 'error'

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // Send error response
  res.status(statusCode).json({
    success: false,
    status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export const createError = (message: string, statusCode: number): AppError => {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
  error.isOperational = true
  return error
}