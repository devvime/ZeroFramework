import { RouteDefinition, Middleware } from './types';

export function Controller(basePath: string) {
  return function (target: Function) {
    target.prototype.__basePath = basePath;
  };
}

export function UseMiddleware(...middlewares: Middleware[]) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    if (propertyKey) {
      // Aplicado em um método
      if (!target.__middlewares) target.__middlewares = {};
      target.__middlewares[propertyKey] = middlewares;
    } else {
      // Pode ser expandido para aplicar no controller inteiro
    }
  };
}

function RouteFactory(method: string, path: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!target.__routes) target.__routes = [];
    
    // Pega middlewares definidos no método, se houver
    const middlewares = target.__middlewares?.[propertyKey] || [];
    
    target.__routes.push({
      method,
      path,
      handlerName: propertyKey,
      middlewares
    });
  };
}

export const Get = (path: string = '') => RouteFactory('GET', path);
export const Post = (path: string = '') => RouteFactory('POST', path);
export const Put = (path: string = '') => RouteFactory('PUT', path);
export const Patch = (path: string = '') => RouteFactory('PATCH', path);
export const Delete = (path: string = '') => RouteFactory('DELETE', path);