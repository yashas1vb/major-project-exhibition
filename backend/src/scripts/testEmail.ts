import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const testEmail = async () => {
    console.log('Testing Email Connection (Resend API)...');

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('❌ Missing RESEND_API_KEY in .env file');
        return;
    }
    console.log('API Key found:', apiKey.substring(0, 5) + '...');

    const resend = new Resend(apiKey);

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Default testing domain
            to: process.env.EMAIL_USER || 'delivered@resend.dev', // Use the email from env or Resend sink
            subject: 'Render Email Test (Resend API)',
            html: '<p>If you see this, the <strong>Resend API</strong> is working!</p>'
        });

        if (error) {
            console.error('❌ Resend Error:', error);
        } else {
            console.log('✅ Email sent successfully:', data);
        }
    } catch (error) {
        console.error('❌ Connection failed:', error);
    }
};

testEmail();
