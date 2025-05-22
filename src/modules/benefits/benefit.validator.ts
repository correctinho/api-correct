// import { IsNotEmpty, MaxLength, IsString, IsOptional, validateSync } from "class-validator"
// import { Uuid } from "../../@shared/ValueObjects/uuid.vo";
// import { ItemCategory, ItemType } from "./usecases/create-benefit/create-benefit.dto";
// import { BenefitsEntity } from "./entities/benefit.entity";
// import { ClassValidatorFields } from "../../@shared/domain/validators/class-validtor-fields";

// export class BenefitRules{
//    @MaxLength(255)
//    @IsNotEmpty()
//    @IsString()
//    name: string;
//    description: string;

//    @IsString()
//    @IsOptional()
//    parent_uuid: Uuid | null

//    @IsNotEmpty()
//    item_type: ItemType;
//    item_category: ItemCategory;

//    constructor({ name, description, parent_uuid, item_type, item_category}: BenefitsEntity){
//     Object.assign(this, { name, description, parent_uuid, item_type, item_category})
//    }

// }

// export class BenefitValidator extends ClassValidatorFields{
//     validate(benefit: BenefitsEntity){
//         return super.validate( new BenefitRules(benefit))
//     }
// }

// export class BenefitValidatorFactory{
//     static create(){
//         return new BenefitValidator()
//     }
// }
