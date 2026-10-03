import { Router } from "express";
import { appUserIsAuth } from "../../infra/shared/middlewares/AppUser/app-user-auth.middleware";
import { listHomeProgramsController } from "../../modules/AppUser/AppUserManagement/usecases/BusinessClub/list-home-programs";
import { searchBusinessClubController } from "../../modules/AppUser/AppUserManagement/usecases/BusinessClub/search-business-club";
import { getProgramBranchesController } from "../../modules/AppUser/AppUserManagement/usecases/BusinessClub/get-program-branches";
import { getPartnerDetailsController } from "../../modules/AppUser/AppUserManagement/usecases/BusinessClub/get-partner-details";

const businessClubRouter = Router();

businessClubRouter.use(appUserIsAuth);

businessClubRouter.get('/app-user/business-club/home-programs', (req, res) => {
  return listHomeProgramsController.handle(req, res);
});

businessClubRouter.get('/app-user/business-club/search', (req, res) => {
  return searchBusinessClubController.handle(req, res);
});

businessClubRouter.get('/app-user/business-club/program/:uuid/branches', (req, res) => {
  return getProgramBranchesController.handle(req, res);
});

businessClubRouter.get('/app-user/business-club/partner/:uuid/details', (req, res) => {
  return getPartnerDetailsController.handle(req, res);
});

export { businessClubRouter };
