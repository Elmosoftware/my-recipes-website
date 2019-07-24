import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

import { CoreService } from "../../services/core-service";
import { Cache } from "../../shared/cache/cache";
import { Recipe } from 'src/app/model/recipe';
import { Ingredient } from "../../model/ingredient";
import { InfiniteScrollingService, SCROLL_POSITION, PagingHelper } from "../../shared/infinite-scrolling/infinite-scrolling-module";
import { APIQueryParams } from 'src/app/services/api-query-params';
import { APIResponseParser } from 'src/app/services/api-response-parser';
import { EntityService } from 'src/app/services/entity-service';
import { EntityServiceFactory } from 'src/app/services/entity-service-factory';
import { SearchResults } from 'src/app/services/search-results';
import { COOKBOOK_TABS, parseCookbookTab } from "../cookbook-tabs";

/**
 * Size of each data page.
 */
const PAGE_SIZE: number = 50;

@Component({
  selector: 'app-inner-cookbook',
  templateUrl: './inner-cookbook.component.html',
  styleUrls: ['./inner-cookbook.component.css']
})
export class InnerCookbookComponent implements OnInit {

  @Input("tab") tabName: string

  tab: COOKBOOK_TABS = null;
  topAnchor: string;
  bottomAnchor: string;
  svcInfScroll: InfiniteScrollingService<Recipe>;
  onDataFeed: EventEmitter<PagingHelper>;
  asyncInProgress: boolean;

  get tabOptions(): any {
    if (this.tab) {
      switch (this.tab) {
        case COOKBOOK_TABS.MealTypes:
          return this.cache.mealTypes
        case COOKBOOK_TABS.Levels:
          return this.cache.levels;
        case COOKBOOK_TABS.PublishingOrder:
          return [
            {
              _id: "1",
              name: "Orden ascendente"
            },
            {
              _id: "2",
              name: "Orden descendente"
            }
          ];
        default:
          throw new Error(`Still need to define the options for the CookbookTab with name "${this.tab}".`)
      }
    }
    else {
      return null
    }
  }

  private _selectedItem: Ingredient;
  private svcRecipe: EntityService;

  constructor(private core: CoreService, private cache: Cache, private svcFactory: EntityServiceFactory) {
  }

  get selectedItem(): Ingredient {
    return this._selectedItem;
  }

  ngOnInit() {
    this.svcRecipe = this.svcFactory.getService("Recipe");
    this.tab = parseCookbookTab(this.tabName);
    this.topAnchor = `top${this.tabName.replace(/ /g, "")}`;
    this.bottomAnchor = `bottom${this.tabName.replace(/ /g, "")}`;
    this.resetSearch();
  }

  itemChange(ing: Ingredient) {
    this._selectedItem = ing;
    console.log(`Active item id is: ${this._selectedItem.name} (${this._selectedItem._id}).`);
    this.search();
  }

  onScrollEndHandler(e: SCROLL_POSITION): void {
    console.log(`Scrolling! ${e}`);
    this.svcInfScroll.onScrollEndHandler(e);
  }

  onDataFeedHandler(ph: PagingHelper): void {
    this.fetchData(ph.top, ph.skip);
  }

  resetSearch() {
    this.svcInfScroll = new InfiniteScrollingService<Recipe>(PAGE_SIZE);
    this.onDataFeed = this.svcInfScroll.dataFeed;

    this.onDataFeed
      .subscribe((ph: PagingHelper) => {
        this.onDataFeedHandler(ph)
      });
  }

  search() {
    this.resetSearch();
    this.fetchData(this.svcInfScroll.pageSize, 0); //Initial data feed
  }

  fetchData(top: number, skip: number): void {

    if (this.svcInfScroll.model) {
      this.core.toast.showInformation("Estamos trayendo más resultados de tu búsqueda...", "Espera!");
    }

    this.asyncInProgress = true;

    this.fetch(top, skip)
      .subscribe((data: SearchResults<Recipe>) => {
        this.svcInfScroll.feed(data.totalCount, data.items);
        this.asyncInProgress = false;
      });
  }

  fetch(top: number, skip: number = 0): Observable<SearchResults<Recipe>> {

    let q: APIQueryParams = new APIQueryParams();

    q.pop = "true";
    q.count = "true";
    q.top = String(top);
    q.skip = String(skip);
    q.fields = "-ingredients -directions";

    this.applyFilterAndsorting(q);

    return this.svcRecipe.get("", q)
      .pipe(
        map((data) => {
          let parser: APIResponseParser = new APIResponseParser(data);
          return new SearchResults<Recipe>(parser);
        })
      );
  }

  applyFilterAndsorting(q: APIQueryParams): void {

    q.filter = ""
    q.sort = ""

    switch (this.tab) {
      case COOKBOOK_TABS.MealTypes:
        q.filter = JSON.stringify({
          mealType: { $in: this.selectedItem._id }
        });
        break;
      case COOKBOOK_TABS.Levels:
        q.filter = JSON.stringify({
          level: { $in: this.selectedItem._id }
        })
        break;
      case COOKBOOK_TABS.PublishingOrder:
        if (this.selectedItem._id == "2") {
          q.sort += "-"
        }
        q.sort += "publishedOn";
        break;
      default:
        throw new Error(`Still need to define the filter and sorting for the CookbookTab with name "${this.tab}".`)
    }
  }

  fullScrollUp() {
    this.svcInfScroll.fullScrollUp();
  }

  fullScrollDown() {
    this.svcInfScroll.fullScrollDown();
  }
}
