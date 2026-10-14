import { UserDocumentValidationStatus } from '@prisma/client';
import { CreateDocumentsValidationUsecase } from '../create-documents-validation.usecase';
import { InputCreateDocumentValidationDTO } from '../dto/create-user-validation.dto';
import { Uuid } from '../../../../../../../@shared/ValueObjects/uuid.vo';
import { FakeStorage } from '../../../../../../../infra/providers/storage/implementations/fake/fake.storage';
import { FakeDocumentValidatorProvider } from '../../../../../../../infra/providers/document-validator/implementations/fake/fake-document-validator.provider';
import { MulterFile } from '../../../../../../../infra/shared/multer/multer-memory.config';

const makeFakeFile = (fieldname: string, filename: string): MulterFile => ({
    fieldname,
    originalname: filename,
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake-image-bytes'),
    size: 16,
});

const DocumentValidationMockRepository = () => ({
    create: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    saveOrUpdate: jest.fn(),
});

const UserInfoMockRepository = () => ({
    create: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    saveOrUpdate: jest.fn(),
    findByDocumentUserInfo: jest.fn(),
    save: jest.fn(),
    findByDocument2UserInfo: jest.fn(),
    findManyByBusiness: jest.fn(),
});

const AppUserAuthMockRepository = () => ({
    create: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    findByDocument: jest.fn(),
    findByEmail: jest.fn(),
});

