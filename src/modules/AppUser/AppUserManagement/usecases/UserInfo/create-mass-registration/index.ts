import { AxiosSlackProvider } from "../../../../../../infra/providers/SlackProvider";
import { CreateMassRegistrationController } from "./create-mass-registration.controller";

const slackProvider = new AxiosSlackProvider();
const createMassRegistrationController = new CreateMassRegistrationController(slackProvider);

export { createMassRegistrationController };
