import * as http from 'node:http';

export type Request = http.IncomingMessage;
export type Response = http.ServerResponse;
export type NextFunction = (err?: any) => void;
export type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export interface Context {
  params: Record<string, string>;
  query: Record<string, string>;
  body: any;
  files?: Record<string, { filename: string; mimetype: string; data: Buffer }>;
  headers: http.IncomingHttpHeaders;
}

export type Handler = (req: Request, res: Response, ctx: Context) => void | Promise<void>;

export interface RouteDefinition {
  method: string;
  path: string;
  handlerName: string | symbol;
  middlewares: Middleware[];
}

export interface CORSHeaders {
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
}
