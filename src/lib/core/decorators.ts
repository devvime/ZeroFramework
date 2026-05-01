import { RouteDefinition, Middleware } from './types';

export function Controller(basePath: string) {
  return function (target: Function) {
    target.prototype.__basePath = basePath;
  };
}

export function UseMiddleware(...middlewares: Middleware[]) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    if (propertyKey) {
      // Applied in a method
      if (!target.__middlewares) target.__middlewares = {};
      target.__middlewares[propertyKey] = middlewares;
    } else {
      // Applied in the entire class (Controller)
      target.prototype.__controllerMiddlewares = middlewares;
    }
  };
}

function RouteFactory(method: string, path: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!target.__routes) target.__routes = [];
    
    // Retrieves middlewares defined only in the method
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