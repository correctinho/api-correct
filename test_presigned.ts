import { CloudflareR2Storage } from '../../../../../src/infra/providers/storage/implementations/cloudflare-r2/cloudflare-r2.storage';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    const storage = new CloudflareR2Storage();
    const filePath = "receipts/receipt-5b831aa0-fa29-4b7e-acc3-d29fe7d1072e-1791282543004-1787086621823.png";
    
    try {
        const url = await storage.getPresignedUrl(filePath);
        console.log("Presigned URL:", url);
    } catch (e) {
        console.error("Error generating URL:", e);
    }
}

run();
