import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const testEmail = async () => {
    console.log('Testing Email Connection (Port 587)...');
    console.log('User:', process.env.EMAIL_USER);
    // Don't log password

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        },
        family: 4,
        connectionTimeout: 10000,
    } as any);

    try {
        await transporter.verify();
        console.log('✅ Connection verification successful (SMTP handshake)');

        if (process.env.EMAIL_USER) {
            const info = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: 'Render Email Test (Port 587)',
                text: 'If you see this, the email service is working via STARTTLS!',
            });
            console.log('✅ Test email sent:', info.response);
        }
    } catch (error) {
        console.error('❌ Connection failed:', error);
    }
};

testEmail();
