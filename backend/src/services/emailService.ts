import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInvitationEmail = async (to: string, workspaceName: string, inviteLink: string) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'CollabCode <onboarding@resend.dev>', // Default testing domain for Resend
            to: [to],
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
        });

        if (error) {
            console.error('Error sending email:', error);
            return false;
        }

        console.log('Email sent:', data);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
