import * as Minio from 'minio';

export const minioClient = new Minio.Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: 'seu_access_key',
  secretKey: 'seu_secret_key'
});

const BUCKET_NAME = 'meu-bucket-arquivos';

export async function initMinio() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`📦 Bucket '${BUCKET_NAME}' criado com sucesso no MinIO.`);
    } else {
      console.log(`📦 Bucket '${BUCKET_NAME}' já existe.`);
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com MinIO:', error);
  }
}