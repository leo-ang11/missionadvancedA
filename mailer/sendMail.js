import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

export async function sendWelcomeEmail(toEmail, userName, token) {
    const port = process.env.PORT;
    const info = await transporter.sendMail({
        from: 'leo@example.com',
        to: toEmail,
        subject: 'Selamat Datang!',
        html: `Lanjutkan link ini untuk verifikasi akun Anda: http://localhost:${port}/verify-email/${token}`
    });

    console.log('Email terkirim');
}
