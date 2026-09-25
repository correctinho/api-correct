import { Request, Response } from "express";
import { GenerateContractPdfUsecase } from "../../application/usecases/generate-contract-pdf.usecase";

export class GenerateContractPdfController {
    async handle(request: Request, response: Response): Promise<Response | void> {
        try {
            const { uuid } = request.params;
            if (!uuid) {
                return response.status(400).json({ error: 'UUID é obrigatório.' });
            }

            const usecase = new GenerateContractPdfUsecase();
            const pdfBuffer = await usecase.execute(uuid);

            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', `attachment; filename="contrato-${uuid}.pdf"`);
            return response.send(pdfBuffer);
        } catch (error: any) {
            console.error('GenerateContractPdfController Error:', error);
            if (error.statusCode) {
                return response.status(error.statusCode).json({ error: error.message });
            }
            return response.status(500).json({
                error: error.message || 'Unexpected error while generating PDF.',
            });
        }
    }
}
