import { Controller, Get, Post, Put, UseMiddleware } from '../../lib';
import { Request, Response, Context } from '../../lib';
import { AuthMiddleware } from '../middlewares/auth.middleware';

@Controller('/users')
export class UserController {

  @Get()
  listUser(req: Request, res: Response, ctx: Context) {
    const response = {
      message: 'Lista de usuários',
      query: ctx.query,
      headers: ctx.headers
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  }
  
  @Get('/:id')
  getUser(req: Request, res: Response, ctx: Context) {
    const response = {
      message: 'Dados do usuário',
      userId: ctx.params.id,
      filtro: ctx.query.active,
      agente: ctx.headers['user-agent']
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  }

  @Post()
  @UseMiddleware(AuthMiddleware)
  createUser(req: Request, res: Response, ctx: Context) {
    const response = {
      message: 'Usuário criado com sucesso!',
      dadosRecebidos: ctx.body
    };

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  }

  @Put('/:id')
  @UseMiddleware(AuthMiddleware)
  updateUser(req: Request, res: Response, ctx: Context) {
    const response = {
      message: 'Usuário atualizado com sucesso!',
      userId: ctx.params.id,
      dadosRecebidos: ctx.body
    };

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  }
}
