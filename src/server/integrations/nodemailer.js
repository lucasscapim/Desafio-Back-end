import nodemailer from 'nodemailer'
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
});

transporter.verify((err, success) => {
    if (err) {
        console.error('Erro ao conectar ao Nodemailer:', err);
    } else {
        console.log('Nodemailer conectado ✔');
    }
});

export const sendEmail = async (req, res) => {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Campos obrigatórios não enviados.' });
    }

    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to,
            subject,
            text: body
        });

        return res.json('Email Enviado! ✔');
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        return res.status(500).json({ error: 'Erro ao enviar email.' });
    }
};