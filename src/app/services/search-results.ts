import { APIResponseParser } from "./api-response-parser";

/**
 * This class holds the data returned as result of a search.
 */
export class SearchResults<T>{

    /**
     * Creates the search results directly from the data returned by the API.
     * @param parser The API response parser with the data returned by the API.
     */
    constructor(parser: APIResponseParser){
        
        if (!parser) {
            throw new Error(`Parameter "parser" can't be a null reference.`);
        }

        if (parser.headers && parser.headers.XTotalCount) {
            this.totalCount = parser.headers.XTotalCount;
        }

        this.items = (parser.entities as any) as T[];
    }

    /**
     * Total amount of item available based on the search parameters.
     */
    public readonly totalCount: number;

    /**
     * List of matches.
     */
    public items: T[];
}
