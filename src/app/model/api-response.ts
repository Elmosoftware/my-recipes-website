import { Entity } from "./entity";
import { EntityBase } from './entity-base';

export class APIResponse {
    
    constructor(responseData:any){
        this.error = JSON.parse(responseData.error);
        this.entities = JSON.parse(responseData.payload);
    }

    error: Error | null;
    entities: Entity[] | EntityBase[];
}