describe('Unit tests: CreateDocumentsValidationUsecase with Auto-Validation', () => {
    it('Should throw error if no files are sent', async () => {
        const userAuthRepository = AppUserAuthMockRepository();
        const userInfoRepository = UserInfoMockRepository();
        const documentValidationRepository = DocumentValidationMockRepository();
        const fakeStorage = new FakeStorage();
        const fakeValidator = new FakeDocumentValidatorProvider();

        const usecase = new CreateDocumentsValidationUsecase(
            userAuthRepository,
            userInfoRepository,
            documentValidationRepository,
            fakeStorage,
            fakeValidator,
        );

        const input: InputCreateDocumentValidationDTO = {
            user_uuid: new Uuid('8ecfc6ca-b943-4c50-afd2-f86c32542b8c'),
        };

        await expect(usecase.execute(input)).rejects.toThrow('No documents to be registered. At least one file is required.');
    });

    it('Should throw error if user info is not found', async () => {
        const userAuthRepository = AppUserAuthMockRepository();
        const userInfoRepository = UserInfoMockRepository();
        const documentValidationRepository = DocumentValidationMockRepository();
        const fakeStorage = new FakeStorage();
        const fakeValidator = new FakeDocumentValidatorProvider();

        userInfoRepository.find.mockResolvedValueOnce(null);

        const usecase = new CreateDocumentsValidationUsecase(
            userAuthRepository,
            userInfoRepository,
            documentValidationRepository,
            fakeStorage,
            fakeValidator,
        );

        const input: InputCreateDocumentValidationDTO = {
            user_uuid: new Uuid('8ecfc6ca-b943-4c50-afd2-f86c32542b8c'),
            selfie: makeFakeFile('selfie', 'selfie.jpg'),
        };

        await expect(usecase.execute(input)).rejects.toThrow('User info not found');
    });

    it('Should upload files and automatically APPROVE when face match >= 85% and CPF matches', async () => {
        const userAuthRepository = AppUserAuthMockRepository();
        const userInfoRepository = UserInfoMockRepository();
        const documentValidationRepository = DocumentValidationMockRepository();
        const fakeStorage = new FakeStorage();
        const fakeValidator = new FakeDocumentValidatorProvider();

        fakeValidator.similarityToReturn = 96;
        fakeValidator.extractedCpfToReturn = '12345678900';

        const userId = new Uuid('8ecfc6ca-b943-4c50-afd2-f86c32542b8c');
        userInfoRepository.find.mockResolvedValueOnce({
            uuid: userId,
            document: '12345678900',
            full_name: 'JOAO SILVA',
            user_document_validation_uuid: null,
        });

        const usecase = new CreateDocumentsValidationUsecase(
            userAuthRepository,
            userInfoRepository,
            documentValidationRepository,
            fakeStorage,
            fakeValidator,
        );

        const input: InputCreateDocumentValidationDTO = {
            user_uuid: userId,
            selfie: makeFakeFile('selfie', 'selfie.jpg'),
            document_front: makeFakeFile('document_front', 'cnh_front.jpg'),
            document_back: makeFakeFile('document_back', 'cnh_back.jpg'),
        };

        const result = await usecase.execute(input);

        expect(result.selfie_status).toBe(UserDocumentValidationStatus.approved);
        expect(result.document_front_status).toBe(UserDocumentValidationStatus.approved);
        expect(result.document_back_status).toBe(UserDocumentValidationStatus.approved);
        expect(result.auto_validation_status).toBe('approved');
        expect(result.facial_similarity).toBe(96);
        expect(documentValidationRepository.saveOrUpdate).toHaveBeenCalledTimes(1);
    });

    it('Should DENY validation when facial similarity is very low (different face)', async () => {
        const userAuthRepository = AppUserAuthMockRepository();
        const userInfoRepository = UserInfoMockRepository();
        const documentValidationRepository = DocumentValidationMockRepository();
        const fakeStorage = new FakeStorage();
        const fakeValidator = new FakeDocumentValidatorProvider();

        fakeValidator.similarityToReturn = 30; // Diferença facial severa
        fakeValidator.extractedCpfToReturn = '12345678900';

        const userId = new Uuid('8ecfc6ca-b943-4c50-afd2-f86c32542b8c');
        userInfoRepository.find.mockResolvedValueOnce({
            uuid: userId,
            document: '12345678900',
            full_name: 'JOAO SILVA',
            user_document_validation_uuid: null,
        });

        const usecase = new CreateDocumentsValidationUsecase(
            userAuthRepository,
            userInfoRepository,
            documentValidationRepository,
            fakeStorage,
            fakeValidator,
        );

        const input: InputCreateDocumentValidationDTO = {
            user_uuid: userId,
            selfie: makeFakeFile('selfie', 'selfie.jpg'),
            document_front: makeFakeFile('document_front', 'rg_front.jpg'),
        };

        const result = await usecase.execute(input);

        expect(result.selfie_status).toBe(UserDocumentValidationStatus.denied);
        expect(result.document_front_status).toBe(UserDocumentValidationStatus.denied);
        expect(result.auto_validation_status).toBe('denied');
        expect(result.facial_similarity).toBe(30);
    });

    it('Should route to UNDER_ANALYSIS if only one of (selfie, document_front) is provided', async () => {
        const userAuthRepository = AppUserAuthMockRepository();
        const userInfoRepository = UserInfoMockRepository();
        const documentValidationRepository = DocumentValidationMockRepository();
        const fakeStorage = new FakeStorage();
        const fakeValidator = new FakeDocumentValidatorProvider();

        const userId = new Uuid('8ecfc6ca-b943-4c50-afd2-f86c32542b8c');
        userInfoRepository.find.mockResolvedValueOnce({
            uuid: userId,
            document: '12345678900',
            full_name: 'JOAO SILVA',
            user_document_validation_uuid: null,
        });

        const usecase = new CreateDocumentsValidationUsecase(
            userAuthRepository,
            userInfoRepository,
            documentValidationRepository,
            fakeStorage,
            fakeValidator,
        );

        const input: InputCreateDocumentValidationDTO = {
            user_uuid: userId,
            document_front: makeFakeFile('document_front', 'rg_front.jpg'),
        };

        const result = await usecase.execute(input);

        expect(result.document_front_status).toBe(UserDocumentValidationStatus.under_analysis);
        expect(result.selfie_status).toBe(UserDocumentValidationStatus.pending_to_send);
        expect(result.auto_validation_status).toBeUndefined();
    });
});
