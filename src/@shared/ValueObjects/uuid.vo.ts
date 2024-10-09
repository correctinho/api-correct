import { CustomError } from "../../errors/custom.error";
import { ValueObject } from "../domain/value-objects";
import { v4 as uuidv4, validate as uuidValidate } from "uuid"

export class Uuid extends ValueObject {
  readonly uuid: string

  constructor(uuid?: string) {
    super()
    this.uuid = uuid || uuidv4()
    this.validate()
  }

  private validate() {
    const isValid = uuidValidate(this.uuid)
    if (!isValid) {
      throw new CustomError("Invalid uuid")
    }
  }
}
