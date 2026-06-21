import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express();
const PORT = process.env.PORT || 4040;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, '.')));

app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'index.html')); 
});

app.listen(PORT, () => {
    console.log(`\n🚀 [AQQ SERVER] Servidor Web rodando com sucesso!`);
    console.log(`🔗 Acesse a Landing Page em: http://localhost:${PORT}\n`);
});