import { Router } from 'express';
import { correctIsAuth } from '../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware';
import { getBenefitByIDController } from '../../modules/benefits/usecases/get-benefit-by-id';
import { createBenefitController } from '../../modules/benefits/usecases/create-benefit';
import { updateBenefitController } from '../../modules/benefits/usecases/update-benefit';
import { getListsBenefitController } from '../../modules/benefits/usecases/get-list-benefits';
import { createCustomBenefitController } from '../../modules/benefits/usecases/create-customized-benefit';

export const benefitsRouter = Router();

benefitsRouter.get(
    '/benefit/:uuid',
    async (request, response) =>
        await getBenefitByIDController.handle(request, response)
);

benefitsRouter.get(
    '/benefits',
    async (request, response) =>
        await getListsBenefitController.handle(request, response)
);

benefitsRouter.post(
    '/benefit',
    correctIsAuth,
    async (request, response) =>
        await createBenefitController.handle(request, response)
);

benefitsRouter.put(
    '/benefit/:uuid',
    correctIsAuth,
    async (request, response) =>
        await updateBenefitController.handle(request, response)
);

//create custom benefit for business
benefitsRouter.post(
  '/benefit/custom',
  correctIsAuth,
  async (request, response) =>
    await createCustomBenefitController.handle(request, response)
)
