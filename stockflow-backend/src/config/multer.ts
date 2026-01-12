import multer from 'multer';
import path from 'node:path';
import crypto from 'crypto';

// Configuração do armazenamento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Definir a pasta de destino
        cb(null, path.resolve(__dirname, '..', '..', 'uploads', 'images'));
    },
    filename: (req, file, cb) => {
        // Gera um nome único para o ficheiro para evitar colisões
        crypto.randomBytes(16, (err, hash) => {
            if (err) cb(err, ''); 
            
            // Ex: a1b2c3d4e5f6...-nome-original.jpg
            const fileName = `${hash.toString('hex')}-${file.originalname}`;
            cb(null, fileName);
        });
    },
});

// Filtro para aceitar apenas imagens
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Formato de ficheiro inválido. Apenas imagens são permitidas."));
    }
};

const uploadConfig = {
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB
    },
    fileFilter: fileFilter
};

export default uploadConfig;