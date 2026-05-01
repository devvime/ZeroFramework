export function parseMultipartFormData(buffer: Buffer, boundary: string) {
  const fields: Record<string, any> = {};
  const files: Record<string, { filename: string; mimetype: string; data: Buffer }> = {};

  // O separador oficial sempre tem '--' antes do boundary que vem no header
  const separator = Buffer.from(`--${boundary}`);
  let start = buffer.indexOf(separator);

  while (start !== -1) {
    const end = buffer.indexOf(separator, start + separator.length);
    if (end === -1) break;

    // Extrai o "pedaço" ignorando as quebras de linha (\r\n)
    const part = buffer.subarray(start + separator.length + 2, end - 2); 
    
    // Separa os headers desse pedaço do conteúdo real
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd !== -1) {
      const headers = part.subarray(0, headerEnd).toString();
      const body = part.subarray(headerEnd + 4);

      const nameMatch = headers.match(/name="([^"]+)"/);
      const filenameMatch = headers.match(/filename="([^"]+)"/);
      const contentTypeMatch = headers.match(/Content-Type: (.+)/);

      if (nameMatch) {
        const name = nameMatch[1];
        if (filenameMatch) {
          // É um ARQUIVO (Mantemos o body como Buffer!)
          files[name] = {
            filename: filenameMatch[1],
            mimetype: contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream',
            data: body 
          };
        } else {
          // É um CAMPO TEXTO (Convertamos o Buffer para string)
          fields[name] = body.toString('utf-8');
        }
      }
    }
    start = end;
  }

  return { fields, files };
}