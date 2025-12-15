export interface PixChargeEmailData {
    userName: string;
    amountFormatted: string;
    pixCopyPaste: string;
}

export const getPixChargeEmailTemplate = (data: PixChargeEmailData): string => {
    return `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #00C853; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0;">Depósito via PIX</h1>
            </div>
            <div style="padding: 30px;">
                <p>Olá, <strong>${data.userName}</strong>!</p>
                <p>Sua solicitação de depósito de <strong>${data.amountFormatted}</strong> foi gerada com sucesso.</p>
                <p>Para concluir, utilize o código "Copia e Cola" abaixo no aplicativo do seu banco:</p>
                
                <div style="background-color: #f4f4f4; padding: 15px; border-radius: 4px; word-break: break-all; margin: 25px 0;">
                    <code style="font-family: monospace; color: #555;">${data.pixCopyPaste}</code>
                </div>

                <p style="font-size: 14px; color: #777;">Este código expira em breve. Caso já tenha realizado o pagamento, desconsidere este e-mail.</p>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                <p>© ${new Date().getFullYear()} Correct. Todos os direitos reservados.</p>
                <p>Este é um e-mail automático, por favor não responda.</p>
            </div>
        </div>
    `;
};