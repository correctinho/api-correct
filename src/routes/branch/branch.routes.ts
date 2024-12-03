import { Router } from 'express';
import { correctIsAuth } from '../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware';
import { getBranchByIDController } from '../../modules/branch/usecases/get-branch-by-id';
import { createBranchController } from '../../modules/branch/usecases/create-branch';
import { updateBranchController } from '../../modules/branch/usecases/update-branch';
import { getListsBranchController } from '../../modules/branch/usecases/get-list-branch';
import { getAvailableBranchesByAppUser } from '../../modules/branch/usecases/get-available-branches-by-app-user';

export const branchRouter = Router();

branchRouter.get(
    '/branch/:uuid',
    async (request, response) =>
        await getBranchByIDController.handle(request, response)
);

branchRouter.get(
    '/branch',
    async (request, response) =>
        await getListsBranchController.handle(request, response)
);

branchRouter.post(
    '/branch',
    correctIsAuth,
    async (request, response) =>
        await createBranchController.handle(request, response)
);

branchRouter.put(
    '/branch/:uuid',
    correctIsAuth,
    async (request, response) =>
        await updateBranchController.handle(request, response)
);

branchRouter.get(
  '/branches/available',
  async (request, response) => await getAvailableBranchesByAppUser.handle(request, response)
)
