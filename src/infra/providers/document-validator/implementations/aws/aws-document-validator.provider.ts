import { Buffer } from 'node:buffer';
import {
  RekognitionClient,
  CompareFacesCommand,
  type RekognitionClientConfig,
} from '@aws-sdk/client-rekognition';
import {
  TextractClient,
  DetectDocumentTextCommand,
  type TextractClientConfig,
} from '@aws-sdk/client-textract';
import { IDocumentValidatorProvider } from '../../document-validator.provider';
import type {
  DocumentOcrResult,
  FaceMatchResult,
  ValidateDocumentInput,
  ValidateDocumentDecision,
  DocumentValidationDecisionStatus,
} from '../../document-validator.provider';

export class AwsDocumentValidatorProvider implements IDocumentValidatorProvider {
  private rekognitionClient: RekognitionClient;
  private textractClient: TextractClient;
  private minSimilarity: number;

  constructor() {
    const accessKeyId =
      process.env.AWS_ACCESS_KEY_ID ||
      process.env.AWS_KEY ||
      process.env.AWS_SECRET ||
      '';
    const secretAccessKey =
      process.env.AWS_SECRET_ACCESS_KEY ||
      process.env.AWS_SECRET_KEY ||
      '';
    const region =
      process.env.AWS_REGION ||
      process.env.REGION ||
      'us-east-1';

    this.minSimilarity = Number(process.env.AWS_MIN_FACE_MATCH_SCORE) || 85;

    const rekognitionConfig: RekognitionClientConfig = { region };
    const textractConfig: TextractClientConfig = { region };

    if (accessKeyId && secretAccessKey) {
      rekognitionConfig.credentials = {
        accessKeyId,
        secretAccessKey,
      };
      textractConfig.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }

    this.rekognitionClient = new RekognitionClient(rekognitionConfig);
    this.textractClient = new TextractClient(textractConfig);
  }

