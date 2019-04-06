import { EntityBase } from "./entity-base";
import { User } from "./user";

/**
 * This class Extends "*EntityBase*" class by adding audit fields.
 */
export class Entity extends EntityBase {    
    public createdOn: Date;
    public createdBy: User;
    public lastUpdateOn: Date;
    public lastUpdateBy: string;

    constructor(){
        super();
        this.createdOn = null;
        this.createdBy = null;
        this.lastUpdateOn = null;
        this.lastUpdateBy = "";
    }
}
