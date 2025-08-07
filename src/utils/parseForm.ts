import { NextRequest } from 'next/server';
import formidable, { Fields, Files } from 'formidable';
import { Readable } from 'stream';
import { IncomingMessage } from 'http';

export async function parseForm(req: NextRequest): Promise<{ fields: Fields; files: Files }> {
  const form = formidable({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  const reader = req.body?.getReader();
  if (!reader) throw new Error('Request body is empty or unreadable');

  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value); // value might be undefined
  }

  if (chunks.length === 0) {
    throw new Error("No data received in request body");
  }

  const buffer = Buffer.concat(chunks);

  // Simulate a real Node.js request stream
  const fakeReq = Object.assign(Readable.from(buffer), {
    headers: Object.fromEntries(req.headers.entries()),
    method: req.method,
    url: req.url || '',
  });

  return new Promise((resolve, reject) => {
    form.parse(fakeReq as IncomingMessage, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}
