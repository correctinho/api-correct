import { Buffer } from 'node:buffer';
import {
  IDocumentValidatorProvider,
  DocumentOcrResult,
  FaceMatchResult,
  ValidateDocumentInput,
  ValidateDocumentDecision,
} from '../../document-validator.provider';

export class FakeDocumentValidatorProvider implements IDocumentValidatorProvider {
  public similarityToReturn: number = 95;
  public extractedCpfToReturn?: string;
  public extractedNameToReturn?: string;
  public shouldFailOcr: boolean = false;
  public shouldFailFaceMatch: boolean = false;

  async extractDocumentData(documentBuffer: Buffer): Promise<DocumentOcrResult> {
    if (this.shouldFailOcr) {
      return {
        rawText: '',
        lines: [],
        cpf: null,
        fullName: null,
        birthDate: null,
      };
    }

    return {
      rawText: 'DOCUMENTO FAKE 12345678900 NOME TESTE',
      lines: ['DOCUMENTO FAKE', '12345678900', 'NOME TESTE'],
      cpf: this.extractedCpfToReturn ?? '12345678900',
      fullName: this.extractedNameToReturn ?? 'NOME TESTE',
      birthDate: '01/01/1990',
    };
  }

  async compareFaces(selfieBuffer: Buffer, documentBuffer: Buffer): Promise<FaceMatchResult> {
    if (this.shouldFailFaceMatch) {
      return {
        isMatch: false,
        similarity: 10,
        errorMessage: 'Face not matched in fake provider',
      };
    }

    return {
      isMatch: this.similarityToReturn >= 85,
      similarity: this.similarityToReturn,
    };
  }

  async validate(input: ValidateDocumentInput): Promise<ValidateDocumentDecision> {
    const ocrData = await this.extractDocumentData(input.documentBuffer);
    const faceMatch = await this.compareFaces(input.selfieBuffer, input.documentBuffer);

    const reasons: string[] = [];

    const normalizedExpectedCpf = input.expectedCpf.replace(/\D/g, '');
    const normalizedExtractedCpf = (ocrData.cpf ?? this.extractedCpfToReturn ?? normalizedExpectedCpf).replace(/\D/g, '');

    const cpfMatches = normalizedExpectedCpf === normalizedExtractedCpf;
    if (!cpfMatches) {
      reasons.push('CPF divergente do documento');
    }

    if (faceMatch.similarity < 85) {
      reasons.push(`Similaridade facial insuficiente (${faceMatch.similarity}%)`);
    }

    let status: 'approved' | 'under_analysis' | 'denied' = 'approved';
    if (faceMatch.similarity < 50 || (!cpfMatches && ocrData.cpf)) {
      status = 'denied';
    } else if (faceMatch.similarity < 85 || !cpfMatches || this.shouldFailOcr) {
      status = 'under_analysis';
    }

    return {
      status,
      facialSimilarity: faceMatch.similarity,
      ocrData: {
        ...ocrData,
        cpf: normalizedExtractedCpf,
        fullName: ocrData.fullName ?? input.expectedFullName,
      },
      faceMatch,
      reasons,
    };
  }
}
