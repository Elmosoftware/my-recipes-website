import { Injectable } from "@angular/core";
import { Router } from '@angular/router';
import { SearchServiceInterface } from './search-service';

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
    About = "about"
}

/**
 * This class acts as a helper to navigate the different pages in the app.
 */
@Injectable()
export class NavigationService {
    constructor(private router: Router) {
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

        let commands:any[] = [this.getRelativePath(PAGES.Recipe)]

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

    private getRelativePath(page: PAGES): string{
        return `/${page}`;
    }
}