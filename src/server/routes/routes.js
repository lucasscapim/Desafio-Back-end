import express from 'express';
import { createUser, getUsers, getLojistas, getUserId } from '../controllers/users/userController.js'; 
import { depositAmount } from '../controllers/users/amountController.js'; 
import { transfer, cancelTransfer } from '../controllers/users/transferController.js';
import { sendEmail } from '../../integrations/implementations/nodemailer.js'

const userRoutes = express.Router();

userRoutes.get('/users', getUsers); // Rota para listar usuários
userRoutes.get('/lojistas', getLojistas); // Rota para listar lojistas
userRoutes.get('/user/:id', getUserId); // Rota para pegar um usuário específico pelo ID
userRoutes.post('/create', createUser); // Rota para criar um novo usuário
userRoutes.post('/deposit', depositAmount); // Rota para realizar um deposito
userRoutes.post('/transfer', transfer); // Rota para realizar uma transferencia
userRoutes.post('/cancel-transfer', cancelTransfer); // Rota para realizar cancelamento de uma transferencia
userRoutes.post('/send-email', sendEmail); // Rota para enviar um email

export default userRoutes;