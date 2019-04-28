/**
 * This class models one of the items suggested as part of a specific search.
 */
export class SearchSuggestion {
    constructor(text: string, id: string = "") {
        this.text = text;
        this.id = id;
    }

    /**
     * Suggested item text name or description.
     */
    public readonly text: string;

    /**
     * Suggested item identification, like a index number, GUID, etc.
     */
    public readonly id: string;
}