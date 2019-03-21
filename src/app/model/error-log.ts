import { Entity } from "./entity";

export class ErrorLog extends Entity {

    constructor() {
        super();
        this.timestamp = new Date().toISOString();
        this.user = "anonymous"
        this.innerExceptions = [];
    }

    timestamp: string = "";
    location: string = "";
    url: string = "";
    user: string = "";
    httpStatus: string = "";
    httpStatusText: string = "";
    message: string = "";
    userMessage: string = "";
    isUserError: boolean = false;
    innerExceptions: any[];
    stack: string = "";

    getUserMessage(): string{
        return (this.userMessage) ? this.userMessage : 
            "Reintente luego, y si este error persiste contacte al equipo de soporte.";
    }
}
