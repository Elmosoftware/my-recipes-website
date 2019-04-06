import { EntityBase } from "./entity-base";
import { UserDetails } from "./user-details";

export class User extends EntityBase {

    constructor(){
        super();
        this.providerId = "";
        this.name = "";
        this.email = "";
        this.details = null;
    }

    providerId: string;
    name: string;
    email: string;
    details: UserDetails;
}
