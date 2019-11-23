import { Component, OnInit, EventEmitter } from '@angular/core';
import { trigger, state, animate, transition, style } from '@angular/animations';

import { CoreService } from "../services/core-service";
import { EntityService } from "../services/entity-service";
import { APIQueryParams, QUERY_PARAM_PUB, QUERY_PARAM_OWNER } from "../services/api-query-params";
import { APIResponseParser } from "../services/api-response-parser";
import { Recipe } from "../model/recipe";
import { InfiniteScrollingService, SCROLL_POSITION, PagingHelper } from "../shared/infinite-scrolling/infinite-scrolling-module";
import { Cache } from '../shared/cache/cache';

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
  asyncInProgress: boolean;
  svcRecipe: EntityService;
  svcInfScroll: InfiniteScrollingService<Recipe>;
  onDataFeed: EventEmitter<PagingHelper>;
  mealTypesFilter: number[];
  notPublishedOnlyFilter: boolean;
  filtersVisible: boolean

  constructor(public core: CoreService,
    public cache: Cache) {
  }

  ngOnInit() {
    //Initializing:
    this.filtersVisible = true;
    this.mealTypesFilter = [];
    this.svcRecipe = this.core.entityFactory.getService("Recipe");
    this.reset();
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

  //This method gets called every time the list of filter options changes
  toggleMealType(id) {

    if (Object.keys(this.mealTypesFilter).indexOf(id) == -1) {
      this.mealTypesFilter[id] = 0; //The number is the count.
    }
    else {
      delete this.mealTypesFilter[id];
    }

    this.reset();
  }

  isMealtypeSelected(id): boolean{
    let ret: boolean = false;

    if (this.mealTypesFilter[id]) {
      ret = true;
    }

    return ret;
  }

  toggleNotPublishedOnly() {
    this.notPublishedOnlyFilter = !this.notPublishedOnlyFilter;
    this.reset();
  }

  get isAnyFilterSet(): boolean {
    return Object.keys(this.mealTypesFilter).length > 0;
  }

  getMealTypesFilter(): string[] {
    return Object.keys(this.mealTypesFilter);
  }

  resetMealTypesFilterCounters(): void {
    Object.keys(this.mealTypesFilter).forEach(id => {
      this.mealTypesFilter[id] = 0;
    })
  }

  setMealTypeFilterCounters(recipes: Recipe[]): void {
    recipes.forEach(r => {
      this.mealTypesFilter[r.mealType._id]++;
    });
  }

  getMealTypeFilterCountById(id: string): string {
    let ret: string = "";

    if (this.mealTypesFilter[id]) {
      ret = String(this.mealTypesFilter[id]);

      //If not all the results has been retrieved yet:
      if (this.svcInfScroll.count != this.svcInfScroll.totalCount) {
        ret += "...";
      }
      ret = `(${ret})`;
    }

    return ret;
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

    // this._fakeRecipeGet(300, 1000, q)
    this.svcRecipe.get("", q)
      .subscribe(data => {
        let response: APIResponseParser = new APIResponseParser(data);
        this.svcInfScroll.feed(response.headers.XTotalCount, (response.entities as Recipe[]));
        this.setMealTypeFilterCounters((response.entities as Recipe[]));
        this.asyncInProgress = false;

        // setTimeout(() => {
          this.filtersVisible = false; //Hiding filters on screen to improve usability.
        // }, 2000);

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
  private _fakeRecipeGet(totalRecipes: number, timeout: number, q: EntityServiceQueryParams) {

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
      r.createdOn = this.helper.addDays(new Date(), -i) //new Date((new Date()).getDate() - i)

      if (i==2) {
        r.lastUpdateOn = this.helper.addDays(r.createdOn, -1);
        r.name += "This one with even longest recipe name."
        r.description += "Plus more description here to test long description text handling."
      }

      r.estimatedTime = 30;
      r.level = { name: "Experto" }; // as Level);
      r.mealType = { _id: "5af1f8fc52bf1d8be0edd3fb", name: "Aperitivo" };
      
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
