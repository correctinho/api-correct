import multer from "multer";

export default {
    upload() {
        return {
            storage: multer.memoryStorage(),
            fileFilter: (req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
                // Define os tipos de arquivo permitidos
                const allowedMimes = [
                    'text/csv', // Para arquivos CSV
                    'application/vnd.ms-excel.sheet.macroEnabled.12' // Para arquivos XLSM
                ];

                if (allowedMimes.includes(file.mimetype)) {
                    callback(null, true);
                } else {
                    callback(new Error('Tipo de arquivo inválido. Apenas CSV e XLSM são permitidos.'), false);
                }
            }
        };
    }
};
