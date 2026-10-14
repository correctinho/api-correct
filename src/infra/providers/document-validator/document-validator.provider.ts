import { Buffer } from 'node:buffer';
export interface DocumentOcrResult {
  rawText: string;
  cpf?: string | null;
  fullName?: string | null;
  birthDate?: string | null;
  lines: string[];
}

export interface FaceMatchResult {
  isMatch: boolean;
  similarity: number; // 0 a 100
  errorMessage?: string;
}

export interface ValidateDocumentInput {
  documentBuffer: Buffer;
  selfieBuffer: Buffer;
  expectedCpf: string;
  expectedFullName: string;
}

export type DocumentValidationDecisionStatus = 'approved' | 'under_analysis' | 'denied';

export interface ValidateDocumentDecision {
  status: DocumentValidationDecisionStatus;
  facialSimilarity: number;
  ocrData: DocumentOcrResult;
  faceMatch: FaceMatchResult;
  reasons: string[];
}

export abstract class IDocumentValidatorProvider {
  /**
   * Extrai dados textuais (OCR) do documento (CNH, RG, etc.)
   */
  abstract extractDocumentData(documentBuffer: Buffer): Promise<DocumentOcrResult>;

  /**
   * Compara o rosto da selfie com o rosto do documento (Face Match)
   */
  abstract compareFaces(selfieBuffer: Buffer, documentBuffer: Buffer): Promise<FaceMatchResult>;

  /**
   * Executa a validacao completa combinando OCR, conferencia de CPF/Nome e Face Match
   */
  abstract validate(input: ValidateDocumentInput): Promise<ValidateDocumentDecision>;
}
