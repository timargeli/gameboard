import { Request, Response, NextFunction } from 'express'

// Error handling
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err.message)
  console.error('Stack:', err.stack)

  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
  })
}
