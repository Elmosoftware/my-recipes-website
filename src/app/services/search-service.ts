import { Observable } from 'rxjs';

import { SEARCH_TYPE } from "./search-type";
import { SearchResults } from "./search-results";
import { SearchSuggestion } from "./search-suggestion";

/**
 * Search service interface.
 */
export interface SearchServiceInterface<T> {

  /**
   * Kind of search to perform.
   */
  searchType: SEARCH_TYPE;
  
  /**
   * Term to search for.
   */
  term: string;
  
  /**
   * The id of a subdocument to search for.
   */
  id: string;
  
  /**
   * Parsed list of word to search for.
   */
  words: string[];
  
  /**
   * Minimum allowed length of the term to start searching on text based searches.
   */
  minTermLength: number;
  
  /**
   * Boolean value that indicates if the term is valid.
   */
  termIsValid: boolean;

  /**
   * Indicates if the search is text based, so no suggestions will be presented to the user.
   */
  isTextBasedSearch: boolean;
  
  /**
   * Return an Observable that will result in a SearchResults object with the search results.
   * @param top Amount of entities to retrieve.
   * @param skip Index of first entity to be fetched.
   * @param highlightKeywords Indicates if optionally, this processs will remark the coincidences in the items.
   */
  fetch(top: number, skip: number, highlightKeywords: boolean): Observable<SearchResults<T>>;
  
  /**
   * Higlight the term in the text of the retrieved entities or drops unnecessary data in order to show only 
   * relevant information. 
   * This is called internally by the fetch() method if the parameter @param highlightKeywords has the boolean value "true".
   */
  highlightKeywords(entities: T[]): void;

  /**
   * Find the list of suggestions related to the seacrh type selected and the partial text entered for the search.
   */
  findSuggestions(text: string): Observable<SearchSuggestion[]>;

  /**
   * Reset the term and id to his default value, and empty string (""), also clear the internal collections 
   * of words in the case the search is based on multiple words like a full sentence. 
   */
  reset() :void;
}

/**
 * Base Search service class that expose common functionality to all the search services 
 * related to store and parse the search terms.
 */
export abstract class SearchServiceBase<T> implements SearchServiceInterface<T> {

    constructor(type: SEARCH_TYPE, term: string = "", id: string = "", isTextBasedSearch :boolean = false) {
      this._words = [];
      this.term = (!term) ? "" : term ;
      this.id = (!id) ? "" : id ;
      this.minTermLength = 3;
      this.searchType = type;
      this.isTextBasedSearch = isTextBasedSearch;
    }
  
    private _term: string;
    private _words: string[];
  
    public readonly searchType: SEARCH_TYPE;

    public id: string;

    public get words(): string[]{
      return this._words;
    }

    public readonly minTermLength: number;

    public readonly isTextBasedSearch: boolean;
  
    get term(): string {
      return this._term;
    }
    set term(value: string) {
  
      let sep: string;
  
      this._term = value;
      value = value.replace(/'/g, `"`); //If the value has single quotes, we replace them with double quotes.
      sep = (value.indexOf(`"`) != -1) ? `"` : ` `; //If there is a quoted string, we will separate by quotes, if not by spaces.
      this._words = value.split(sep)
        .filter( v => { return v != "" }); //We creates the word dictionary.
    }

    reset(): void {
      this._words = [];
      this._term = "";
      this.id = "";
    }

    abstract get termIsValid(): boolean;

    abstract fetch(top: number, skip: number, highlightKeywords: boolean): Observable<SearchResults<T>>;
    
    abstract highlightKeywords(entities: T[]): void;

    abstract findSuggestions(text: string): Observable<SearchSuggestion[]>;
}
