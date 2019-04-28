import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

import { SearchServiceBase } from "./search-service";
import { SEARCH_TYPE } from "./search-type";
import { SearchResults } from "./search-results";
import { SearchSuggestion } from "./search-suggestion";
import { Helper } from "../shared/helper";
import { AuthService } from "./auth-service";
import { EntityServiceFactory } from "./entity-service-factory";
import { EntityService } from "./entity-service";
import { APIQueryParams } from "./api-query-params";
import { APIResponseParser } from "./api-response-parser";
import { Recipe } from "../model/recipe";

/**
 * This class implement an ingredient based search on Recipes.
 */
export class SearchByUserService extends SearchServiceBase<Recipe> {

    private helper: Helper;
    private svcRecipes: EntityService;

    constructor(private svcFactory: EntityServiceFactory, private svcAuth: AuthService, term: string = "", id: string = "") {
        super(SEARCH_TYPE.User, term, id);
        this.helper = new Helper()
        this.svcRecipes = this.svcFactory.getService("Recipe");
    }

    get termIsValid(): boolean {
        return this.id && this.id.length > 0; //We need to specify a User ID in order to proceed.;
    }

    fetch(top: number, skip: number = 0, highlightKeywords: boolean = true): Observable<SearchResults<Recipe>> {

        let q: APIQueryParams = new APIQueryParams();

        q.pop = "true";
        q.count = "true";
        q.top = String(top);
        q.skip = String(skip);
        q.owner = this.id;
        q.fields = "-level -mealType -ingredients -directions";

        return this.svcRecipes.get("", q)
            .pipe(
                map(data => {
                    let parser: APIResponseParser = new APIResponseParser(data);

                    if (highlightKeywords) {
                        this.highlightKeywords((parser.entities as Recipe[]));
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

        if (entities && entities.length > 0) {
            entities.forEach(entity => {
                entity.description = this.helper.getShortText(entity.description); //Shorter description.
            })
        }
    }

    findSuggestions(text: string): Observable<SearchSuggestion[]> {

        let q = new APIQueryParams();
        q.filter = JSON.stringify({ name: { $regex: text, $options: "i" } });
        q.top = "5"

        console.log(`Value:${text}, Search type:${this.searchType}`);

        return this.svcAuth.getUsersInfo("", q)
            .pipe(
                map(data => {
                    let parser: APIResponseParser = new APIResponseParser(data);
                    let suggestions: SearchSuggestion[] = [];

                    parser.entities.forEach((item: any) => {
                        suggestions.push(new SearchSuggestion(item.name, item._id));
                    })

                    return suggestions;
                })
            );
        


        // return this.svcIngredients.get("", q)
        //     .pipe(
        //         map(data => {
        //             let parser: APIResponseParser = new APIResponseParser(data);
        //             let suggestions: SearchSuggestion[] = [];

        //             parser.entities.forEach((item: Ingredient) => {
        //                 suggestions.push(new SearchSuggestion(item.name, item._id));
        //             })

        //             return suggestions;
        //         })
        //     );
    }
}