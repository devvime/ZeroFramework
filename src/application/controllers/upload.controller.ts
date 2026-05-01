import { Controller, Post } from '../../lib';
import { Request, Response, Context } from '../../lib';
import * as fs from 'node:fs';

@Controller('/upload')
export class UploadController {
  
  @Post('')
  receberArquivo(req: Request, res: Response, ctx: Context) {
    const name = ctx.body.name; 
    const avatar = ctx.files?.avatar;

    if (avatar) {
      // The avatar.data file is already a perfect binary buffer to save!
      fs.writeFileSync(`./${avatar.filename}`, avatar.data);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: 'Arquivo salvo!', 
        fileName: avatar.filename,
        mimetype: avatar.mimetype
      }));
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No avatars sent' }));
    }
  }
}