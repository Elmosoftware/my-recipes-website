/**
 * This is the entity base class that define the entity identifier attribute "*_id*" and the 
 * publishing indicator "*publishedOn*".
 */
export class EntityBase {    
    public _id: string;
    public publishedOn: Date;

    constructor(){
        this._id = "";
        this.publishedOn = null;
    }
}
