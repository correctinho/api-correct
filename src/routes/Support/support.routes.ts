import { Router } from "express";
import { supportIsAuth } from "../../infra/shared/middlewares/Support/support-auth.middleware";
import { PrismaTicketsRepository } from "../../modules/Support/Tickets/repositories/implementations/prisma-tickets.repository";
import { AxiosSlackProvider } from "../../infra/providers/SlackProvider/implementations/axios-slack.provider";

import { CreateTicketUseCase } from "../../modules/Support/Tickets/useCases/create-ticket/create-ticket.usecase";
import { CreateTicketController } from "../../modules/Support/Tickets/useCases/create-ticket/create-ticket.controller";

import { ListTicketsUseCase } from "../../modules/Support/Tickets/useCases/list-tickets/list-tickets.usecase";
import { ListTicketsController } from "../../modules/Support/Tickets/useCases/list-tickets/list-tickets.controller";

import { GetTicketDetailsUseCase } from "../../modules/Support/Tickets/useCases/get-ticket-details/get-ticket-details.usecase";
import { GetTicketDetailsController } from "../../modules/Support/Tickets/useCases/get-ticket-details/get-ticket-details.controller";

import { SendTicketMessageUseCase } from "../../modules/Support/Tickets/useCases/send-ticket-message/send-ticket-message.usecase";
import { SendTicketMessageController } from "../../modules/Support/Tickets/useCases/send-ticket-message/send-ticket-message.controller";

import { CloseTicketUseCase } from "../../modules/Support/Tickets/useCases/close-ticket/close-ticket.usecase";
import { CloseTicketController } from "../../modules/Support/Tickets/useCases/close-ticket/close-ticket.controller";

const supportRouter = Router();

// Dependências
const ticketsRepository = new PrismaTicketsRepository();
const slackProvider = new AxiosSlackProvider();

const createTicketUseCase = new CreateTicketUseCase(ticketsRepository, slackProvider);
const createTicketController = new CreateTicketController(createTicketUseCase);

const listTicketsUseCase = new ListTicketsUseCase(ticketsRepository);
const listTicketsController = new ListTicketsController(listTicketsUseCase);

const getTicketDetailsUseCase = new GetTicketDetailsUseCase(ticketsRepository, slackProvider);
const getTicketDetailsController = new GetTicketDetailsController(getTicketDetailsUseCase);

const sendTicketMessageUseCase = new SendTicketMessageUseCase(ticketsRepository, slackProvider);
const sendTicketMessageController = new SendTicketMessageController(sendTicketMessageUseCase);

const closeTicketUseCase = new CloseTicketUseCase(ticketsRepository, slackProvider);
const closeTicketController = new CloseTicketController(closeTicketUseCase);

// Rotas do Suporte
supportRouter.post("/tickets", supportIsAuth, (req, res) => createTicketController.handle(req, res));
supportRouter.get("/tickets", supportIsAuth, (req, res) => listTicketsController.handle(req, res));
supportRouter.get("/tickets/:id", supportIsAuth, (req, res) => getTicketDetailsController.handle(req, res));
supportRouter.post("/tickets/:id/messages", supportIsAuth, (req, res) => sendTicketMessageController.handle(req, res));
supportRouter.patch("/tickets/:id/close", supportIsAuth, (req, res) => closeTicketController.handle(req, res));

export { supportRouter };
