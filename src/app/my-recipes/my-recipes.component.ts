import { Component, OnInit, EventEmitter } from '@angular/core';
import { trigger, state, animate, transition, style } from '@angular/animations';

import { CoreService } from "../services/core-service";
import { EntityService } from "../services/entity-service";
import { APIQueryParams, QUERY_PARAM_PUB, QUERY_PARAM_OWNER } from "../services/api-query-params";
import { APIResponseParser } from "../services/api-response-parser";
import { Recipe } from "../model/recipe";
import { InfiniteScrollingService, SCROLL_POSITION, PagingHelper } from "../shared/infinite-scrolling/infinite-scrolling-module";
import { Cache, CACHE_MEMBERS } from '../shared/cache/cache';
import { MealType } from '../model/mealtype';

/**
 * Size of each data page.
 */
const PAGE_SIZE: number = 50;

@Component({
  selector: 'app-my-recipes',
  templateUrl: './my-recipes.component.html',
  styleUrls: ['./my-recipes.component.css'],
  animations: [
    trigger('filterVisibilityTrigger', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0.5s', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class MyRecipesComponent implements OnInit {

  globalErrorSubscription: any;
  cacheRefreshSubscription: any;

  asyncInProgress: boolean;
  svcRecipe: EntityService;
  svcInfScroll: InfiniteScrollingService<Recipe>;
  onDataFeed: EventEmitter<PagingHelper>;
  mealtypesFilter: any[];
  notPublishedOnlyFilter: boolean;
  filtersVisible: boolean

  constructor(public core: CoreService,
    public cache: Cache) {
  }

  ngOnInit() {
    //Initializing:
    this.svcRecipe = this.core.entityFactory.getService("Recipe");
    this.filtersVisible = true;
    this.mealtypesFilter = [];
    this.cacheRefreshSubscription = this.cache.getRefreshEmitter();

    this.cacheRefreshSubscription.subscribe((key: CACHE_MEMBERS) => {
      if (key == CACHE_MEMBERS.MealTypes) { 
        this.buildMealTypesFilterList();
      }
    })

    this.buildMealTypesFilterList();    
    this.reset();
  }

  buildMealTypesFilterList() {
    //If mealtypes are already in cache and the meal types filers has not been built yet:
    if (this.cache.mealTypes.length > 0 && this.mealtypesFilter.length == 0) {
      this.mealtypesFilter.push({ id: "0", name: "Todos", count: 0, checked: false }); //"All mealtypes" filter.
      this.cache.mealTypes.forEach((m: MealType) => {
        this.mealtypesFilter.push({ id: m._id, name: m.name, count: 0, checked: false })
      });
    }
  }

  reset() {
    this.svcInfScroll = new InfiniteScrollingService<Recipe>(PAGE_SIZE);
    this.resetMealTypesFilterCounters();
    this.onDataFeed = this.svcInfScroll.dataFeed;

    this.onDataFeed
      .subscribe((ph: PagingHelper) => {
        this.onDataFeedHandler(ph)
      });

    if (this.isAnyFilterSet) {
      this.getRecipes(this.svcInfScroll.pageSize, 0);
    }
  }

  onScrollEndHandler(e: SCROLL_POSITION) {
    this.svcInfScroll.onScrollEndHandler(e);
  }

  onDataFeedHandler(ph: PagingHelper) {
    this.getRecipes(ph.top, ph.skip);
  }

  fullScrollUp() {
    this.svcInfScroll.fullScrollUp();
  }

  fullScrollDown() {
    this.svcInfScroll.fullScrollDown();
  }

  toggleFiltersVisibility(){
    this.filtersVisible = !this.filtersVisible;
  }

  //#region Meal types filter methods

  getMealtypeFilterById(id: string): any {
    return this.mealtypesFilter.find((item: any) => {
      return item.id == id;
    });
  }

  isMealTypeAll(mealtypeFilter: any): boolean {
    return (mealtypeFilter && mealtypeFilter.id && mealtypeFilter.id == "0");
  }

  getMealtypeAllFilter(): any {
    return this.mealtypesFilter.find((item: any) => {
      return this.isMealTypeAll(item);
    });
  }

  /**
   * Every time the user toggles one of the meal types filters, this method gets called.
   * @param id Mealtype Id.
   */
  toggleMealType(id: string) {

    let mealtypeFilter: any = this.getMealtypeFilterById(id);

    if (mealtypeFilter) {

      if (this.isMealTypeAll(mealtypeFilter)) {
          //If this is the "Todos" option, we uncheck any other option before to continue:
          this.mealtypesFilter
            .filter(item => item.id != mealtypeFilter.id)
            .forEach(item => item.checked = false)
      } else {
        //If is other than "Todos", means we need to uncheck "Todos", (because
        // we are doing a specific mealtypes selection):
        this.getMealtypeAllFilter().checked = false;
      }

      mealtypeFilter.checked = !mealtypeFilter.checked;
    }

    this.reset();
  }

  isMealtypeSelected(id: string): boolean {
    let ret: boolean = false;
    let mealtypeFilter: any = this.getMealtypeFilterById(id);

    if (mealtypeFilter) {
      ret = mealtypeFilter.checked;
    }

    return ret;
  }

  getMealTypesFilter(): string[] {
    let ret: string[] = [];
    let isAllChecked: boolean;

    this.mealtypesFilter.forEach((item: any) =>{
      //The first item in the list is the "Todos" option. So, If it's checked, we 
      //change the isAllChecked flag so every id is pushed into the final list 
      //mealtype ids to include in the query filter: 
      if (item.checked && this.isMealTypeAll(item)) {
        isAllChecked = true;
      }

      //We add the object id to the list, (at least is the "Todos" option 
      //when selected because is not a valid ObjectId):
      if ((item.checked || isAllChecked) && !this.isMealTypeAll(item)) {
        ret.push(item.id);    
      }
    })

    return ret;
  }

  resetMealTypesFilterCounters(): void {
    this.mealtypesFilter.forEach((item: any) => {
      item.count = 0;
    })
  }

  /**
   * This assignto each meal type filter option the amount of reciped found after searching the database. 
   * @param recipes List of recipes to count.
   */
  setMealTypeFilterCounters(recipes: Recipe[]): void {
    let allMealtypesFilter = this.getMealtypeAllFilter();

    recipes.forEach(r => {
      let mealtypeFilter = this.getMealtypeFilterById(r.mealType._id)

      if (mealtypeFilter) {
        mealtypeFilter.count++;
        allMealtypesFilter.count++;
      }
    });
  }

  /**
   * Retrieve the amount of recipes of one specific meal type we got after searching the database.
   * @param id Meal type id.
   */
  getMealTypeFilterCountById(id: string): string {
    let mealtypeFilter: any = this.getMealtypeFilterById(id);
    let ret: string = "";

    if (mealtypeFilter && mealtypeFilter.checked) {
      ret = String(mealtypeFilter.count);

      //If not all the results has been retrieved yet:
      if (this.svcInfScroll.count != this.svcInfScroll.totalCount) {
        ret += "...";
      }
      ret = `(${ret})`;
    }

    return ret;
  }

  //#endregion

  //#region Not published filter methods

  toggleNotPublishedOnly() {
    this.notPublishedOnlyFilter = !this.notPublishedOnlyFilter;
    this.reset();
  }

  //#endregion

  get isAnyFilterSet(): boolean {
    return this.mealtypesFilter.find((item: any) => {
      return item.checked;
    });
  }

  getStatus(r: Recipe): string {
    let ret: string;

    if (r.lastUpdateOn) {
      ret = "Actualizada: " + this.core.helper.friendlyTimeFromNow(r.lastUpdateOn);
    }
    else {
      ret = "Creada: " + this.core.helper.friendlyCalendarTime(r.createdOn);
    }

    return ret;
  }

  getFooterPublishingData(r: Recipe): string {
    let ret: string = "Aún no publicada";

    if (r.publishedOn) {
      ret = this.core.helper.friendlyTimeFromNow(r.publishedOn);
    }

    return ret;
  }

  getPreparationFriendlyTime(r: Recipe): string {
    let ret: string = "";
    
    if (r) {
      ret = this.core.helper.estimatedFriendlyTime(r.estimatedTime);
    }

    return ret;
  }

  getShorterTitle(r: Recipe): string {
    let ret: string = "";
    
    if (r) {
      ret = this.core.helper.getShortText(r.name, 0, 45);
    }

    return ret;
  }

  getShorterDescription(r: Recipe): string {
    let ret: string = "";
    
    if (r) {
      ret = this.core.helper.getShortText(r.description, 0, 75);
    }

    return ret;
  }

  private getRecipes(top: number = 0, skip: number = 0) {

    let q: APIQueryParams = new APIQueryParams();

    if (this.svcInfScroll.model) {
      this.core.toast.showInformation("Estamos trayendo más resultados de tu búsqueda...", "Espera!");
    }

    q.pop = "true";
    q.count = "true";
    q.top = String(top);
    q.skip = String(skip);
    q.fields = "-ingredients -directions";
    q.filter = JSON.stringify({
      mealType: { $in: this.getMealTypesFilter() }
    });
    q.pub = (this.notPublishedOnlyFilter) ? QUERY_PARAM_PUB.notpub : QUERY_PARAM_PUB.all;
    q.owner = QUERY_PARAM_OWNER.me;

    this.asyncInProgress = true;
    this.core.helper.removeTooltips(this.core.zone);

    // this._fakeRecipeGet(300, 1000, q)
    this.svcRecipe.get("", q)
      .subscribe(data => {
        let response: APIResponseParser = new APIResponseParser(data);
        this.svcInfScroll.feed(response.headers.XTotalCount, (response.entities as Recipe[]));
        this.setMealTypeFilterCounters((response.entities as Recipe[]));
        this.asyncInProgress = false;
        this.filtersVisible = false; //Hiding filters on screen to improve usability.
        this.core.helper.removeTooltips(this.core.zone);
      }, err => {
        this.asyncInProgress = false;
        throw err;
      });
  }

  goToRecipeView(id: string) {
    this.core.helper.removeTooltips(this.core.zone);
    this.core.navigate.toRecipeView(id);
  }

  editRecipe(id: string) {
    this.core.helper.removeTooltips(this.core.zone);
    this.core.navigate.toRecipe(id);
  }

  goToRecipe() {
    this.core.helper.removeTooltips(this.core.zone);
    this.core.navigate.toRecipe();
  }

/*  
  //Used for testing purposes only
  private _fakeRecipeGet(totalRecipes: number, timeout: number, q: APIQueryParams) {

    let ret = {
      error: null,
      payload: [],
      headers: {
        XTotalCount: totalRecipes
      }
    }
    let top: number = Number(q.top);
    let skip: number = Number(q.skip);
    
    for (let i = (skip + 1); i < (skip + top + 1); i++) {
      let r: any = new Object()

      r.name = `TEST Recipe #${i}`;
      r.description = `This is a fake recipe created for testing purposes.`;
      r.createdOn = this.core.helper.addDays(new Date(), -i)

      if (i==2) {
        r.lastUpdateOn = this.core.helper.addDays(r.createdOn, -1);
        r.name += "This one with even longest recipe name."
        r.description += "Plus more description here to test long description text handling."
      }

      r.estimatedTime = 30;
      r.level = { name: "Experto" }; // as Level);

      let mealtypeId: number = this.core.helper.getRandomNumberFromInterval(1, this.mealtypesFilter.length-1)
      
      r.mealType = { _id: this.mealtypesFilter[mealtypeId].id, name: this.mealtypesFilter[mealtypeId].name };
      
      ret.payload.push(r);

      if (i == totalRecipes) {
        break;
      }
    }

    return {
      subscribe(callback, err) {
        setTimeout(() => {
          callback(ret)
        }, timeout);
      }
    }
  } 
*/
}