  /**
   * Extrai dados textuais do documento usando AWS Textract
   */
  async extractDocumentData(documentBuffer: Buffer): Promise<DocumentOcrResult> {
    try {
      const command = new DetectDocumentTextCommand({
        Document: {
          Bytes: new Uint8Array(documentBuffer),
        },
      });

      const response = await this.textractClient.send(command);

      const lines = (response.Blocks || [])
        .filter((b) => b.BlockType === 'LINE' && typeof b.Text === 'string')
        .map((b) => b.Text!.trim());

      const rawText = lines.join('\n');

      const cpf = this.extractCpfFromText(rawText);
      const birthDate = this.extractBirthDateFromText(rawText);

      return {
        rawText,
        lines,
        cpf,
        birthDate,
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('[AwsDocumentValidatorProvider] Erro ao extrair texto com Textract:', err?.message || error);
      return {
        rawText: '',
        lines: [],
        cpf: null,
        birthDate: null,
      };
    }
  }

  /**
   * Compara o rosto da selfie com a foto do documento usando AWS Rekognition
   */
  async compareFaces(selfieBuffer: Buffer, documentBuffer: Buffer): Promise<FaceMatchResult> {
    try {
      const command = new CompareFacesCommand({
        SourceImage: {
          Bytes: new Uint8Array(selfieBuffer),
        },
        TargetImage: {
          Bytes: new Uint8Array(documentBuffer),
        },
        SimilarityThreshold: 50,
      });

      const response = await this.rekognitionClient.send(command);

      const matches = response.FaceMatches || [];
      if (matches.length > 0 && typeof matches[0]?.Similarity === 'number') {
        const similarity = matches[0].Similarity;
        return {
          isMatch: similarity >= this.minSimilarity,
          similarity: Math.round(similarity * 100) / 100,
        };
      }

      return {
        isMatch: false,
        similarity: 0,
        errorMessage: 'Nenhum rosto correspondente identificado no documento.',
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('[AwsDocumentValidatorProvider] Erro no Rekognition CompareFaces:', err?.message || error);
      return {
        isMatch: false,
        similarity: 0,
        errorMessage: err?.message || 'Falha na comparacao facial da AWS',
      };
    }
  }

  /**
   * Executa a esteira unificada de validacao
   */
  async validate(input: ValidateDocumentInput): Promise<ValidateDocumentDecision> {
    const reasons: string[] = [];

    const [ocrData, faceMatch] = await Promise.all([
      this.extractDocumentData(input.documentBuffer),
      this.compareFaces(input.selfieBuffer, input.documentBuffer),
    ]);

    const normalizedExpectedCpf = input.expectedCpf.replace(/\D/g, '');
    const cleanExtractedCpf = ocrData.cpf ? ocrData.cpf.replace(/\D/g, '') : null;

    let cpfMatch = false;
    if (cleanExtractedCpf) {
      cpfMatch = cleanExtractedCpf === normalizedExpectedCpf;
      if (!cpfMatch) {
        reasons.push(`CPF extraído (${cleanExtractedCpf}) difere do cadastrado (${normalizedExpectedCpf})`);
      }
    } else {
      reasons.push('Não foi possível identificar o CPF com clareza no documento');
    }

    const nameMatch = this.checkNameMatch(input.expectedFullName, ocrData.lines);
    if (!nameMatch) {
      reasons.push('Nome do usuário não localizado com certeza nas linhas do documento');
    }

    if (faceMatch.similarity < this.minSimilarity) {
      reasons.push(`Similaridade facial (${faceMatch.similarity}%) abaixo do mínimo (${this.minSimilarity}%)`);
    }

    let status: DocumentValidationDecisionStatus = 'under_analysis';

    const isHighFaceMatch = faceMatch.similarity >= this.minSimilarity;
    const isVeryLowFaceMatch = faceMatch.similarity < 50;

    if (isHighFaceMatch && (cpfMatch || nameMatch)) {
      status = 'approved';
    } else if (isVeryLowFaceMatch || (cleanExtractedCpf && !cpfMatch)) {
      status = 'denied';
    } else {
      status = 'under_analysis';
    }

    return {
      status,
      facialSimilarity: faceMatch.similarity,
      ocrData,
      faceMatch,
      reasons,
    };
  }

  private extractCpfFromText(text: string): string | null {
    const formattedMatch = text.match(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/);
    if (formattedMatch) return formattedMatch[0].replace(/\D/g, '');

    const rawDigits = text.match(/\b\d{11}\b/g) || [];
    for (const candidate of rawDigits) {
      if (this.isValidCpfChecksum(candidate)) {
        return candidate;
      }
    }

    const spacedMatch = text.match(/\b\d{3}\s?\d{3}\s?\d{3}\s?[-.]?\s?\d{2}\b/g) || [];
    for (const candidate of spacedMatch) {
      const clean = candidate.replace(/\D/g, '');
      if (clean.length === 11 && this.isValidCpfChecksum(clean)) {
        return clean;
      }
    }

    return null;
  }

  private extractBirthDateFromText(text: string): string | null {
    const match = text.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
    return match ? match[1] : null;
  }

  private checkNameMatch(expectedFullName: string, lines: string[]): boolean {
    if (!expectedFullName) return false;

    const normalize = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim();

    const normalizedExpected = normalize(expectedFullName);
    const expectedTokens = normalizedExpected.split(/\s+/).filter((t) => t.length > 2);

    if (expectedTokens.length === 0) return false;

    for (const line of lines) {
      const normalizedLine = normalize(line);
      let matchCount = 0;
      for (const token of expectedTokens) {
        if (normalizedLine.includes(token)) {
          matchCount++;
        }
      }

      if (matchCount / expectedTokens.length >= 0.7) {
        return true;
      }
    }

    return false;
  }

  private isValidCpfChecksum(cpf: string): boolean {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(clean.charAt(i), 10) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(clean.charAt(9), 10)) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(clean.charAt(i), 10) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(clean.charAt(10), 10)) return false;

    return true;
  }
}
