// src/infra/providers/storage/implementations/fake/fake.storage.ts

import path from 'path';
import fs from 'fs';
import os from 'os'; // Importe o módulo 'os'
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

    // Adicione uma flag para saber se estamos em um ambiente de produção (Vercel)
    private isProduction: boolean;

    constructor(tempDirName: string = 'test-uploads-fake') {
        this.isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

        if (this.isProduction) {
            this.baseTempDir = '/fake-production-uploads'; 
            console.warn("[FakeStorage] Rodando em modo de simulação sem escrita em disco (Produção/Vercel).");
        } else {
            this.baseTempDir = path.join(os.tmpdir(), tempDirName); // USANDO os.tmpdir()
            if (!fs.existsSync(this.baseTempDir)) {
                fs.mkdirSync(this.baseTempDir, { recursive: true });
            }
            console.log(`[FakeStorage] Diretório de uploads fake local: ${this.baseTempDir}`);
        }
    }

    async upload(file: MulterFile, folder: string): Promise<UploadResponse> {
        try {
            const fileExtension = file.originalname.split('.').pop() || 'bin';
            const uniqueFilename = `${uuidv4()}.${fileExtension}`; 
            
            const simulatedUrl = `http://localhost:9000/fake-bucket/${folder}/${uniqueFilename}`;
            const simulatedPath = `${folder}/${uniqueFilename}`;

            let filepath = ''; // Inicializa filepath

            if (!this.isProduction) {
                // APENAS cria diretórios e escreve arquivos se NÃO estiver em produção
                const targetFolder = path.join(this.baseTempDir, folder);
                if (!fs.existsSync(targetFolder)) {
                    fs.mkdirSync(targetFolder, { recursive: true });
                }
                filepath = path.join(targetFolder, uniqueFilename);
                fs.writeFileSync(filepath, file.buffer as Uint8Array); // Escreve o arquivo
                console.log(`[FakeStorage] Arquivo salvo em disco: ${filepath}`);
            } else {
                console.log(`[FakeStorage] Simulação de upload (sem escrita em disco): ${simulatedPath}`);
                filepath = simulatedPath; 
            }

            const data: StorageUploadData = {
                url: simulatedUrl,
                path: simulatedPath
            };

            this.uploadedFileRecords.push({
                filename: uniqueFilename,
                filepath, // filepath real se não for produção, simulado se for
                simulatedUrl,
                simulatedPath,
                originalFileDTO: file
            });

            return { data, error: null };

        } catch (error: any) {
            console.error("[FakeStorage] Falha no upload:", error);
            if (this.isProduction) {
                return { data: null, error: new Error(`FakeStorage simulation failed (production mode): ${error.message}`) };
            }
            return { data: null, error: new Error(`FakeStorage upload failed: ${error.message}`) };
        }
    }

    async delete(filePath: string): Promise<void> {
        const recordIndex = this.uploadedFileRecords.findIndex(record => record.simulatedPath === filePath);
        
        if (recordIndex !== -1) {
            const record = this.uploadedFileRecords[recordIndex];
            if (!this.isProduction && fs.existsSync(record.filepath)) { // APENAS tenta deletar fisicamente se NÃO for produção
                fs.rmSync(record.filepath, { force: true });
                console.log(`[FakeStorage] Arquivo ${record.filepath} deletado fisicamente.`);
            } else if (this.isProduction) {
                 console.log(`[FakeStorage] Simulação de exclusão (sem interação com disco): ${filePath}`);
            }
            this.uploadedFileRecords.splice(recordIndex, 1);
        } else {
            console.warn(`[FakeStorage] Tentativa de deletar arquivo não registrado ou inexistente: ${filePath}`);
        }
    }

    async cleanAll() {
        if (!this.isProduction && fs.existsSync(this.baseTempDir)) { // APENAS limpa fisicamente se NÃO for produção
            fs.rmSync(this.baseTempDir, { recursive: true, force: true });
            console.log(`[FakeStorage] Diretório temporário ${this.baseTempDir} e seus conteúdos removidos.`);
        } else if (this.isProduction) {
            console.log(`[FakeStorage] Simulação de limpeza (sem interação com disco).`);
        }
        this.uploadedFileRecords = [];
    }

    getUploadedFileRecords() {
        return this.uploadedFileRecords;
    }
}