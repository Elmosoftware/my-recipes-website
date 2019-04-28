import { Injectable } from '@angular/core';

import { EntityServiceFactory } from "./entity-service-factory";
import { AuthService } from "../services/auth-service";
import { SearchServiceInterface } from "./search-service";
import { SearchByTextService } from "./search-by-text-service";
import { SearchByIngredientService } from "./search-by-ingredient-service";
import { SearchByUserService } from "./search-by-user-service";
import { SEARCH_TYPE } from "./search-type";
import { Recipe } from '../model/recipe';

/**
 * Factory class for all the Search Service flavours.
 */
@Injectable()
export class SearchServiceFactory {

    constructor(private svcFactory: EntityServiceFactory, private svcAuth: AuthService) {
        console.log("SearchServiceFactory Created");
    }

    /**
     * Returns a new instance of the right SearchService subclass based on the kind of search.
     * Will throw an exception if there is no implemented search class for the type supplied.
     * @param type The kind of search to be performed.
     */
    getService(type: SEARCH_TYPE): SearchServiceInterface<Recipe> {

        switch (type) {
            case SEARCH_TYPE.Text:
              return new SearchByTextService(this.svcFactory);
            case SEARCH_TYPE.Ingredient:
              return new SearchByIngredientService(this.svcFactory);
            case SEARCH_TYPE.User:
              return new SearchByUserService(this.svcFactory, this.svcAuth);
            default:
              throw new Error(`No SearchService class already defined for search type "${String(type)}".`);
          }
    }
}
