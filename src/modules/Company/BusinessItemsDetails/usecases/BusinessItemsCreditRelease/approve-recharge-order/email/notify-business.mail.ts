export function getApprovedRechargeEmailTemplate(
    fantasyName: string,
    amountFormatted: string,
    count: number,
    orderDate: Date
): string {
    const dateFormatted = new Intl.DateTimeFormat('pt-BR').format(orderDate);

    return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #0056b3;">Pedido Aprovado! 🚀</h2>
        </div>
        
        <p>Olá, <strong>${fantasyName}</strong>.</p>
        
        <p>Temos ótimas notícias! Seu pedido de recarga realizado em ${dateFormatted} foi processado e aprovado com sucesso.</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>💰 Valor Total:</strong> <span style="color: #16a34a;">${amountFormatted}</span></p>
            <p style="margin: 5px 0;"><strong>👥 Colaboradores Beneficiados:</strong> ${count}</p>
            <p style="margin: 5px 0;"><strong>✅ Status:</strong> Pago e Creditado</p>
        </div>

        <p>Os créditos já estão disponíveis nas contas dos seus colaboradores.</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="font-size: 12px; color: #666; text-align: center;">
            Este é um e-mail automático da SysCorrect. Por favor, não responda.<br>
            Em caso de dúvidas, entre em contato com nosso suporte.
        </p>
    </div>
    `;
}