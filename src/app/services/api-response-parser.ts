import { Entity } from "../model/entity";

/**
 * This is the normal API response whe there was no errors, but neither any payload.
 */
export const EMPTY_RESPONSE = { error: null, payload: [] };

/**
 * This class helps parsing the My Recipes API response body.
 */
export class APIResponseParser {

    /**
     * Set the parser.
     * @param responseData The response body from a call to any of the MyRecipes API function. 
     * @param throwAPIErrors A boolean value indicating if the errors reported by the API will be thrown. The default value is "true".
     */
    constructor(responseData:any = EMPTY_RESPONSE, throwAPIErrors: boolean = true, reportProgress: APIResponseProgress = null){
        let e: Error = null;

        try {
            this.error = responseData.error;
            this.entities = responseData.payload;
            this.headers = {};
            this.progress = null;

            if (responseData.headers) {
                this.headers = responseData.headers;
            }

            if (reportProgress) {
                this.progress = reportProgress;
            }

        } catch (error) {
            e = new Error(`There was an error parsing the API response data.\n${error}`)
            e.stack = error.stack
            throw e;            
        } 

        if (this.error && throwAPIErrors) {
            throw this.error;
        }        
    }

    /**
     * The error returned by the API call or "null" in case there was no errors.
     */
    error: Error | null;

    /**
     * API call payload.
     */
    entities: Entity[];

    /**
     * Special Headers sent by the API. An easy way to get them ;-)
     */
    headers: any;

    /**
     * Allows to report the progress of cost expensive operations, (e.g.: File uploads).
     */
    progress: APIResponseProgress;
}

/**
 * Expose information about the request progress.
 */
export class APIResponseProgress {

    /**
     * Set the current progress data.
     * @param isDone Boolean value indicating if the operation is done
     * @param percentage Value from 0 to 100 indicating the operation progress.
     * @param totalBytes Total bytes transferred.
     */
    constructor(isDone: boolean = false, percentage: number = 0, totalBytes: number = 0) {
        this.isDone = isDone;
        this.percentage = percentage;
        this.totalBytes = totalBytes;
    }

    isDone: boolean;
    percentage: number;
    totalBytes: number;
}