import { ITicketsRepository, ListTicketsFilter } from "../../repositories/ITicketsRepository";
import { Ticket } from "@prisma/client";

export class ListTicketsUseCase {
    constructor(private ticketsRepository: ITicketsRepository) {}

    async execute(filters: ListTicketsFilter): Promise<Ticket[]> {
        return this.ticketsRepository.findMany(filters);
    }
}
