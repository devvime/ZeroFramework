import * as http from 'node:http';
import { IncomingMessage, ServerResponse } from 'node:http';
import { AppRouter } from './lib';
import { UserController } from './application/controllers/user.controller';
import { UploadController } from './application/controllers/upload.controller';
import { CORSHeaders } from './lib';

const appRouter = new AppRouter();

appRouter.registerControllers([
  UserController,
  UploadController
]);

const corsHeaders: CORSHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  appRouter.handleRequest(req, res);
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`- Teste GET: http://localhost:${PORT}/users/123?active=true`);
  console.log(`- Teste POST: http://localhost:${PORT}/users (Requer header Authorization)`);
});
