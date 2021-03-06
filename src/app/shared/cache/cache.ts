import { Injectable, EventEmitter } from '@angular/core';

import { EntityServiceFactory } from "../../services/entity-service-factory";
import { APIQueryParams } from "../../services/api-query-params";
import { EntityService } from "../../services/entity-service";
import { MediaService } from "../../services/media-service";
import { APIResponseParser } from "../../services/api-response-parser";
import { Entity } from "../../model/entity";
import { CacheItem } from "./cache-item";
import { CacheRepository } from "./cache-repository";

export const enum CACHE_MEMBERS {
    Ingredients = "INGREDIENTS",
    Levels = "LEVELS",
    MealTypes = "MEALTYPES",
    Units = "UNITS",
    LatestRecipes = "LATEST_RECIPES",
    HomePageCarouselPictures = "HOME_PAGE_CAROUSEL_PICTURES",
    IngredientPictures = "INGREDIENT_PICTURES"
};
export const DEFAULT_API_RESULT = { error: null, payload: [] };

@Injectable()
export class Cache extends CacheRepository {

    private svcIngredient: EntityService;
    private svcLevel: EntityService;
    private svcMealType: EntityService;
    private svcUnit: EntityService;
    private svcRecipe: EntityService;

    private onRefresh: EventEmitter<CACHE_MEMBERS> = new EventEmitter();
    
    /**
     * Default cache item duration. After this time the value will be considered stale.
     */
    private readonly DEFAULT_DURATION: number = (20 * 60); //20 minutes.

    /**
     * Cache item duration for items that are unlikely to change.
     */
    private readonly UNLIKELY_TO_CHANGE_DURATION: number = (60 * 60); //60 minutes.

    /**
     * Indicate if we must hide the loading bar in UI on each cache item refresh.
     */
    private readonly HIDE_LOAD_BAR_ON_CACHE_REFRESH: boolean = true; 

    constructor(private svcFactory: EntityServiceFactory, private svcMedia: MediaService) {
        super();
        console.log("Cache Created");
        
        /*
            We set this cache in the service factory: (This will enable the services to invalidate caches on CRUD ops as needed):
            It will be easier to add "Cache" as a dependency on the Services itself, but there will be a circular dependency issue :-)
        */
        svcFactory.setCache(this);

        this.svcIngredient = this.svcFactory.getService("Ingredient");
        this.svcLevel = this.svcFactory.getService("Level");
        this.svcMealType = this.svcFactory.getService("MealType");
        this.svcUnit = this.svcFactory.getService("Unit");
        this.svcRecipe = this.svcFactory.getService("Recipe");

        this.initialize();
    }

    private initialize(): void {
        super.add(this.createCacheIngredients());
        super.add(this.createCacheLevels());
        super.add(this.createCacheMealTypes());
        super.add(this.createCacheUnits());
        super.add(this.createCacheLatestRecipes());
        super.add(this.createCacheHomePagePictures());
        super.add(this.createCacheIngredientPictures());
    }

    private refreshStaleCache(item: CacheItem): void {
        if (!item.isValid) {
            item.refresh().then(data => {
                item.value = data;
                this.onRefresh.emit(item.key as CACHE_MEMBERS);
                console.log(`Cache refreshed for: ${item.key}`)
            });
        }
    }

    public invalidateOne(key: CACHE_MEMBERS){
        let item: CacheItem = super.get(key);
        console.log(`Cache invalidated for: ${item.key}`)
        item.invalidate();
    }

    public invalidateAll(){
        console.log("ALL CACHE ITEMS HAS BEEN INVALIDATED.");
        super.invalidate();
    }

    public getRefreshEmitter(): EventEmitter<CACHE_MEMBERS> {
        return this.onRefresh;
    }

    //#region Levels
    private createCacheLevels(): CacheItem {
        let item: CacheItem = new CacheItem(CACHE_MEMBERS.Levels, this.DEFAULT_DURATION, DEFAULT_API_RESULT);
        item.setRefreshCallback(this, this.refreshCacheLevels);
        return item;
    }

    private refreshCacheLevels(): Promise<Object> {
        return this.svcLevel.get("", null, this.HIDE_LOAD_BAR_ON_CACHE_REFRESH).toPromise();
    }

    public get levels(): Entity[] {
        let item: CacheItem = super.get(CACHE_MEMBERS.Levels);
        this.refreshStaleCache(item);
        return new APIResponseParser(item.value).entities
    }
    //#endregion

