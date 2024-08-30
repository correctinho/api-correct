import { CustomError } from "../errors/custom.error";

export class DocumentValidator {

    validator(document: string) {

        if (!document) throw new CustomError("Document is required", 400)

        const onlyNumberDocument = this.processDocument(document)

        //validate document length
        if (onlyNumberDocument.length !== 11) throw new CustomError(`Document must have 11 characters: ${document}`, 400)

        //validate if document has only numbers
        const documentRegex = /^[0-9]+$/;
        if (!documentRegex.test(onlyNumberDocument)) throw new CustomError("Document must contain only numeric characters", 400);

        const isValid = this.isValidCPF(onlyNumberDocument)
        if (!isValid) throw new CustomError("Invalid Document", 400)

        return onlyNumberDocument
    }

    private processDocument(document: string) {
        const onlyNumbers = document.replace(/\D/g, '');
        return onlyNumbers
    }

    private isValidCPF(document: string) {
        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) {
            sum += parseInt(document.substring(i - 1, i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;

        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(document.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(document.substring(i - 1, i)) * (12 - i);
        }
        remainder = (sum * 10) % 11;

        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(document.substring(10, 11))) return false;

        return true;
    }
}
