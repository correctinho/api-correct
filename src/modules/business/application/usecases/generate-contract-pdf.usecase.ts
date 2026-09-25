import { CustomError } from "../../../../errors/custom.error";
import { prismaClient } from "../../../../infra/databases/prisma.config";
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { GenerateBusinessContractUsecase } from "../../../Terms/usecase/generate-business-contract/generate-business-contract.usecase";
import { BusinessContractPrismaRepository } from "../../../Terms/repositories/implementations/prisma-business-contract.repository";

export class GenerateContractPdfUsecase {
    async execute(business_info_uuid: string): Promise<Buffer> {
        // 1. Check if contract exists
        const repository = new BusinessContractPrismaRepository();
        let contract = await repository.findByBusinessId(business_info_uuid);

        // 2. If it doesn't exist, we must generate it first
        if (!contract) {
            const generateUsecase = new GenerateBusinessContractUsecase(repository);
            await generateUsecase.execute({ business_info_uuid });
            
            // fetch again
            contract = await repository.findByBusinessId(business_info_uuid);

            if (!contract) {
                throw new CustomError("Erro ao gerar o contrato para PDF", 500);
            }
        }

        // 3. Generate PDF using Puppeteer
        let browser;
        try {
            browser = await puppeteer.launch({
                args: chromium.args as any,
                defaultViewport: (chromium as any).defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: (chromium as any).headless,
                ignoreHTTPSErrors: true,
            } as any);

            const page = await browser.newPage();
            
            // Set content and wait for it to load
            await page.setContent(contract.rendered_html, { waitUntil: 'networkidle0' });
            
            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
            });

            return Buffer.from(pdfBuffer);
        } catch (error: any) {
            console.error('Puppeteer Error:', error);
            throw new CustomError("Erro ao gerar PDF do contrato: " + error.message, 500);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}
