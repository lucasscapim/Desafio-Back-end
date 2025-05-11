import axios from "axios";
import prisma from "../../prisma.js";
import pkg from "@prisma/client";
const { Decimal } = pkg;

import { generateReadableProtocol } from "../../utils/generate_protocol.js";


// Realizar transferencia
export const transfer = async (transferReq, transferRes) => {
    let { sender, receiver, amount } = transferReq.body;

    // Verificar se o valor de 'amount' é válido
    if (isNaN(amount) || amount <= 0) {
        return transferRes.status(400).json({ message: 'Valor de transferência inválido!' });
    }

    try {
        // Verificar se pode continuar com a transação (mock)
        const authorize = await axios.get(`https://util.devi.tools/api/v2/authorize`)

        amount = parseFloat(amount)

        // Faz as duas requisições ao mesmo tempo
        const [senderResult, receiverResult] = await Promise.allSettled([
            axios.get(`http://localhost:3000/api/user/${sender}`),
            axios.get(`http://localhost:3000/api/user/${receiver}`)
        ]);

        // Verifica se o pagador/recebedor (sender/receiver) foi encontrado
        if (senderResult.status === 'rejected' || receiverResult.status === 'rejected') {
            const notFound = senderResult.status === 'rejected' ? `Usuário pagador (ID ${sender})` : `Usuário recebedor (ID ${receiver})`;
            return transferRes.status(404).json({ message: `${notFound} não encontrado.` });
        }

        // Dados dos usuários
        const userSender = senderResult.value.data.result[0];
        const userReceiver = receiverResult.value.data.result[0];

        // Verifica se o pagador é lojista
        if (userSender.is_seller == 1) {
            return transferRes.status(403).json({ message: 'Pagador tem a conta tipo "Lojista", não pode utilizar essa função!' });
        }

        // Verifica saldo
        if (userSender.amount < amount) {
            return transferRes.status(400).json({ message: 'Saldo insuficiente para realizar transferência!' });
        }

        // Realizar calculo do new balance do pagador/recebedor (sender/receiver)
        const newSenderBalance = parseFloat(userSender.amount) - amount
        const newReceiverBalance = parseFloat(userReceiver.amount) + amount

        // Atualizar saldo do pagador (sender)
        const updateSender = await prisma.user.update({
            where: {
                id: userSender.id
            },
            data: {
                amount: newSenderBalance
            }
        })

        // Atualizar saldo do recebedor (receiver)
        const updateReceiver = await prisma.user.update({
            where: {
                id: userReceiver.id
            },
            data: {
                amount: newReceiverBalance
            }
        })

        // Pegar endereço ip e agente que foi acessado
        const ip = transferReq.headers['x-forwarded-for']
            ? transferReq.headers['x-forwarded-for'].split(',')[0]  // Pega o primeiro IP (IP real)
            : transferReq.connection.remoteAddress;  // Se não tiver proxy, pega o IP direto da conexão

        const userAgent = transferReq.headers['user-agent'];

        // Registrar log da transação
        const transferLog = await prisma.log.create({
            data: {
                user: {
                    connect: { id: userSender.id }
                },
                recipient: {
                    connect: { id: userReceiver.id }
                },
                log_type: 'TRANSFER',
                description: `${userSender.name} (${userSender.id}) realizou uma transferência de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para ${userReceiver.name} (${userReceiver.id})`,
                transaction_id: await generateReadableProtocol('TRF'),
                previous_balance: new Decimal(userSender.amount),
                new_balance: new Decimal(newSenderBalance),
                ip_address: ip,
                device_info: userAgent,
                status: "SUCESS",
                transaction_amount: new Decimal(amount),
                recipient_previous_balance: new Decimal(userReceiver.amount),
                recipient_new_balance: new Decimal(newReceiverBalance)
            }
        })

        const emailSenderResponse = await axios.post('http://localhost:3000/api/send-email', {
            to: userSender.email,
            subject: 'Confirmação!',
            body: `Transferencia realizada com sucesso! para o ${userReceiver.name} no valor de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, PROTOCOLO: ${transferLog.transaction_id}`
        });
        
        const emailReceiverResponse = await axios.post('http://localhost:3000/api/send-email', {
            to: userReceiver.email,
            subject: 'Confirmação!',
            body: `Transferencia recebida com sucesso! enviada por ${userSender.name} no valor de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, PROTOCOLO: ${transferLog.transaction_id}`
        });


        return transferRes.status(200).json({ message: `Transferência validada com sucesso! PROTOCLO ${transferLog.transaction_id}` });

    } catch (error) {
        if (error.response) {
            // Caso o mock tenha retornado fail (403)
            if (error.response.status === 403) {
                console.log('Autorização para transação negada!')
                return transferRes.status(403).json({ message: 'Transação negada! tente novamente daqui a pouco.' })
            }
        } else {
            console.error('Erro inesperado:', error);
            return transferRes.status(500).json({ message: 'Erro inesperado no servidor.' });
        }
    }
};



