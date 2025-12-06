// Import do Controller Genérico
import { N8nNotifierProvider } from "../../../../../infra/providers/NotifierProvider/implementations/N8nNotifierProvider";
import { ConfirmedAppointmentPrismaRepository } from "../../../repositories/implementations/ConfirmedAppointmentPrismaRepository";
import { ConfirmAppointmentController } from "./ConfirmAppointmentController";

// 1. Instanciar as dependências concretas
const confirmedAppointmentRepository = new ConfirmedAppointmentPrismaRepository();
const n8nNotifierProvider = new N8nNotifierProvider();

// 2. Injetar as dependências no Controller
const confirmAppointmentController = new ConfirmAppointmentController(
    confirmedAppointmentRepository,
    n8nNotifierProvider
);

// 3. Exportar a instância do controller pronta para uso nas rotas
export { confirmAppointmentController };