import { Request, Response, NextFunction } from '../../lib';

export function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization'];
  
  if (!token || token !== 'Bearer meu-token-secreto') {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized. Envie o header Authorization.' }));
    return;
  }
  
  console.log('✅ Auth Middleware: Authorized user.');
  next();
}
