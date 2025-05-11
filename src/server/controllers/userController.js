import { hash_password } from "../../utils/hash-password.js";

import prisma from "../../prisma.js";

// GET http://localhost:3000/api/create/      criar um novo usuario

export const createUser = async (request, response) => {
    const { name, document, email, password, is_seller, amount } = request.body;

    try {
        // Verificar se o e-mail ou documento já existe
        const existingUser = await prisma.user.findMany({
            where: {
                OR: [
                    { email: email },
                    { document: document }
                ]
            }
        });

        // Se encontrar um usuário com o email ou documento
        if (existingUser.length > 0) {
            const existingEmail = existingUser.some((user) => user.email === email);
            const existingDocument = existingUser.some((user) => user.document === document);

            if (existingEmail && existingDocument) {
                return response.status(400).json({ error: 'E-mail e documento já cadastrados' });
            } else if (existingEmail) {
                return response.status(400).json({ error: 'E-mail já cadastrado' });
            } else if (existingDocument) {
                return response.status(400).json({ error: 'Documento já cadastrado' });
            }
        }

        // Gerar o hash da senha
        const password_bcrypt = await hash_password(password);

        // Inserir o novo usuário
        await prisma.user.create({
            data: {
                name: name,
                document: document,
                email: email,
                password: password_bcrypt,
                is_seller: is_seller,
                amount: amount,
            }
        });

        response.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        response.status(500).json({ error: 'Erro interno do servidor' });
    }
};


// GET http://localhost:3000/api/users/      pegar lista de usuarios

export const getUsers = async (request, response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                document: true,
                email: true,
                password: true,
                is_seller: true,
                amount: true
            }
        });

        console.log('Sucesso na consulta', users);
        response.json({ result: users });

    } catch (err) {
        console.error('Erro na consulta:', err);
        response.status(500).json({ error: 'Erro ao buscar usuários' });
    }
};

// GET http://localhost:3000/api/lojistas/      pegar lista de lojistas
export const getLojistas = async (request, response) => {
    try {
        // Consulta os usuários que são vendedores
        const users = await prisma.user.findMany({
            where: {
                is_seller: true // Filtra apenas os usuários com is_seller = 1
            },
            select: {
                id: true,
                name: true,
                document: true,
                email: true,
                password: true,
                is_seller: true,
                amount: true
            }
        });

        response.json({ result: users });;
    } catch (error) {
        console.error('Erro ao buscar vendedores:', error);
        response.status(500).json({ error: 'Erro interno do servidor' });
    }
};


// GET http://localhost:3000/api/users/:id   pegar um usuario em especifico pelo id
export const getUserId = async  (request, response) => {
    var userId = Number(request.params.id)
    try {
        const users = await prisma.user.findMany({
            where: {
                id: userId
            },
            select: {
                id: true,
                name: true,
                document: true,
                email: true,
                password: true,
                is_seller: true,
                amount: true
            }
        })

        response.json({ result: users });
    } catch (err) {
        console.error('Erro na consulta:', err);
        return response.status(500).json({ error: 'Erro ao buscar usuários' });
    }

}    
