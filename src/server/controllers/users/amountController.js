
import axios from "axios";
import prisma from "../../prisma.js";
import pkg from "@prisma/client";
const { Decimal } = pkg;

import { generateReadableProtocol } from "../../utils/generate_protocol.js";

export const depositAmount = async (request, response) => {
    let { id, amount } = request.body;

    try {

        // Verificar se pode continuar com a transação (mock)
        const authorize = await axios.get(`https://util.devi.tools/api/v2/authorize`)

        amount = parseFloat(amount)
        // Verifica os dados do usuario
        const [userResult] = await Promise.allSettled([
            axios.get(`http://localhost:3000/api/user/${id}`),
        ]);

        // Verifica se o user foi encontrado
        if (userResult.status === 'rejected') {
            return transferRes.status(404).json({ message: `Usuário (ID ${id}) não encontrado.` });
        }

        // Dados dos usuários
        const userDeposit = userResult.value.data.result[0];

        // Novo saldo do usuario
        const newUserBalance = parseFloat(userDeposit.amount) + amount

        // Pegar endereço ip e agente que foi acessado
        const ip = request.headers['x-forwarded-for']
            ? request.headers['x-forwarded-for'].split(',')[0]
            : request.connection.remoteAddress;

        const userAgent = request.headers['user-agent'];

        // Atualizar dinheiro do user
        const userUpdate = await prisma.user.update({
            where: {
                id: userDeposit.id
            },
            data: {
                amount: newUserBalance
            }
        })

        // Registrar log do deposito
        const depositLog = await prisma.log.create({
            data: {
                user: {
                    connect: { id: userDeposit.id }
                },
                log_type: 'DEPOSIT',
                description: `${userDeposit.name} (${userDeposit.id}) realizou um deposito de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
                transaction_id: await generateReadableProtocol(),
                previous_balance: new Decimal(userDeposit.amount),
                new_balance: new Decimal(newUserBalance),
                ip_address: ip,
                device_info: userAgent,
                status: "SUCESS",
                transaction_amount: new Decimal(amount),
            }
        })

        const emailResponse = await axios.post('http://localhost:3000/api/send-email', {
            to: userDeposit.email,
            subject: 'Confirmação!',
            body: `Deposito realizado com sucesso! PROTOCOLO: ${depositLog.transaction_id}` 
          });

        return response.status(200).json({ message: `Deposito validado com sucesso! PROTOCLO ${depositLog.transaction_id}` });


    } catch (error) {
        if (error.response) {
            // Caso o mock tenha retornado fail (403)
            if (error.response.status === 403) {
                console.log('Autorização para transação negada!')
                return response.status(403).json({ message: 'Deposito negada! tente novamente daqui a pouco.' })
            }
        } else {
            console.error('Erro inesperado:', error);
            return response.status(500).json({ message: 'Erro inesperado no servidor.' });
        }
    }
}
