import { Request, ResponseValue } from 'hapi';

interface RouteConfig {
  method: 'GET' | 'POST';
  path: string;
  handler(req: Request): Promise<ResponseValue>;
  options?: any;
}

export { RouteConfig };
