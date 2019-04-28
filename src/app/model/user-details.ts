import { EntityBase } from "../model/entity-base";
import { User } from "../model/user";

export class UserDetails extends EntityBase {

    constructor() {
        super();
        this.user = null;
        this.providerName = "";
        this.memberSince = null;
        this.lastLogin = null;
        this.isSocial = false;
        this.picture = "";
        this.emailVerified = false;
        this.isAdmin = false;
    }

    user: User;
    providerName: string;
    memberSince: Date;
    lastLogin: Date;
    isSocial: boolean;
    picture: string;
    emailVerified: boolean;
    isAdmin: boolean;
}
