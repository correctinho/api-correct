import crypto from "crypto";
import { Request, Response } from "express";
import { HandleSlackWebhookUseCase } from "./handle-slack-webhook.usecase";

export class HandleSlackWebhookController {
    constructor(private handleSlackWebhookUseCase: HandleSlackWebhookUseCase) {}

    private verifySlackSignature(req: Request): boolean {
        const signingSecret = process.env.SLACK_SIGNING_SECRET;
        if (!signingSecret) {
            return true;
        }

        const signature = req.headers["x-slack-signature"] as string;
        const timestamp = req.headers["x-slack-request-timestamp"] as string;

        if (!signature || !timestamp) {
            return false;
        }

        const fiveMinutesAgo = Math.floor(Date.now() / 1000) - (60 * 5);
        if (parseInt(timestamp, 10) < fiveMinutesAgo) {
            return false;
        }

        const rawBody = (req as any).rawBody ? (req as any).rawBody.toString() : JSON.stringify(req.body);
        const sigBasestring = `v0:${timestamp}:${rawBody}`;
        const mySignature = "v0=" + crypto.createHmac("sha256", signingSecret).update(sigBasestring, "utf8").digest("hex");

        try {
            return crypto.timingSafeEqual(Buffer.from(mySignature, "utf8"), Buffer.from(signature, "utf8"));
        } catch {
            return false;
        }
    }

    async handle(req: Request, res: Response): Promise<Response> {
        let payload = req.body;

        // Se for payload interativo enviado como application/x-www-form-urlencoded
        if (typeof req.body?.payload === "string") {
            try {
                payload = JSON.parse(req.body.payload);
            } catch {}
        }

        if (payload?.type === "url_verification") {
            return res.status(200).json({ challenge: payload.challenge });
        }

        if (!this.verifySlackSignature(req)) {
            console.warn("[SlackWebhook] Assinatura do Slack inválida.");
            return res.status(401).send("Unauthorized: Invalid signature");
        }

        try {
            await this.handleSlackWebhookUseCase.execute(payload);
            return res.status(200).send("OK");
        } catch (error) {
            console.error("[SlackWebhook] Erro ao processar evento do Slack:", error);
            return res.status(200).send("OK");
        }
    }
}