export const cancelTransfer = async (transferReq, transferRes) => {
    // Pegar os dados da requisição
    const { protocolCode, user } = transferReq.body

    try {
        // Realizar busca de dados do protocolo (protocolCode)
        const transactionProtocol = await prisma.log.findUnique({
            where: {
                transaction_id: protocolCode,
            },
        });

        //Verificar se o (user) está envolvido na transação
        if (
            Number(user) !== Number(transactionProtocol.user_id) &&
            Number(user) !== Number(transactionProtocol.recipient_id)
        ) {
            return transferRes.status(403).json({ message: `Sem permissão para prosseguir com a requisição!` })
        }

        // Faz as duas requisições ao mesmo tempo
        const [senderResult, receiverResult] = await Promise.allSettled([
            axios.get(`http://localhost:3000/api/user/${transactionProtocol.user_id}`),
            axios.get(`http://localhost:3000/api/user/${transactionProtocol.recipient_id}`)
        ]);

        // Dados dos usuários
        const userSender = senderResult.value.data.result[0];
        const userReceiver = receiverResult.value.data.result[0];

        // Realizar calculo do new balance do pagador/recebedor (sender/receiver)
        const newSenderBalance = (parseFloat(userSender.amount) + parseFloat(transactionProtocol.transaction_amount)).toFixed(2);
        const newReceiverBalance = (parseFloat(userReceiver.amount) - parseFloat(transactionProtocol.transaction_amount)).toFixed(2);

        // Atualizar saldo do pagador (sender)
        const updateSender = await prisma.user.update({
            where: {
                id: userSender.id
            },
            data: {
                amount: newSenderBalance
            }
        })

        // Atualizar saldo do recebedor (receiver)
        const updateReceiver = await prisma.user.update({
            where: {
                id: userReceiver.id
            },
            data: {
                amount: newReceiverBalance
            }
        })

        // Pegar endereço ip e agente que foi acessado
        const ip = transferReq.headers['x-forwarded-for']
            ? transferReq.headers['x-forwarded-for'].split(',')[0]  // Pega o primeiro IP (IP real)
            : transferReq.connection.remoteAddress;  // Se não tiver proxy, pega o IP direto da conexão

        const userAgent = transferReq.headers['user-agent'];

        // Registrar log da transação
        const transferLog = await prisma.log.create({
            data: {
                user: {
                    connect: { id: userSender.id }
                },
                recipient: {
                    connect: { id: userReceiver.id }
                },
                log_type: 'TRANSFER',
                description: `Transferência de ${transactionProtocol.transaction_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de ${userSender.name} (${userSender.id}) para ${userReceiver.name} (${userSender.id} foi CANCELADA por ${user})`,
                transaction_id: await generateReadableProtocol('CAN'),
                original_transaction_id: protocolCode,
                previous_balance: new Decimal(userSender.amount),
                new_balance: new Decimal(newSenderBalance),
                ip_address: ip,
                device_info: userAgent,
                status: "CANCEL",
                transaction_amount: new Decimal(transactionProtocol.transaction_amount),
                recipient_previous_balance: new Decimal(userReceiver.amount),
                recipient_new_balance: new Decimal(newReceiverBalance)
            }
        })

        const emailSenderResponse = await axios.post('http://localhost:3000/api/send-email', {
            to: userSender.email,
            subject: 'Cancelamento!',
            body: `Transferencia cancelada com sucesso! transferencia ${transferLog.original_transaction_id} PROTOCOLO DE CANCELAMENTO: ${transferLog.transaction_id}`
        });
        
        const emailReceiverResponse = await axios.post('http://localhost:3000/api/send-email', {
            to: userReceiver.email,
            subject: 'Cancelamento!',
            body: `ransferencia cancelada com sucesso! transferencia ${transferLog.original_transaction_id} PROTOCOLO DE CANCELAMENTO: ${transferLog.transaction_id}`
        });

        return transferRes.status(200).json({ message: `Cancelamento realizado com sucesso! PROTOCLO ${transferLog.transaction_id}` });

    } catch (error) {
        console.error('Erro inesperado:', error);
        return transferRes.status(500).json({ message: 'Erro inesperado no servidor.' });
    }

}
