export class ErrorLog {

    constructor() {
        this.timestamp = new Date().toISOString();
        this.innerExceptions = [];
    }

    /**
     * Original error.
     */
    error: Error = null;

    /**
     * Error timestamp
     */
    timestamp: string = "";

    /**
     * Error location where was captured.
     */
    location: string = "";

    /**
     * Source URL, (if applies).
     */
    url: string = "";

    /**
     * If the error is XHR based, is the HTTP status returned by the call.
     */
    httpStatus: string = "";

    /**
     * If the error is XHR based, is the HTTP status text received.
     */
    httpStatusText: string = "";

    /**
     * Error message
     */
    message: string = "";

    /**
     * Message provided to the user.
     */
    userMessage: string = "";

    /**
     * Indicates if the error is related to some possible user action.
     */
    isUserError: boolean = false;

    /**
     * List of inner exceptions.
     */
    innerExceptions: any[];

    /**
     * Full error stack trace.
     */
    stack: string = "";

    /**
     * Return the message to be returned to the user.
     */
    getUserMessage(): string{
        return (this.userMessage) ? this.userMessage : 
            "Reintente luego, y si este error persiste contacte al equipo de soporte.";
    }
}
