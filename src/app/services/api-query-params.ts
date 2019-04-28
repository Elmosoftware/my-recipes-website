
/**
 * Enum of possible values for the API query parameter atribute *"pub"*
 */
export const enum QUERY_PARAM_PUB {
    /**
     * Only include Published entities in the results.
     */
    default = "default",
    /**
     * Include both, published and not published entities in the results.
     */
    all = "all",
    /**
     *  Only include Not Published entities in the results.
     */
    notpub = "notpub"
};

/**
 * Enum of possible values for the API query parameter atribute *"owner"*.
 */
export const enum QUERY_PARAM_OWNER {
    /**
     * Include any entity in the results, regardless of which user is the owner.
     */
    any = "any",
    /**
     * Include only entities owned by the current user.
     */
    me = "me",
    /**
     *  Only include entities owned by other users that the current one.
     */
    others = "others"
};

/**
 * Collection of standard API query parameters that any API for this solution can accept.
 * All of these applies only to endpoints that retrieve data.
 */
export class APIQueryParams {

    constructor(pop: string = "", filter: string = "", top: string = "", skip: string = "",
        sort: string = "", count: string = "", fields: string = "", pub: QUERY_PARAM_PUB = QUERY_PARAM_PUB.default,
        owner: string = QUERY_PARAM_OWNER.any) {
        this.pop = pop;
        this.top = top;
        this.skip = skip;
        this.sort = sort;
        this.filter = filter;
        this.count = count;
        this.fields = fields;
        this.pub = pub;
        this.owner = owner;
    }

    /**
     * Maximum amount of entities that must be fetched.
     */
    top: string;

    /**
     * Number of the first entity to retrieve, (this must work together with the *"sort"* atribute).
     */
    skip: string;

    /**
     * Sort expression to apply.
     */
    sort: string;

    /**
     * Boolean value that indicate if subdocuments must be populated as well.
     */
    pop: string;

    /**
     * JSON filter expression to apply.
     */
    filter: string;

    /**
     * Boolean value indicating if a total count of all the entities that match the specified filter must be retrieved 
     * beside any *"top"* or *"skip"* attribute settings.
     * 
     * This allows the client to implement pagination over the results.
     */
    count: string;

    /**
     * This allows to specifie which fields must be included or ommited in the result set.
     */
    fields: string;

    /**
     * Combination of values indicating if only published entities must be returning.
     */
    pub: QUERY_PARAM_PUB;

    /**
     * Combination of values indicating if only owned entities must be returned.
     */
    owner: string | QUERY_PARAM_OWNER;

    /**
     * Return the full Querystring to be sent to the API based on the specified attributes.
     */
    getQueryString(): string {

        let ret = { value: "" };

        //Parsing query parameters:
        Object.getOwnPropertyNames(this).forEach((element) => {
            this.appendQueryValue(ret, element, this[element]);
        });

        return ret.value;
    }

    private appendQueryValue(query: any, paramName: string, value: string) {

        if (value) {
            query.value += `${(query.value.length > 0) ? "&" : ""}${paramName}=${value}`;
        }
    }
}
