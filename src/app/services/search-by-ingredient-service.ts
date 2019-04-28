import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

import { SearchServiceBase } from "./search-service";
import { SEARCH_TYPE } from "./search-type";
import { SearchResults } from "./search-results";
import { SearchSuggestion } from "./search-suggestion";
import { Helper } from "../shared/helper";
import { EntityServiceFactory } from "./entity-service-factory";
import { EntityService } from "./entity-service";
import { APIQueryParams } from "./api-query-params";
import { APIResponseParser } from "./api-response-parser";
import { Recipe } from "../model/recipe";
import { RecipeIngredient } from "../model/recipe-ingredient";
import { Ingredient } from '../model/ingredient';

/**
 * This class implement an ingredient based search on Recipes.
 */
export class SearchByIngredientService extends SearchServiceBase<Recipe> {

    private helper: Helper;
    private svcRecipeIngredients: EntityService;
    private svcIngredients: EntityService;

    constructor(private svcFactory: EntityServiceFactory, term: string = "", id: string = "") {
        super(SEARCH_TYPE.Ingredient, term, id);
        this.helper = new Helper()
        this.svcRecipeIngredients = this.svcFactory.getService("RecipeIngredient");
        this.svcIngredients = this.svcFactory.getService("Ingredient");
    }

    get termIsValid(): boolean {
        return this.id && this.id.length > 0; //We need to specify an ingredient ID in the case of a search by ingredient.;
    }

    fetch(top: number, skip: number = 0, highlightKeywords: boolean = true): Observable<SearchResults<Recipe>> {

        let q: APIQueryParams = new APIQueryParams();

        q.pop = "true";
        q.count = "true";
        q.top = String(top);
        q.skip = String(skip);
        q.filter = JSON.stringify({ ingredient: { $eq: this.id } });

        //return this._fakeRecipeGet(100000, 3000, q)
        return this.svcRecipeIngredients.get("", q)
            .pipe(
                map(data => {
                    let parser: APIResponseParser = new APIResponseParser(data);
                    let recipes: Recipe[] = [];

                    parser.entities.forEach((item: RecipeIngredient) => {
                        //Because we are searching "RecipeIngredients", even when we populate the results, the 
                        //ingredient data is below 2nd level subdocument so didn´t get populated. 
                        //Then we need to copy this data from the RecipeIngredient to the Recipe:
                        item.recipe.ingredients = [];
                        item.recipe.ingredients.push(new RecipeIngredient());
                        item.recipe.ingredients[0].ingredient = item.ingredient;
                        item.recipe.ingredients[0].amount = item.amount;
                        item.recipe.ingredients[0].unit = item.unit;

                        recipes.push(item.recipe);
                    })

                    if (highlightKeywords) {
                        this.highlightKeywords(recipes);
                    }

                    parser.entities = recipes; //We update the payload with Recipes instead of RecipeIngredients.
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

                entity.description = this.helper.getShortText(entity.description); //Showing a shorter description.
                entity.directions = []; //Removing all directions. Are not relevant for Ingredients search.

                for (let i = 0; i < entity.ingredients.length; i++) {

                    //We will remove all the ingredients that are not the ones we searched for:
                    if (String(entity.ingredients[i].ingredient._id) != this.id) {
                        entity.ingredients.splice(i, 1);
                        i--;
                    }
                }
            })
        }
    }

    findSuggestions(text: string): Observable<SearchSuggestion[]> {

        let q = new APIQueryParams();
        q.pop = "true";
        q.fields = "-compatibleUnits"
        q.filter = JSON.stringify({ name: { $regex: text, $options: "i" } });
        q.top = "5"

        console.log(`Value:${text}, Search type:${this.searchType}`);

        return this.svcIngredients.get("", q)
            .pipe(
                map(data => {
                    let parser: APIResponseParser = new APIResponseParser(data);
                    let suggestions: SearchSuggestion[] = [];

                    parser.entities.forEach((item: Ingredient) => {
                        suggestions.push(new SearchSuggestion(item.name, item._id));
                    })

                    return suggestions;
                })
            );
    }
}