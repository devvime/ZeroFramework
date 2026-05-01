import { RouteDefinition, Request, Response, Context } from './types';
import { parseMultipartFormData } from './helper';

export class AppRouter {
  private routes: Array<{
    method: string;
    pathRegex: RegExp;
    paramKeys: string[];
    middlewares: any[];
    handler: Function;
  }> = [];

  registerControllers(controllers: any[]) {
    controllers.forEach((ControllerClass) => {
      const instance = new ControllerClass();
      const basePath = ControllerClass.prototype.__basePath || '';
      const routes: RouteDefinition[] = ControllerClass.prototype.__routes || [];

      routes.forEach((route) => {
        const fullPath = `${basePath}${route.path}`.replace(/\/+/g, '/');
        
        // Conversão de /users/:id para Regex
        const paramKeys: string[] = [];
        const regexString = fullPath.replace(/:([^\/]+)/g, (_, key) => {
          paramKeys.push(key);
          return '([^\/]+)';
        });
        
        const pathRegex = new RegExp(`^${regexString}$`);

        this.routes.push({
          method: route.method,
          pathRegex,
          paramKeys,
          middlewares: route.middlewares,
          handler: instance[route.handlerName].bind(instance)
        });
      });
    });
  }

  private executeMiddlewares(req: Request, res: Response, middlewares: any[], index: number, done: Function) {
    if (index >= middlewares.length) {
      return done();
    }
    const middleware = middlewares[index];
    middleware(req, res, (err?: any) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error', details: err }));
        return;
      }
      this.executeMiddlewares(req, res, middlewares, index + 1, done);
    });
  }

  handleRequest(req: Request, res: Response) {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Procura a rota via Regex
    const matchedRoute = this.routes.find(r => r.method === method && r.pathRegex.test(pathname));

    if (!matchedRoute) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Not Found' }));
    }

    // Extrai Path Params
    const match = pathname.match(matchedRoute.pathRegex);
    const params: Record<string, string> = {};
    if (match) {
      matchedRoute.paramKeys.forEach((key, index) => {
        params[key] = match[index + 1];
      });
    }

    // Extrai Query Params
    const query: Record<string, string> = {};
    parsedUrl.searchParams.forEach((val, key) => { query[key] = val; });

    const ctx: Context = {
      params,
      query,
      headers: req.headers,
      body: {}
    };

    // Lê o Body se necessário
    if (['POST', 'PUT', 'PATCH'].includes(method!)) {
      const chunks: Buffer[] = [];
      
      // Armazena os dados crus em binário (não use toString aqui!)
      req.on('data', chunk => chunks.push(chunk));
      
      req.on('end', () => {
        const rawBuffer = Buffer.concat(chunks);
        const contentType = req.headers['content-type'] || '';

        try {
          if (contentType.includes('application/json')) {
            // Parser de JSON
            const textBody = rawBuffer.toString('utf-8');
            ctx.body = textBody ? JSON.parse(textBody) : {};

          } else if (contentType.includes('application/x-www-form-urlencoded')) {
            // Parser de Form nativo simples (name=John&age=30)
            const textBody = rawBuffer.toString('utf-8');
            const parsedForm = new URLSearchParams(textBody);
            ctx.body = Object.fromEntries(parsedForm.entries());

          } else if (contentType.includes('multipart/form-data')) {
            // Parser de arquivos e dados complexos
            const boundaryMatch = contentType.match(/boundary=(.+)$/);
            if (!boundaryMatch) throw new Error('Boundary não encontrado no header');
            
            const { fields, files } = parseMultipartFormData(rawBuffer, boundaryMatch[1]);
            ctx.body = fields;
            ctx.files = files; // Injeta os arquivos no contexto
          } else {
            // Fallback (texto puro)
            ctx.body = rawBuffer.toString('utf-8');
          }

        } catch (e: any) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Erro ao processar body', details: e.message }));
        }
        
        // Executa chain de middlewares e chama o handler final
        this.executeMiddlewares(req, res, matchedRoute.middlewares, 0, () => {
          matchedRoute.handler(req, res, ctx);
        });
      });
    } else {
      // GET, DELETE, OPTIONS, etc...
      this.executeMiddlewares(req, res, matchedRoute.middlewares, 0, () => {
        matchedRoute.handler(req, res, ctx);
      });
    }
  }
}
