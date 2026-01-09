export function getRecoverPasswordEmailTemplate(userName: string, resetLink: string): string {
    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; background-color: #fafafa;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #0056b3;">Syscorrect Empregador</h2>
        </div>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 5px;">
            <p>Olá, <strong>${userName}</strong>.</p>
            <p>Recebemos uma solicitação de recuperação de acesso para sua conta administrativa.</p>
            <p>Para criar uma nova senha, clique no botão abaixo:</p>
            
            <div style="text-align: center; margin: 35px 0;">
                <a href="${resetLink}" style="background-color: #0056b3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Redefinir Senha Corporativa
                </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">Este link expira em <strong>1 hora</strong> por motivos de segurança.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
            Se você não solicitou esta alteração, ignore este e-mail. Sua conta permanece segura.<br>
            Syscorrect - Gestão de Multibenefícios
        </p>
    </div>
    `;
}