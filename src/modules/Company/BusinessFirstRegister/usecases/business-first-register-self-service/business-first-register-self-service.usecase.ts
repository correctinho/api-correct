import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IMailProvider } from "../../../../../infra/providers/MailProvider/models/IMailProvider";
import { BenefitsEntity } from "../../../../benefits/entities/benefit.entity";
import { IBenefitsRepository } from "../../../../benefits/repositories/benefit.repository";
import { BranchEntity } from "../../../../branch/entities/branch.entity";
import { IBranchRepository } from "../../../../branch/repositories/branch.repository";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { PartnerCategory, PartnerConfigEntity } from "../../../PartnerConfig/entities/partner-config.entity";
import { BusinessRegisterEntity } from "../../entities/business-first-register.entity";
import { IBusinessFirstRegisterRepository } from "../../repositories/business-first-register.repository";
import { InputBusinessFirstRegisterDTO, OutputBusinessFirstRegisterDTO } from "../business-first-register/dto/business-first-register.dto";

export class CreateBusinessRegisterSelfServiceUsecase {
  constructor(
    private businessRegisterRepository: IBusinessFirstRegisterRepository,
    private companyDataRepository: ICompanyDataRepository,
    private branchRepository: IBranchRepository,
    private mailProvider: IMailProvider
  ) { }

  async execute(data: InputBusinessFirstRegisterDTO): Promise<OutputBusinessFirstRegisterDTO> {
    const register = await BusinessRegisterEntity.create(data as any);
    const findBusiness = await this.companyDataRepository.findByDocument(register.document);
    if (findBusiness) throw new CustomError("Empresa já registrada", 409);
    const findByEmail = await this.companyDataRepository.findByEmail(register.email);
    if (findByEmail) throw new CustomError("Email já registrado", 409);

    if (register.business_type === 'autonomo_comercio' || register.business_type === 'comercio') {
      const partneConfigData = {
        business_info_uuid: new Uuid(register.business_info_uuid),
        main_branch: new Uuid(data.partnerConfig.main_branch),
        partner_category: data.partnerConfig.partner_category as PartnerCategory[],
        items_uuid: ["placeholder-uuid-temporario"],
        admin_tax: 0, marketing_tax: 0, use_marketing: data.partnerConfig.use_marketing,
        market_place_tax: 0, use_market_place: data.partnerConfig.use_market_place,
        title: data.partnerConfig.title ? data.partnerConfig.title : null
      };
      const partnerConfigEntity = PartnerConfigEntity.create(partneConfigData);

      const mainBranchCheck = register.branches_uuid?.find(branch => branch === data.partnerConfig.main_branch);
      if (!mainBranchCheck) throw new CustomError("Ramo principal inválido", 400);

      const branches = await this.verifyBranches(register.branches_uuid || []);
      const mainBranchDetails = branches.find(branch => branch.uuid === data.partnerConfig.main_branch);
      if (!mainBranchDetails) throw new CustomError("Ramo principal não encontrado", 400);

      const mainBranchRawData = mainBranchDetails.toJSON();

      if (partnerConfigEntity.use_marketing) {
        partnerConfigEntity.changeMarketingTax(mainBranchRawData.marketing_tax);
      }
      if (partnerConfigEntity.use_market_place) {
        partnerConfigEntity.changeMarketingPlaceTax(mainBranchRawData.market_place_tax);
      }
      partnerConfigEntity.changeAdminTax(mainBranchRawData.admin_tax);

      partnerConfigEntity.changeItemsUuid(mainBranchDetails.benefits_uuid);

      const response = await this.businessRegisterRepository.saveSelfServicePartner(register, partnerConfigEntity);

      // ==========================================
      this.sendNotifications(register).catch(err => {
        console.error("[CreateBusinessRegister] Falha silenciosa no envio de emails:", err);
      });
      return response;

    } else if (register.business_type === 'empregador') {
      throw new CustomError("Tipo de negócio inválido", 400);
    }
    throw new CustomError("Tipo de negócio inválido ou não especificado.", 400);
  }

  private async verifyBranches(branches_uuid: string[]): Promise<BranchEntity[]> {
    const verifiedBranches: BranchEntity[] = [];
    for (const branch_uuid of branches_uuid) {
      if (!branch_uuid) continue;
      const findBranch = await this.branchRepository.getByID(branch_uuid);
      if (!findBranch) throw new CustomError(`Branch with id ${branch_uuid} not found`, 404);
      verifiedBranches.push(findBranch);
    }
    return verifiedBranches;
  }

  private async sendNotifications(register: BusinessRegisterEntity): Promise<void> {
    const senderAddress = process.env.MAIL_ACCOUNT_NOREPLY_USER;
    const adminAlertEmail = process.env.ADMIN_ALERT_EMAIL; // <-- Crie isso no seu .env

    if (!senderAddress) {
      console.warn("Remetente (MAIL_ACCOUNT_NOREPLY_USER) não configurado. E-mails não foram enviados.");
      return;
    }

    // 1. E-mail para a Empresa (Lojista)
    const partnerSubject = "Bem-vindo à Correct! Falta pouco para ativar seu cadastro.";
    const partnerBody = `
        <div style="font-family: sans-serif; color: #333;">
            <h2>Olá, equipe da ${register.fantasy_name}!</h2>
            <p>Recebemos o seu pré-cadastro com sucesso na plataforma Correct.</p>
            <p>Para liberar o seu acesso ao painel de parceiro e começar a aproveitar nossos benefícios, é necessário realizar o pagamento da taxa de adesão via PIX.</p>
            <p>Se você já realizou o pagamento através da tela de sucesso, ignore este e-mail. Caso contrário, acesse a plataforma para gerar o seu QR Code.</p>
            <br/>
            <p>Abraços,</p>
            <p><strong>Equipe Correct</strong></p>
        </div>
    `;

    const sendToPartner = this.mailProvider.sendMail({
      to: register.email,
      subject: partnerSubject,
      body: partnerBody,
      from: { name: "Plataforma Correct", address: senderAddress }
    });

    // 2. E-mail para o Admin da Correct (Alerta Interno)
    let sendToAdmin = Promise.resolve(); // Promessa vazia por padrão
    if (adminAlertEmail) {
      const adminSubject = `🚨 Novo Pré-cadastro: ${register.fantasy_name}`;
      const adminBody = `
            <div style="font-family: sans-serif; color: #333;">
                <h2>Novo Lojista Registrado (Aguardando PIX)</h2>
                <ul>
                    <li><strong>Fantasia:</strong> ${register.fantasy_name}</li>
                    <li><strong>Razão Social:</strong> ${register.corporate_reason}</li>
                    <li><strong>Documento:</strong> ${register.document}</li>
                    <li><strong>E-mail:</strong> ${register.email}</li>
                    <li><strong>Telefone:</strong> ${register.phone_1}</li>
                </ul>
                <p>O status atual da empresa é: <b>AGUARDANDO PAGAMENTO</b>.</p>
            </div>
        `;

      sendToAdmin = this.mailProvider.sendMail({
        to: adminAlertEmail,
        subject: adminSubject,
        body: adminBody,
        from: { name: "Notificações Syscorrect", address: senderAddress }
      });
    }

    // Dispara os dois simultaneamente e aguarda a conclusão
    await Promise.allSettled([sendToPartner, sendToAdmin]);
  }


}
