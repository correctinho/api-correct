// src/infra/providers/storage/implementations/fake/fake.storage.ts

import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { IStorage, StorageUploadData, UploadResponse } from '../../storage';
import { MulterFile } from '../../../../shared/multer/multer-memory.config'; 

export class FakeStorage implements IStorage {
    private baseTempDir: string;
    private uploadedFileRecords: { 
        filename: string; 
        filepath: string; 
        simulatedUrl: string; 
        simulatedPath: string;
        originalFileDTO: MulterFile; 
    }[] = [];

    constructor(tempDirName: string = 'test-uploads-fake') {
        this.baseTempDir = path.join(process.cwd(), tempDirName);
        if (!fs.existsSync(this.baseTempDir)) {
            fs.mkdirSync(this.baseTempDir, { recursive: true });
        }
    }

    async upload(file: MulterFile, folder: string): Promise<UploadResponse> {
        try {
            const fileExtension = file.originalname.split('.').pop() || 'bin';

            const uniqueFilename = `${uuidv4()}.${fileExtension}`; 
            
            const targetFolder = path.join(this.baseTempDir, folder);
            if (!fs.existsSync(targetFolder)) {
                fs.mkdirSync(targetFolder, { recursive: true });
            }

            const filepath = path.join(targetFolder, uniqueFilename);
            fs.writeFileSync(filepath, file.buffer as Uint8Array); // Opção 1: Type assertion para Uint8Array

            const simulatedUrl = `http://localhost:9000/fake-bucket/${folder}/${uniqueFilename}`;
            const simulatedPath = `${folder}/${uniqueFilename}`;

            const data: StorageUploadData = {
                url: simulatedUrl,
                path: simulatedPath
            };

            this.uploadedFileRecords.push({
                filename: uniqueFilename,
                filepath,
                simulatedUrl,
                simulatedPath,
                originalFileDTO: file
            });

            return { data, error: null };

        } catch (error: any) {
            console.error("[FakeStorage] Falha no upload:", error);
            return { data: null, error: new Error(`FakeStorage upload failed: ${error.message}`) };
        }
    }

    async delete(filePath: string): Promise<void> {
        const recordIndex = this.uploadedFileRecords.findIndex(record => record.simulatedPath === filePath);
        
        if (recordIndex !== -1) {
            const record = this.uploadedFileRecords[recordIndex];
            if (fs.existsSync(record.filepath)) {
                fs.rmSync(record.filepath, { force: true });
                console.log(`[FakeStorage] Arquivo ${record.filepath} deletado.`);
            }
            this.uploadedFileRecords.splice(recordIndex, 1);
        } else {
            console.warn(`[FakeStorage] Tentativa de deletar arquivo não registrado ou inexistente: ${filePath}`);
        }
    }

    cleanAll() {
        if (fs.existsSync(this.baseTempDir)) {
            fs.rmSync(this.baseTempDir, { recursive: true, force: true });
            console.log(`[FakeStorage] Diretório temporário ${this.baseTempDir} e seus conteúdos removidos.`);
        }
        this.uploadedFileRecords = [];
    }

    getUploadedFileRecords() {
        return this.uploadedFileRecords;
    }
}