    //#region MealTypes
    private createCacheMealTypes(): CacheItem {
        let item: CacheItem = new CacheItem(CACHE_MEMBERS.MealTypes, this.DEFAULT_DURATION, DEFAULT_API_RESULT);
        item.setRefreshCallback(this, this.refreshCacheMealTypes);
        return item;
    }

    private refreshCacheMealTypes(): Promise<Object> {
        return this.svcMealType.get("", null, this.HIDE_LOAD_BAR_ON_CACHE_REFRESH).toPromise();
    }

    public get mealTypes(): Entity[] {
        let item: CacheItem = super.get(CACHE_MEMBERS.MealTypes);
        this.refreshStaleCache(item);
        return new APIResponseParser(item.value).entities
    }

    //#endregion
    
    //#region Units
    private createCacheUnits(): CacheItem {
        let item: CacheItem = new CacheItem(CACHE_MEMBERS.Units, this.DEFAULT_DURATION, DEFAULT_API_RESULT);
        item.setRefreshCallback(this, this.refreshCacheUnits);
        return item;
    }

    private refreshCacheUnits(): Promise<Object> {
        return this.svcUnit.get("", null, this.HIDE_LOAD_BAR_ON_CACHE_REFRESH).toPromise();
    }

    public get units(): Entity[] {
        let item: CacheItem = super.get(CACHE_MEMBERS.Units);
        this.refreshStaleCache(item);
        return new APIResponseParser(item.value).entities
    }
    //#endregion

    //#region Ingredients
    private createCacheIngredients(): CacheItem {
        let item: CacheItem = new CacheItem(CACHE_MEMBERS.Ingredients, this.DEFAULT_DURATION, DEFAULT_API_RESULT);
        item.setRefreshCallback(this, this.refreshCacheIngredients);
        return item;
    }

    private refreshCacheIngredients(): Promise<Object> {
        return this.svcIngredient.get("", null, this.HIDE_LOAD_BAR_ON_CACHE_REFRESH).toPromise();
    }

    public get ingredients(): Entity[] {
        let item: CacheItem = super.get(CACHE_MEMBERS.Ingredients);
        this.refreshStaleCache(item);        
        return new APIResponseParser(item.value).entities;
    }
    //#endregion

    //#region Latest Recipes
    private createCacheLatestRecipes(): CacheItem {
        let item: CacheItem = new CacheItem(CACHE_MEMBERS.LatestRecipes, this.DEFAULT_DURATION, DEFAULT_API_RESULT);
        item.setRefreshCallback(this, this.refreshCacheLatestRecipes);
        return item;
    }

    private refreshCacheLatestRecipes(): Promise<Object> {
        let q = new APIQueryParams();
        q.pop = "true";
        q.top = "3";
        q.sort = "-publishedOn";
        return this.svcRecipe.get("", q, this.HIDE_LOAD_BAR_ON_CACHE_REFRESH).toPromise();
    }

    public get latestRecipes(): Entity[] {
        let item: CacheItem = super.get(CACHE_MEMBERS.LatestRecipes);
        this.refreshStaleCache(item);        
        return new APIResponseParser(item.value).entities;
    }
    //#endregion

    //#region Home Page Carousel Pictures
    private createCacheHomePagePictures(): CacheItem {
        let item: CacheItem = new CacheItem(CACHE_MEMBERS.HomePageCarouselPictures, this.UNLIKELY_TO_CHANGE_DURATION, []);
        item.setRefreshCallback(this, this.refreshCacheHomePagePictures);
        return item;
    }

    private refreshCacheHomePagePictures(): Promise<Object> {
        return this.svcMedia.getDynamicHomePagePictures().toPromise();
    }

    public get homePagePictures(): any[] {
        let item: CacheItem = super.get(CACHE_MEMBERS.HomePageCarouselPictures);
        this.refreshStaleCache(item);        
        return item.value;
    }
    //#endregion

    //#region Random Ingredient pictures
    private createCacheIngredientPictures(): CacheItem {
        let item: CacheItem = new CacheItem(CACHE_MEMBERS.IngredientPictures, this.UNLIKELY_TO_CHANGE_DURATION, []);
        item.setRefreshCallback(this, this.refreshCacheIngredientPictures);
        return item;
    }

    private refreshCacheIngredientPictures(): Promise<Object> {
        return this.svcMedia.getRandomIngredientPictures(3).toPromise();
    }

    public get ingredientPictures(): any[] {
        let item: CacheItem = super.get(CACHE_MEMBERS.IngredientPictures);
        this.refreshStaleCache(item);        
        return item.value;
    }
    //#endregion
}