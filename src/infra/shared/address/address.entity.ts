import { Uuid } from '../../../@shared/ValueObjects/uuid.vo';
import { CustomError } from '../../../errors/custom.error';
import { newDateF } from '../../../utils/date';

export type AddressProps = {
    uuid?: Uuid;
    line1: string | null;
    line2: string | null;
    line3: string | null;
    postal_code: string;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    latitude: number | null;
    longitude: number | null;
    created_at?: string;
    updated_at?: string;
};

export type AddressCreateCommand = {
    line1: string | null;
    line2: string | null;
    line3: string | null;
    postal_code: string;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    latitude: number | null;
    longitude: number | null;
    created_at?: string;
    updated_at?: string;
};

export class AddressEntity {
    private _uuid: Uuid;
    private _line1: string | null;
    private _line2: string | null;
    private _line3: string | null;
    private _postal_code: string;
    private _neighborhood: string | null;
    private _city: string | null;
    private _state: string | null;
    private _country: string | null;
    private _latitude: number | null;
    private _longitude: number | null;
    private _created_at?: string;
    private _updated_at?: string;

    constructor(props: AddressProps) {
        this._uuid = props.uuid ?? new Uuid();
        this._line1 = props.line1;
        this._line2 = props.line2;
        this._line3 = props.line3;
        this._postal_code = props.postal_code;
        this._neighborhood = props.neighborhood;
        this._city = props.city;
        this._state = props.state;
        this._country = props.country;
        this._latitude = props.latitude;
        this._longitude = props.longitude;
        this._created_at = newDateF(new Date());
        this._updated_at = newDateF(new Date());
        this.validate();
    }

    get uuid(): Uuid {
        return this._uuid;
    }

    get line1(): string | null {
        return this._line1;
    }

    get line2(): string | null {
        return this._line2;
    }

    get line3(): string | null {
        return this._line3;
    }

    get postal_code(): string {
        return this._postal_code;
    }

    get neighborhood(): string | null {
        return this._neighborhood;
    }

    get city(): string | null {
        return this._city;
    }

    get state(): string | null {
        return this._state;
    }

    get country(): string | null {
        return this._country;
    }

    get latitude(): number | null {
        return this._latitude;
    }

    get longitude(): number | null {
        return this._longitude;
    }

    get created_at(): string | undefined {
        return this._created_at;
    }

    get updated_at(): string | undefined {
        return this._updated_at;
    }

    changeLine1(line1: string | null) {
        this._line1 = line1;
        this.validate();
    }

    changeLine2(line2: string | null) {
        this._line2 = line2;
        this.validate();
    }

    changeLine3(line3: string | null) {
        this._line3 = line3;
        this.validate();
    }

    changePostalCode(postal_code: string) {
        this._postal_code = postal_code;
        this.validate();
    }

    changeNeighborhood(neighborhood: string | null) {
        this._neighborhood = neighborhood;
        this.validate();
    }

    changeCity(city: string | null) {
        this._city = city;
        this.validate();
    }

    changeState(state: string | null) {
        this._state = state;
        this.validate();
    }

    changeCountry(country: string | null) {
        this._country = country;
        this.validate();
    }

    changeLatitude(latitude: number | null) {
        this._latitude = latitude;
        this.validate();
    }

    changeLongitude(longitude: number | null) {
        this._longitude = longitude;
        this.validate();
    }

    validate() {
        if (!this._line1) throw new CustomError("Line1 is required", 400);
        if (!this._line2) throw new CustomError("Line2 is required", 400);
        if (!this._postal_code) throw new CustomError("Postal code is required", 400);
        if (!this._neighborhood) throw new CustomError("Neighborhood is required", 400);
        if (!this._city) throw new CustomError("City is required", 400);
        if (!this._state) throw new CustomError("State is required", 400);
        if (!this._country) throw new CustomError("Country is required", 400);

        if (this._line1 && typeof this._line1 !== 'string') throw new CustomError("Line1 must be a string", 400);
        if (this._line2 && typeof this._line2 !== 'string') throw new CustomError("Line2 must be a string", 400);
        if (this._line3 && typeof this._line3 !== 'string') throw new CustomError("Line3 must be a string", 400);
        if (typeof this._postal_code !== 'string') throw new CustomError("Postal code must be a string", 400);
        if (this._neighborhood && typeof this._neighborhood !== 'string') throw new CustomError("Neighborhood must be a string", 400);
        if (this._city && typeof this._city !== 'string') throw new CustomError("City must be a string", 400);
        if (this._state && typeof this._state !== 'string') throw new CustomError("State must be a string", 400);
        if (this._country && typeof this._country !== 'string') throw new CustomError("Country must be a string", 400);
    }

    static async create(data: AddressCreateCommand) {
        const address = new AddressEntity(data);
        return address;
    }

    static hydrate(props: AddressProps): AddressEntity {
        return new AddressEntity(props);
    }
}