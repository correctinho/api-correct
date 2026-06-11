import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { ISubscriptionPlanRepository } from "../../repositories/subscription-plan.repository";
import { InputUpdateSubscriptionPlanDto } from "./dto/update-subscription-plan.dto";

export class UpdateSubscriptionPlanUseCase {
    constructor(private repository: ISubscriptionPlanRepository) {}

    async execute(input: InputUpdateSubscriptionPlanDto) {
        const plan = await this.repository.find(new Uuid(input.uuid));

        if (!plan) {
            throw new CustomError("Plano não encontrado", 404);
        }

        if (input.name !== undefined) {
            plan.changeName(input.name);
        }

        if (input.description !== undefined) {
            plan.changeDescription(input.description);
        }

        if (input.is_active !== undefined) {
            if (input.is_active && !plan.is_active) {
                plan.activate();
            } else if (!input.is_active && plan.is_active) {
                plan.deactivate();
            }
        }

        await this.repository.update(plan);

        return plan.toJSON();
    }
}
