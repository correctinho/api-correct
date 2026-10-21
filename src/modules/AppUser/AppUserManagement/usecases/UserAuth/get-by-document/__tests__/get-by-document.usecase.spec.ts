import { UserDocumentValidationStatus } from '@prisma/client';
import { GetByDocumentUsecase } from '../get-by-document.usecase';

const AppUserAuthMockRepository = () => ({
  create: jest.fn(),
  update: jest.fn(),
  find: jest.fn(),
  findAll: jest.fn(),
  findByDocument: jest.fn(),
  findByEmail: jest.fn(),
  updateStatus: jest.fn(),
});

const AppUserInfoMockRepository = () => ({
  create: jest.fn(),
  update: jest.fn(),
  find: jest.fn(),
  findAll: jest.fn(),
  findByDocumentUserInfo: jest.fn(),
  findByEmailUserInfo: jest.fn(),
});

const AppUserValidationMockRepository = () => ({
  create: jest.fn(),
  update: jest.fn(),
  find: jest.fn(),
  findAll: jest.fn(),
  findStatuses: jest.fn(),
  activateUserIfAllApproved: jest.fn(),
});

describe('Unit tests: GetByDocumentUsecase', () => {
  const validCPF = '40353978060';

  it('should return status: false when UserAuth is not found and UserInfo is not found', async () => {
    const authRepo = AppUserAuthMockRepository();
    const infoRepo = AppUserInfoMockRepository();
    const valRepo = AppUserValidationMockRepository();

    authRepo.findByDocument.mockResolvedValue(null);
    infoRepo.findByDocumentUserInfo.mockResolvedValue(null);

    const usecase = new GetByDocumentUsecase(authRepo as any, infoRepo as any, valRepo as any);
    const result = await usecase.execute(validCPF);

    expect(result.status).toBe(false);
    expect(result.UserAuth).toBe(false);
    expect(result.UserInfo).toBe(false);
    expect(result.Address).toBe(false);
    expect(result.UserValidation.document_front_status).toBe(UserDocumentValidationStatus.pending_to_send);
  });

  it('should return status: false when user has registered (Auth + Info + Address) but has NOT submitted documents yet', async () => {
    const authRepo = AppUserAuthMockRepository();
    const infoRepo = AppUserInfoMockRepository();
    const valRepo = AppUserValidationMockRepository();

    authRepo.findByDocument.mockResolvedValue({
      uuid: 'auth-123',
      user_info_uuid: 'info-123',
      document: validCPF,
    });

    infoRepo.find.mockResolvedValue({
      uuid: 'info-123',
      address_uuid: 'addr-123',
      user_document_validation_uuid: null, // Sem documentos enviados ainda
    });

    const usecase = new GetByDocumentUsecase(authRepo as any, infoRepo as any, valRepo as any);
    const result = await usecase.execute(validCPF);

    expect(result.status).toBe(false); // EXIGÊNCIA: Bloqueia acesso à Home até validar
    expect(result.UserAuth).toBe(true);
    expect(result.UserInfo).toBe(true);
    expect(result.Address).toBe(true);
    expect(result.UserValidation.document_front_status).toBe(UserDocumentValidationStatus.pending_to_send);
    expect(result.UserValidation.selfie_status).toBe(UserDocumentValidationStatus.pending_to_send);
  });

  it('should return status: false when documents were submitted and are under_analysis', async () => {
    const authRepo = AppUserAuthMockRepository();
    const infoRepo = AppUserInfoMockRepository();
    const valRepo = AppUserValidationMockRepository();

    authRepo.findByDocument.mockResolvedValue({
      uuid: 'auth-123',
      user_info_uuid: 'info-123',
      document: validCPF,
    });

    infoRepo.find.mockResolvedValue({
      uuid: 'info-123',
      address_uuid: 'addr-123',
      user_document_validation_uuid: 'val-123',
    });

    valRepo.findStatuses.mockResolvedValue({
      document_front_status: UserDocumentValidationStatus.under_analysis,
      document_back_status: UserDocumentValidationStatus.pending_to_send,
      selfie_status: UserDocumentValidationStatus.under_analysis,
      document_selfie_status: UserDocumentValidationStatus.pending_to_send,
    });

    const usecase = new GetByDocumentUsecase(authRepo as any, infoRepo as any, valRepo as any);
    const result = await usecase.execute(validCPF);

    expect(result.status).toBe(false);
    expect(result.UserAuth).toBe(true);
    expect(result.UserInfo).toBe(true);
    expect(result.Address).toBe(true);
    expect(result.UserValidation.document_front_status).toBe(UserDocumentValidationStatus.under_analysis);
    expect(result.UserValidation.selfie_status).toBe(UserDocumentValidationStatus.under_analysis);
  });

  it('should return status: true when both document_front and selfie are APPROVED', async () => {
    const authRepo = AppUserAuthMockRepository();
    const infoRepo = AppUserInfoMockRepository();
    const valRepo = AppUserValidationMockRepository();

    authRepo.findByDocument.mockResolvedValue({
      uuid: 'auth-123',
      user_info_uuid: 'info-123',
      document: validCPF,
    });

    infoRepo.find.mockResolvedValue({
      uuid: 'info-123',
      address_uuid: 'addr-123',
      user_document_validation_uuid: 'val-123',
    });

    valRepo.findStatuses.mockResolvedValue({
      document_front_status: UserDocumentValidationStatus.approved,
      document_back_status: UserDocumentValidationStatus.pending_to_send, // Verso opcional
      selfie_status: UserDocumentValidationStatus.approved,
      document_selfie_status: UserDocumentValidationStatus.pending_to_send, // Selfie segurando doc dispensada
    });

    const usecase = new GetByDocumentUsecase(authRepo as any, infoRepo as any, valRepo as any);
    const result = await usecase.execute(validCPF);

    expect(result.status).toBe(true); // LIBERADO: Acesso total à Home
    expect(result.UserAuth).toBe(true);
    expect(result.UserInfo).toBe(true);
    expect(result.Address).toBe(true);
    expect(result.UserValidation.document_front_status).toBe(UserDocumentValidationStatus.approved);
    expect(result.UserValidation.selfie_status).toBe(UserDocumentValidationStatus.approved);
  });
});
