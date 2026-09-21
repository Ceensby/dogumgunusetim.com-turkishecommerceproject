import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { createApp } = await import('./app.js');

const port = Number(process.env.PORT) || 5000;
const app = createApp();

app.listen(port, () => {
  console.log(`[sunucu] http://localhost:${port} üzerinde çalışıyor`);
});
