const multer = require('multer');
const db = require('../config/db');

// Usar armazenamento em memória para manter o buffer da imagem disponível em req.file.buffer
// Isso é compatível com o que userController espera (inserir/atualizar foto_perfil como BLOB)
const profileStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
};

exports.uploadProfilePicture = multer({
    storage: profileStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('profilePicture');

// Rota autenticada: atualiza a foto do usuário logado, salvando o buffer no campo BLOB 'foto_perfil' da tabela 'usuarios'
exports.handleProfilePictureUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhuma imagem foi enviada.' });
        }

        // authMiddleware deve definir req.usuario; aqui validamos por segurança
        const userId = req.usuario && req.usuario.id ? req.usuario.id : null;
        if (!userId) {
            return res.status(401).json({ message: 'Não autenticado.' });
        }

        const imageBuffer = req.file.buffer;
        const [result] = await db.query(
            'UPDATE usuarios SET foto_perfil = ? WHERE id = ?',
            [imageBuffer, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Retornamos um base64 opcional para preview, se necessário
        const base64 = Buffer.from(imageBuffer).toString('base64');
        return res.status(200).json({ message: 'Foto de perfil atualizada com sucesso!', foto_perfil_base64: base64 });
    } catch (error) {
        console.error('Erro ao atualizar foto de perfil:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};
