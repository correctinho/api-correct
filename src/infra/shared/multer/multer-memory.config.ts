import multer, { FileFilterCallback, Options } from "multer";
import { Request } from "express";
import { CustomError } from "../../../errors/custom.error";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: MulterFile, cb: FileFilterCallback) => {


  // Aceitar apenas arquivos de imagem JPEG e PNG
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true); // Aceitar o arquivo
  } else {
    cb(new CustomError('Formato de arquivo não suportado. Apenas JPEG e PNG são permitidos.', 400) as any, false); // Rejeitar o arquivo
  }
};

const uploadImage = multer({ storage, fileFilter });

export { uploadImage };
