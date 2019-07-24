import { Injectable } from "@angular/core";
import { Router, UrlSegment } from '@angular/router';
import { SearchServiceInterface } from './search-service';
import { COOKBOOK_TABS } from "../cookbook/cookbook-tabs";

/**
 * This enums all the Pages in the app.
 */
export const enum PAGES {
    Home = "home",
    Login = "login",
    AuthCallback = "auth-callback",
    Unauthorized = "error-unauthorized",
    Search = "search",
    Recipe = "recipe",
    RecipeView = "recipe-view",
    Level = "levels",
    MealType = "mealtypes",
    Unit = "units",
    Ingredient = "ingredients",
    UserPreferences = "user-preferences",
    UserDetails = "user-details",
    MyRecipes = "my-recipes",
    Cookbook = "cookbook",
    About = "about"
}

/**
 * This class acts as a helper to navigate the different pages in the app.
 */
@Injectable()
export class NavigationService {
    constructor(private router: Router) {
    }

    parsePageURL(url: UrlSegment): PAGES {

        if (url && url.path) {
            switch (url.path.toLowerCase()) {
                case PAGES.Home:
                    return PAGES.Home
                case PAGES.Login:
                    return PAGES.Login
                case PAGES.AuthCallback:
                    return PAGES.AuthCallback
                case PAGES.Unauthorized:
                    return PAGES.Unauthorized
                case PAGES.Search:
                    return PAGES.Search
                case PAGES.Recipe:
                    return PAGES.Recipe
                case PAGES.RecipeView:
                    return PAGES.RecipeView
                case PAGES.Level:
                    return PAGES.Level
                case PAGES.MealType:
                    return PAGES.MealType
                case PAGES.Unit:
                    return PAGES.Unit
                case PAGES.Ingredient:
                    return PAGES.Ingredient
                case PAGES.UserPreferences:
                    return PAGES.UserPreferences
                case PAGES.UserDetails:
                    return PAGES.UserDetails
                case PAGES.MyRecipes:
                    return PAGES.MyRecipes
                case PAGES.About:
                    return PAGES.About
                case PAGES.Cookbook:
                    return PAGES.Cookbook
                default:
                    throw new Error(`Page "${url.path.toLowerCase()}" is not been defined yet in PAGES enumeration.`)
            }
        }
        else {
            throw new Error(`Invalid URL segment sent.`);
        }
    }

    toUnauthorizedAccess(): void {
        this.router.navigate([this.getRelativePath(PAGES.Unauthorized)]);
    }

    toHome(): void {
        this.router.navigate([this.getRelativePath(PAGES.Home)]);
    }

    toLogin(referrer?: string): void {

        let extras = { queryParams: {} };
        
        if (referrer) {
            (extras.queryParams as any).referrer = referrer;
        }
        
        this.router.navigate([this.getRelativePath(PAGES.Login)], extras);
    }

    toAbout(): void {
        this.router.navigate([this.getRelativePath(PAGES.About)]);
    }

    toRecipe(id?: string): void {

        let commands: any[] = [this.getRelativePath(PAGES.Recipe)]

        if (id) {
            commands.push(id);
        }
        
        this.router.navigate(commands);
    }

    toRecipeView(id: string): void {
        this.router.navigate([this.getRelativePath(PAGES.RecipeView), id]);
    }

    toMyRecipes(): void {
        this.router.navigate([this.getRelativePath(PAGES.MyRecipes)]);
    }

    toUserDetails(id: string): void {
        this.router.navigate([this.getRelativePath(PAGES.UserDetails), id]);
    }

    toSearch(search?: SearchServiceInterface<any>): void {

        let extras = { queryParams: {} };
        
        if (search) {
            if (search.searchType) {
                (extras.queryParams as any).type = search.searchType;
            }

            if (search.term) {
                (extras.queryParams as any).term = search.term;
            }

            if (search.id) {
                (extras.queryParams as any).id = search.id;
            }
        }
        
        this.router.navigate([this.getRelativePath(PAGES.Search)], extras);
    }

    toCookbook(tab?: COOKBOOK_TABS): void {

        let extras = { queryParams: {} };
        
        if (tab) {
            (extras.queryParams as any).tab = tab;
        }
        
        this.router.navigate([this.getRelativePath(PAGES.Cookbook)], extras);
    }

    toUserPreferences(): void {
        this.router.navigate([this.getRelativePath(PAGES.UserPreferences)]);
    }

    toMealTypes(): void {
        this.router.navigate([this.getRelativePath(PAGES.MealType)]);
    }

    toLevels(): void {
        this.router.navigate([this.getRelativePath(PAGES.Level)]);
    }

    toUnits(): void {
        this.router.navigate([this.getRelativePath(PAGES.Unit)]);
    }

    toIngredients(): void {
        this.router.navigate([this.getRelativePath(PAGES.Ingredient)]);
    }

    private getRelativePath(page: PAGES): string {
        return `/${page}`;
    }
}