import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import url from 'url';
import routes from './server/routes/user/routes.js'; // Corrigido para importar o arquivo correto

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api', routes);

// Função para importar todos os arquivos .js de um diretório
async function importDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.resolve(dir, file); 
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            importDir(fullPath);
        } else if (file.endsWith('.js')) {
            try {
                // Converte o caminho para file://
                const fileUrl = url.pathToFileURL(fullPath).href;
                await import(fileUrl); // Usando 'import()' dinâmico com URL file://
            } catch (err) {
                console.error(`Erro ao importar o arquivo ${file}:`, err);
            }
        }
    }
}

// Corrigindo o caminho para o diretório atual sem a duplicação
const currentDir = path.resolve(); // Obtemos o diretório raiz corretamente

const serverDir = path.resolve(currentDir, 'src', 'server'); // Usando resolve para evitar duplicação de barras

// Verifica se o diretório existe antes de tentar carregar os arquivos
if (fs.existsSync(serverDir)) {
    importDir(serverDir);
} else {
    console.error(`Diretório não encontrado: ${serverDir}`);
}

app.listen(process.env.PORT, () => {
    console.log(`API rest iniciada em http://localhost:${process.env.PORT}`);
    console.log(`Diretório atual: ${currentDir}`);
});

export { app };
