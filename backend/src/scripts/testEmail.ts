import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const testEmail = async () => {
    console.log('Testing Email Connection...');
    console.log('User:', process.env.EMAIL_USER);
    // Don't log password

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.verify();
        console.log('✅ Connection verification successful (SMTP handshake)');

        // Optional: Send a test email to self
        if (process.env.EMAIL_USER) {
            const info = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: 'Render Email Test',
                text: 'If you see this, the email service is working!',
            });
            console.log('✅ Test email sent:', info.response);
        }
    } catch (error) {
        console.error('❌ Connection failed:', error);
    }
};

testEmail();
