import { OnboardingPixPrismaRepository } from "../../repositories/implementations/onboarding-pix-prisma.repository";
import { SicrediPixProvider } from "../../../../../infra/providers/PixProvider/implementations/sicredi/sicredi-pix.provider";
import { GenerateOnboardingPixUseCase } from "./generate-onboarding-pix.usecase";
import { GenerateOnboardingPixController } from "./generate-onboarding-pix.controller";

const onboardingPixRepository = new OnboardingPixPrismaRepository();
const sicrediPixProvider = new SicrediPixProvider();
const generateOnboardingPixUseCase = new GenerateOnboardingPixUseCase(onboardingPixRepository, sicrediPixProvider);
const generateOnboardingPixController = new GenerateOnboardingPixController(generateOnboardingPixUseCase);

export { generateOnboardingPixController };
