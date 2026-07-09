import { Request, Response } from "express";
import { ProcessCartPaymentUseCase } from "./process-cart-payment.usecase";

export class ProcessCartPaymentController {
  constructor(private processCartPaymentUseCase: ProcessCartPaymentUseCase) { }

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { cart_uuid, payment_method_uuid } = req.body;
      const appUserInfoID = req.appUser.user_info_uuid; // From auth middleware
      const appUserUUID = req.appUser.appUserId;

      if (!cart_uuid || !payment_method_uuid) {
        return res.status(400).json({ error: "cart_uuid and payment_method_uuid are required." });
      }

      const result = await this.processCartPaymentUseCase.execute({
        cart_uuid,
        payment_method_uuid,
        appUserInfoID,
        appUserUUID
      });

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        error: error.message || "Unexpected error processing cart payment",
      });
    }
  }
}
