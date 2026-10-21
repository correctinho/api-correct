import multer, { FileFilterCallback, Options } from "multer";
import { Request } from "express";
import { CustomError } from "../../../errors/custom.error";

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

const storage = multer.memoryStorage();

const imageFilter = (req: Request, file: MulterFile, cb: FileFilterCallback) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new CustomError('Formato de arquivo não suportado. Apenas JPEG e PNG são permitidos.', 400) as any, false);
  }
};

const documentFilter = (req: Request, file: MulterFile, cb: FileFilterCallback) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new CustomError('Formato de arquivo não suportado. Apenas JPEG, PNG e PDF são permitidos.', 400) as any, false);
  }
};

const uploadImage = multer({ storage, fileFilter: imageFilter });
const uploadDocument = multer({ storage, fileFilter: documentFilter });

export { uploadImage, uploadDocument };