import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { SearchServiceBase } from "./search-service";
import { SEARCH_TYPE } from "./search-type";
import { WordAnalyzerService } from "../services/word-analyzer-service";
import { EntityServiceFactory } from "./entity-service-factory";
import { EntityService } from "./entity-service";
import { APIQueryParams } from "./api-query-params";
import { APIResponseParser } from "./api-response-parser";
import { Recipe } from "../model/recipe";
import { SearchResults } from "./search-results";
import { SearchSuggestion } from './search-suggestion';

/**
 * This class implements a text search of Recipes.
 * In a text search the results will be returned based on the relevance on the full text index created on the database.
 */
export class SearchByTextService extends SearchServiceBase<Recipe> {

    private wordAnalyzer: WordAnalyzerService;
    private svcRecipe: EntityService;

    constructor(private svcFactory: EntityServiceFactory, term: string = "", id: string = "") {
        super(SEARCH_TYPE.Text, term, id, true);
        this.wordAnalyzer = new WordAnalyzerService();
        this.svcRecipe = this.svcFactory.getService("Recipe");
    }

    get termIsValid(): boolean {
        return this.term && String(this.term).length >= this.minTermLength;
    }

    fetch(top: number, skip: number = 0, highlightKeywords: boolean = true): Observable<SearchResults<Recipe>> {

        let q: APIQueryParams = new APIQueryParams();
        
        q.pop = "true";
        q.count = "true";
        q.top = String(top);
        q.skip = String(skip);
        // q.fields = "name description directions pictures";
        q.fields = "-level -mealType -ingredients";
        q.filter = JSON.stringify({ $text: { $search: this.term } });

        // return this._fakeRecipeGet(100000, 3000, q)
        return this.svcRecipe.get("", q)
            .pipe(
                map((data) => {
                    let parser: APIResponseParser = new APIResponseParser(data);

                    if (highlightKeywords) {
                        this.highlightKeywords(parser.entities as Recipe[]);
                    }

                    return new SearchResults<Recipe>(parser);
                })
            );
    }

    /*================================================================================================
        Used for testing purposes only:
        ===============================
    
    private _fakeRecipeGet(totalRecipes: number, msTimeout: number, q: EntityServiceQueryParams) {

        let ret = {
            error: null,
            payload: [],
            headers: {
                XTotalCount: totalRecipes
            }
        }
        let top: number = Number(q.top);
        let skip: number = Number(q.skip);
        let word: string = (JSON.parse(q.filter)).$text.$search

        for (let i = (skip + 1); i < (skip + top + 1); i++) {
            let r = new Recipe()

            r.name = `TEST Recipe #${i} for searched word ${word.toUpperCase()}`;
            r.description = `This is a fake recipe created for testing purposes. Searched word is ${word}.`;
            r.directions.push(`Only one direction with the searched word: ${word}`);

            ret.payload.push(r);

            if (i == totalRecipes) {
                break;
            }
        }

        return of(ret)
            .pipe(delay(msTimeout));
    }
    */

    highlightKeywords(entities: Recipe[]): void {

        let wordsMap: Map<string, string> = new Map<string, string>();
        let wordsMapValues: string[] = [];
        let highlightOptions = { surroundingTextLong: 70, maxOcurrences: 3 }

        if (entities && entities.length > 0) {

            this.words.forEach(w => {
                wordsMap.set(w, `<mark>${w}</mark>`)
                wordsMapValues.push(`<mark>${w}</mark>`);
            })

            entities.forEach((r: Recipe) => {

                r.name = this.wordAnalyzer.searchAndReplaceWord(r.name, wordsMap);
                r.description = this.wordAnalyzer.searchReplaceAndHighlightWord(r.description, wordsMap, highlightOptions);

                for (let i = 0; i < r.directions.length; i++) {

                    let origDir: string = r.directions[i];

                    r.directions[i] = this.wordAnalyzer.searchAndReplaceWord(r.directions[i], wordsMap);

                    //If the search term is not in the recipe direction, we will remove it from the list.
                    //There is no reason to keep the direction if the search term is not on it! :-)
                    if (r.directions[i] == origDir) {
                        r.directions[i] = "";
                    }
                    else {
                        //If the search has positive results, we will show only the relevant parts:
                        r.directions[i] = this.wordAnalyzer.highlightWord(r.directions[i], wordsMapValues, highlightOptions);
                    }
                }
            });
        }
    }

    findSuggestions(text: string) : Observable<SearchSuggestion[]> {
        return of([new SearchSuggestion(text)]);
    }
}