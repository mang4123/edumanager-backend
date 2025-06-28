import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('=== ERROR HANDLER ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Error message:', error.message);
  console.log('Status code:', error.statusCode);
  console.log('Headers:', req.headers.authorization ? 'Auth header present' : 'No auth header');
  
  // Log detalhado para erros de autenticação/autorização
  if (error.statusCode === 401 || error.statusCode === 403) {
    console.log('🚨 AUTH/AUTHZ ERROR - This might cause frontend logout');
    console.log('Full error:', error);
  }
  console.log('=== FIM ERROR HANDLER ===');

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno do servidor';

  // Log do erro para desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Erro:', {
      message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    });
  }

  res.status(statusCode).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export const createError = (message: string, statusCode = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}; 