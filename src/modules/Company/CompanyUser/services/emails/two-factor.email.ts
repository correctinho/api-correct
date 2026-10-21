export function getTwoFactorEmailTemplate(userName: string, code: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a202c; max-width: 560px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="background-color: #0f172a; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">Syscorrect Segurança</h1>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Autenticação em Duas Etapas</p>
        </div>
        
        <div style="padding: 32px 28px;">
            <p style="margin: 0 0 16px 0; font-size: 15px;">Olá, <strong>${userName}</strong>.</p>
            <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569;">
                Recebemos uma solicitação de acesso à sua conta corporativa. Use o código de verificação abaixo para confirmar sua identidade:
            </p>
            
            <div style="background-color: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 700; letter-spacing: 10px; color: #0284c7; display: inline-block;">
                    ${code}
                </span>
            </div>
            
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 24px 0;">
                <p style="margin: 0; font-size: 13px; color: #92400e;">
                    ⏱️ Este código expira em <strong>10 minutos</strong> e pode ser utilizado apenas uma vez.
                </p>
            </div>
            
            <p style="margin: 24px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                <strong>Nunca compartilhe este código.</strong> Nenhum colaborador da Syscorrect solicitará seu código de acesso por telefone, WhatsApp ou e-mail.
            </p>
        </div>
        
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                Se você não tentou fazer login, altere sua senha imediatamente e contate o administrador.<br>
                © Syscorrect Tecnologia em Benefícios. Todos os direitos reservados.
            </p>
        </div>
    </div>
  `;
}
