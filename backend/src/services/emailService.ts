import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use 'smtp.gmail.com'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendInvitationEmail = async (to: string, workspaceName: string, inviteLink: string) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: `Invitation to join ${workspaceName} on CollabCode`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #333;">You've been invited!</h2>
                    <p style="color: #555;">
                        You have been invited to join the workspace <strong>${workspaceName}</strong> on CollabCode.
                    </p>
                    <p style="color: #555;">
                        Click the button below to join:
                    </p>
                    <a href="${inviteLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                        Join Workspace
                    </a>
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        If you didn't expect this invitation, you can ignore this email.
                    </p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
