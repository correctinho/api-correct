/*
  ARQUIVO: generate-receipt-pdf.usecase.ts
  -----------------------------------------
  Este use case orquestra a geração do PDF.
  AJUSTADO PARA FUNCIONAR NA VERCEL.
*/
import { GetTransactionReceiptUsecase } from '../get-transaction-receipt.usecase';
import puppeteer from 'puppeteer-core';
import { ITransactionOrderRepository } from '../../../repositories/transaction-order.repository';
import { ICompanyDataRepository } from '../../../../../Company/CompanyData/repositories/company-data.repository';
import { IAppUserItemRepository } from '../../../../../AppUser/AppUserManagement/repositories/app-user-item-repository';
import { IAppUserInfoRepository } from '../../../../../AppUser/AppUserManagement/repositories/app-user-info.repository';
import QRCode from 'qrcode'; // Importa a biblioteca para gerar QR Code

// Usando 'require' conforme seu código, para compatibilidade com o ambiente
const chromium = require('@sparticuz/chromium');


export class GenerateReceiptPdfUsecase {
    private getTransactionReceiptUsecase: GetTransactionReceiptUsecase;

    constructor(
        private transactionOrderRepository: ITransactionOrderRepository,
        private businessInfoRepository: ICompanyDataRepository,
        private appUserItemRepository: IAppUserItemRepository,
        private appUserInfoRepository: IAppUserInfoRepository
    ) {
        this.getTransactionReceiptUsecase = new GetTransactionReceiptUsecase(
            this.transactionOrderRepository,
            this.businessInfoRepository,
            this.appUserItemRepository,
            this.appUserInfoRepository
        );
    }

    async execute(transactionId: string): Promise<Buffer> {
        const receiptData = await this.getTransactionReceiptUsecase.execute(transactionId);

        // --- LÓGICA DO QR CODE ---
        // 1. Pega a URL base do ambiente.
        const baseUrl = process.env.RECEIPT_VALIDATION_URL;
        if (!baseUrl) {
            // É uma boa prática falhar se a configuração essencial estiver faltando.
            throw new Error('A variável de ambiente RECEIPT_VALIDATION_URL não está definida.');
        }
        // 2. Monta a URL completa de validação.
        const validationUrl = `${baseUrl}?id=${receiptData.transactionId}`;
        // 3. Gera o QR Code como uma imagem em formato Data URL.
        const qrCodeDataUrl = await QRCode.toDataURL(validationUrl);
        // --- FIM DA LÓGICA DO QR CODE ---

        // Passa a URL do QR Code para o gerador de HTML
        const htmlContent = this.createReceiptHtml(receiptData, qrCodeDataUrl);

        let browser = null;
        try {
            console.log('Configurando o Chromium para ambiente serverless/linux...');

            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            });

            console.log('Browser Puppeteer iniciado com sucesso.');

            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            const pdfUint8Array = await page.pdf({ format: 'A4', printBackground: true });
            const pdfBuffer = Buffer.from(pdfUint8Array);

            return pdfBuffer;
        } catch (error: any) {
            console.error('Falha crítica ao iniciar o Puppeteer ou gerar o PDF:', error);
            throw new Error(`Falha ao gerar o PDF. Erro original: ${error.message}`);
        } finally {
            if (browser !== null) {
                console.log('Fechando o browser...');
                await browser.close();
            }
        }
    }

    /**
     * Cria o template HTML para o comprovante com base nos dados.
     */
    private createReceiptHtml(data: any, qrCodeDataUrl: string): string {
    const formatCurrency = (amountInCents: number) => {
      return (amountInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Comprovante de Transação</title>
          <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 0; }
              .container { max-width: 800px; margin: 40px auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
              .header { text-align: center; border-bottom: 2px solid #f2f2f2; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { margin: 0; font-size: 28px; color: #000; }
              .header p { margin: 5px 0 0; color: #777; }
              .section { margin-bottom: 30px; }
              .section-title { font-size: 18px; font-weight: bold; color: #000; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; }
              .details-grid { display: grid; grid-template-columns: 150px 1fr; gap: 8px 20px; }
              .details-grid dt { font-weight: bold; color: #555; }
              .details-grid dd { margin: 0; }
              .total-amount { text-align: right; font-size: 24px; font-weight: bold; margin-top: 30px; }
              .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
              .qr-code { margin-bottom: 15px; }
          </style>
      </head>
      <body>
          <div class="container">
              <!-- O conteúdo do comprovante permanece o mesmo -->
              <div class="header">
                  <h1>Comprovante de Pagamento</h1>
                  <p>ID da Transação: ${data.transactionId}</p>
              </div>

              <div class="section">
                  <dl class="details-grid">
                      <dt>Data e Hora:</dt>
                      <dd>${data.dateTime}</dd>
                      <dt>Status:</dt>
                      <dd style="color: green; font-weight: bold;">${data.status === 'success' ? 'Aprovada' : data.status}</dd>
                  </dl>
              </div>

              <div class="section">
                  <div class="section-title">Pagador</div>
                  <dl class="details-grid">
                      <dt>Nome:</dt>
                      <dd>${data.payer.name}</dd>
                      <dt>Documento:</dt>
                      <dd>${data.payer.document}</dd>
                  </dl>
              </div>

              <div class="section">
                  <div class="section-title">Recebedor</div>
                  <dl class="details-grid">
                      <dt>Nome:</dt>
                      <dd>${data.payee.name}</dd>
                      <dt>Documento:</dt>
                      <dd>${data.payee.document}</dd>
                      ${data.payee.email ? `<dt>Email:</dt><dd>${data.payee.email}</dd>` : ''}
                      ${data.payee.phone ? `<dt>Telefone:</dt><dd>${data.payee.phone}</dd>` : ''}
                  </dl>
              </div>

              <div class="total-amount">
                  Valor Total: ${formatCurrency(data.amountInCents)}
              </div>

              <!-- Seção do Footer atualizada para incluir o QR Code -->
              <div class="footer">
                  <div class="qr-code">
                      <img src="${qrCodeDataUrl}" alt="QR Code de Validação" style="width: 120px; height: 120px;">
                      <p style="margin: 5px 0 0; font-size: 11px;">Aponte a câmera para validar</p>
                  </div>
                  <p>Este é um comprovante gerado automaticamente. Para verificar a autenticidade, acesse nossa plataforma.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }
}
