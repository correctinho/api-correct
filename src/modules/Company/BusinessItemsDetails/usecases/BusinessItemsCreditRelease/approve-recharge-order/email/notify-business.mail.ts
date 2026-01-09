export function getApprovedRechargeEmailTemplate(
    fantasyName: string,
    amountFormatted: string,
    count: number,
    orderDate: Date
): string {
    const dateFormatted = new Intl.DateTimeFormat('pt-BR').format(orderDate);

    return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; background-color: #ffffff;">
        <div style="background-color: #0056b3; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 500; letter-spacing: 0.5px;">CONFIRMAÇÃO DE RECARGA</h2>
        </div>
        
        <div style="padding: 30px;">
            <p style="font-size: 16px; margin-top: 0;">Prezados, <strong>${fantasyName}</strong>.</p>
            
            <p style="color: #555; line-height: 1.6;">
                Informamos que o processamento do pedido de recarga realizado em ${dateFormatted} foi <strong>concluído com sucesso</strong>.
            </p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #0056b3; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 15px 0; font-size: 13px; text-transform: uppercase; color: #888; letter-spacing: 1px;">Resumo da Operação</p>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 5px 0; color: #555; font-size: 14px;">Valor Total Processado:</td>
                        <td style="padding: 5px 0; color: #333; font-weight: bold; text-align: right; font-size: 15px;">${amountFormatted}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; color: #555; font-size: 14px;">Total de Colaboradores:</td>
                        <td style="padding: 5px 0; color: #333; font-weight: bold; text-align: right;">${count}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; color: #555; font-size: 14px;">Status da Transação:</td>
                        <td style="padding: 5px 0; color: #15803d; font-weight: bold; text-align: right;">Aprovado</td>
                    </tr>
                </table>
            </div>

            <p style="color: #555; line-height: 1.6;">
                Os créditos foram distribuídos conforme as regras parametrizadas e já se encontram disponíveis para utilização nas contas dos colaboradores.
            </p>
            
            <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                <p style="font-size: 11px; color: #999; text-align: center; line-height: 1.4;">
                    <strong>SysCorrect - Gestão de Multibenefícios</strong><br>
                    Esta é uma notificação automática do sistema. Não é necessário responder a este e-mail.<br>
                    Protocolo de processamento gerado em: ${dateFormatted}
                </p>
            </div>
        </div>
    </div>
    `;
}