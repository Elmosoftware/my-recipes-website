/**
 * Hold the different kind of search types the app has implemented.
 */
export enum SEARCH_TYPE {
    Text = "text",
    Ingredient = "ingredient",
    User = "user"
}

/**
 * Parse a string value as a search type.
 * It will throw if the value is not a defined search type.
 * @param type text representation of a SEARCH_TYPE enumeration item.
 */
export function parseSearchType(type: string): SEARCH_TYPE {
    switch (String(type).toLowerCase()) {
        case SEARCH_TYPE.Text:
            return SEARCH_TYPE.Text;
        case SEARCH_TYPE.Ingredient:
            return SEARCH_TYPE.Ingredient;
        case SEARCH_TYPE.User:
            return SEARCH_TYPE.User;
        default:
            throw new Error(`There is no defined SearchType with value ${type}.`)
    }
}
