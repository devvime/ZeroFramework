import { Controller, Post } from '../../lib';
import { Request, Response, Context } from '../../lib';
import { minioClient } from '../services/minio.service';

@Controller('/storage')
export class StorageController {
  
  @Post('/upload')
  async uploadFile(req: Request, res: Response, ctx: Context) {
    const file = ctx.files?.document;

    if (!file) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'No files were sent with the key "document""' }));
    }

    try {
      const bucketName = 'meu-bucket-files';
      const objectName = `${Date.now()}-${file.filename}`;
      
      await minioClient.putObject(
        bucketName, 
        objectName, 
        file.data,
        file.data.length, // File size in bytes
        { 'Content-Type': file.mimetype }
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: 'Upload completed successfully in MinIO!', 
        fileName: objectName,
        mimetype: file.mimetype,
        size: file.data.length
      }));

    } catch (error: any) {
      console.error('Error during upload to MinIO:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal error while saving to storage', details: error.message }));
    }
  }
}

// main.ts

// import * as http from 'node:http';
// import { AppRouter } from './core/router';
// import { StorageController } from './controllers/storage.controller';
// import { initMinio } from './services/minio.service'; // Importa a inicialização

// async function bootstrap() {
//   // 1. Inicializa dependências externas
//   await initMinio();

//   // 2. Sobe o framework
//   const appRouter = new AppRouter();
//   appRouter.registerControllers([StorageController]);

//   const server = http.createServer((req, res) => {
//     // ... configurações de CORS, etc ...
//     appRouter.handleRequest(req, res);
//   });

//   server.listen(3000, () => {
//     console.log('🚀 Server running at http://localhost:3000');
//   });
// }

// bootstrap();