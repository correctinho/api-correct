import { GetAddressFromCoordsController } from "./get-address-from-coords.controller";
import { GetAddressFromCoordsUseCase } from "./get-address-from-coords.usecase";

const getAddressFromCoordsUseCase = new GetAddressFromCoordsUseCase();
const getAddressFromCoordsController = new GetAddressFromCoordsController(getAddressFromCoordsUseCase);

export { getAddressFromCoordsController };
